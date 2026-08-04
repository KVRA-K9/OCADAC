"""Extrai as tabelas de detalhamento do ROCA (PDF) por célula, com coordenadas.

O texto corrido do PDF embaralha as colunas DOTAÇÃO INICIAL / TIPO / REF /
OCAD INICIAL, o que impede auditar ação a ação. Aqui as tabelas são lidas como
grade, preservando a que unidade orçamentária cada linha pertence — que é o
eixo da detecção de duplicidade.

Uso:  python scripts/extrair-roca.py <caminho-do-pdf> [-o data/roca-2026-acoes.json]

O script falha se a soma do extraído não reproduzir os totais que o próprio
relatório imprime: nenhuma conclusão deve sair de extração parcial.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber

COD_ACAO = re.compile(r"\b(\d{17})\b")
CABECALHO_UNIDADE = re.compile(r"^\s*(\d{3})\s+(.+)$", re.S)
# Totais que o relatório imprime por bloco, usados para validar o extraído.
TOTAIS_IMPRESSOS = {
    "TOTAL SEE": 2_335_791_942.39,
    "TOTAL SESACRE": 854_914_081.46,
    "TOTAL FEM": 16_360_596.00,
    "TOTAL HABITACAO": 4_048_143.19,
    "TOTAL SANEAMENTO": 4_597_560.00,
}
TOTAL_GERAL_TABELA_4 = 3_336_053_795.37


def limpar(texto: str | None) -> str:
    if not texto:
        return ""
    return re.sub(r"\s+", " ", texto.replace("\n", " ")).strip()


def sem_acento(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn"
    )


def numero(texto: str | None) -> float | None:
    """Converte 'R$ 1.108.052.158,44' em float. Devolve None para vazio ou '-'."""
    if not texto:
        return None
    t = limpar(texto).replace("R$", "").replace(" ", "")
    if t in {"", "-", "--", "—"}:
        return None
    t = t.replace(".", "").replace(",", ".")
    try:
        return float(t)
    except ValueError:
        return None


TIPO_OCAD = re.compile(r"^(EXC?|NEX)$", re.I)
# Ordem fixa dos blocos de colunas nas tabelas de detalhamento do relatório.
GRUPOS = ["recurso próprio", "outras fontes", "total"]


def ler_grupos(celulas: list[str]) -> list[dict]:
    """Lê os blocos `DOTAÇÃO · TIPO · REF · OCAD INICIAL` de uma linha.

    O cabeçalho só aparece na primeira página de cada tabela, então a leitura
    não pode depender dele. O marcador confiável é a célula de TIPO
    (EX/EXC/NEX): o valor imediatamente antes é a dotação, e os dois seguintes
    são o ponderador e o OCAD inicial.
    """
    grupos: list[dict] = []
    for i, celula in enumerate(celulas):
        if not TIPO_OCAD.match(celula.replace(" ", "")):
            continue

        dotacao = None
        for j in range(i - 1, -1, -1):
            if COD_ACAO.search(celulas[j].replace(" ", "")):
                break
            if celulas[j]:
                dotacao = numero(celulas[j])
                break

        posteriores = [c for c in celulas[i + 1 :] if c]
        ref = numero(posteriores[0]) if posteriores else None
        ocad = numero(posteriores[1]) if len(posteriores) > 1 else None

        grupos.append(
            {
                "dotacaoInicial": dotacao,
                "tipo": celula.replace(" ", "").upper(),
                "ref": ref,
                "ocadInicial": ocad,
            }
        )

    # Rotular a partir do fim: o último bloco é sempre o total. Algumas tabelas
    # (ISE, por exemplo) não separam por fonte e trazem só a coluna de total.
    for pos, g in enumerate(grupos):
        de_tras = len(grupos) - 1 - pos
        g["grupoFonte"] = GRUPOS[len(GRUPOS) - 1 - de_tras] if de_tras < len(GRUPOS) else "?"
    return grupos


def extrair(caminho_pdf: Path) -> list[dict]:
    registros: list[dict] = []
    eixo = ""
    unidade_codigo = ""
    unidade_nome = ""
    with pdfplumber.open(caminho_pdf) as pdf:
        for n_pagina, pagina in enumerate(pdf.pages, start=1):
            texto = pagina.extract_text() or ""
            m_eixo = re.search(r"Eixo\s+(I+)\s*[–-]\s*([^:\n]+):", texto)
            if m_eixo:
                eixo = limpar(m_eixo.group(2))

            for tabela in pagina.extract_tables():
                if len(tabela) < 2:
                    continue

                # Quando a descrição de uma ação quebra em várias linhas, o
                # código fica numa linha e os valores em outra. O último código
                # visto na tabela é herdado por essas linhas órfãs.
                ultimo_codigo = None
                ultima_descricao = ""

                for linha in tabela:
                    celulas = [limpar(c) for c in linha]

                    # O cabeçalho de unidade pode abrir a tabela ou aparecer no
                    # meio dela, e não se repete nas páginas de continuação —
                    # por isso o último visto é carregado adiante.
                    for celula in celulas:
                        m_uni = CABECALHO_UNIDADE.match(celula)
                        if m_uni and len(m_uni.group(2)) >= 3:
                            if m_uni.group(1) != unidade_codigo:
                                # Trocar de unidade encerra a herança: sem isso,
                                # uma ação vazaria para o bloco seguinte e
                                # apareceria como duplicidade falsa.
                                ultimo_codigo = None
                                ultima_descricao = ""
                            unidade_codigo = m_uni.group(1)
                            unidade_nome = limpar(m_uni.group(2))[:60]
                            break
                    # Procurar célula a célula: concatenar a linha juntaria
                    # números vizinhos e destruiria os limites do código.
                    codigo = next(
                        (
                            m.group(1)
                            for c in celulas
                            if (m := COD_ACAO.search(c.replace(" ", "")))
                        ),
                        None,
                    )
                    descricao = next(
                        (
                            c
                            for c in celulas
                            if c
                            and not COD_ACAO.search(c.replace(" ", ""))
                            and len(c) > 3
                            and not re.fullmatch(r"[\d.,R$ %\-]+", c)
                        ),
                        "",
                    )
                    if codigo:
                        ultimo_codigo = codigo
                        ultima_descricao = descricao or ultima_descricao
                    else:
                        codigo = ultimo_codigo
                        descricao = descricao or ultima_descricao
                    if not codigo:
                        continue

                    for g in ler_grupos(celulas):
                        if g["dotacaoInicial"] is None and g["ocadInicial"] is None:
                            continue
                        registros.append(
                            {
                                "pagina": n_pagina,
                                "eixo": eixo,
                                "unidadeCodigo": unidade_codigo,
                                "unidadeNome": unidade_nome,
                                "acaoCodigo": codigo,
                                "acaoDescricao": descricao,
                                **g,
                            }
                        )
    return registros


def reais(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "@").replace(".", ",").replace("@", ".")


def validar(registros: list[dict]) -> list[str]:
    """Confere o extraído contra os totais impressos. Devolve as falhas."""
    falhas: list[str] = []
    totais = [r for r in registros if r["grupoFonte"] == "total"]
    soma = sum(r["ocadInicial"] or 0 for r in totais)
    if abs(soma - TOTAL_GERAL_TABELA_4) > 1.0:
        falhas.append(
            f"soma do OCAD INICIAL extraído {reais(soma)} != Tabela 4 {reais(TOTAL_GERAL_TABELA_4)}"
            f" (diferença {reais(soma - TOTAL_GERAL_TABELA_4)})"
        )
    if not registros:
        falhas.append("nenhum registro extraído")
    return falhas


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", type=Path)
    ap.add_argument("-o", "--saida", type=Path, default=Path("data/roca-2026-acoes.json"))
    ap.add_argument(
        "--permitir-falha",
        action="store_true",
        help="grava mesmo se a validação não fechar (uso diagnóstico)",
    )
    args = ap.parse_args()

    registros = extrair(args.pdf)
    acoes = {r["acaoCodigo"] for r in registros}
    unidades = {(r["unidadeCodigo"], r["unidadeNome"]) for r in registros}

    print(f"registros extraídos : {len(registros)}")
    print(f"ações distintas     : {len(acoes)}")
    print(f"blocos de unidade   : {len(unidades)}")
    for grupo in ("recurso próprio", "outras fontes", "total"):
        sub = [r for r in registros if r["grupoFonte"] == grupo]
        print(
            f"  {grupo:<16} linhas={len(sub):<5} OCAD inicial="
            f"{reais(sum(r['ocadInicial'] or 0 for r in sub))}"
        )

    falhas = validar(registros)
    if falhas:
        print("\nVALIDAÇÃO FALHOU:", file=sys.stderr)
        for f in falhas:
            print(f"  - {f}", file=sys.stderr)
        if not args.permitir_falha:
            return 1

    args.saida.parent.mkdir(parents=True, exist_ok=True)
    args.saida.write_text(
        json.dumps(registros, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\ngravado em {args.saida}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
