"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { agregarOrgaos, type LinhaOrgao } from "@/data/base-ocad";
import { CORES_EIXO, corSecretaria, nomeOrgao, siglaOrgao } from "@/lib/estagios";
import { formatMoeda, formatParticipacao } from "@/lib/format";
import type { OrcamentoItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Chave =
  | "nome"
  | "ocadAtualizado"
  | "exclusivo"
  | "naoExclusivo"
  | "classificacao"
  | "eixos";

type Coluna = {
  chave: Chave;
  rotulo: string;
  numerica?: boolean;
};

const COLUNAS: Coluna[] = [
  { chave: "nome", rotulo: "Órgão" },
  { chave: "ocadAtualizado", rotulo: "Orçamento atualizado", numerica: true },
  { chave: "exclusivo", rotulo: "Exclusivo", numerica: true },
  { chave: "naoExclusivo", rotulo: "Não exclusivo", numerica: true },
  { chave: "classificacao", rotulo: "Classificação" },
  { chave: "eixos", rotulo: "Eixos" },
];

/**
 * Valor de ordenação de cada coluna. As duas últimas não são números na tela:
 * a classificação ordena pela fatia exclusiva do órgão, e o eixo pela
 * quantidade deles — é o que aproxima linhas parecidas uma da outra.
 */
function criterio(linha: LinhaOrgao, chave: Chave): number {
  switch (chave) {
    case "classificacao":
      return linha.ocadAtualizado > 0 ? linha.exclusivo / linha.ocadAtualizado : 0;
    case "eixos":
      return linha.funcoes.length;
    case "nome":
      return 0;
    default:
      return linha[chave];
  }
}

/** Linhas por página. Nove órgãos cabem em uma, mas os filtros não mudam isso. */
const TAMANHO_PAGINA = 10;

/**
 * Visão em tabela plana: uma linha por órgão, com a execução consolidada.
 *
 * É o resumo do mesmo recorte que a visão detalhada abre em três níveis —
 * quem quer comparar secretarias entre si não precisa expandir nada.
 */
export function TabelaOrgaos({ data }: { data: OrcamentoItem[] }) {
  const [ordem, setOrdem] = React.useState<{ chave: Chave; desc: boolean }>({
    chave: "ocadAtualizado",
    desc: true,
  });
  const [pagina, setPagina] = React.useState(0);

  const total = React.useMemo(
    () => data.reduce((t, i) => t + i.valores.ocadAtualizado, 0),
    [data],
  );

  const linhas = React.useMemo(() => {
    const orgaos = agregarOrgaos(data);
    const { chave, desc } = ordem;
    return orgaos.sort((a, b) => {
      if (chave === "nome") {
        const cmp = siglaOrgao(a.orgao).localeCompare(siglaOrgao(b.orgao), "pt-BR");
        return desc ? -cmp : cmp;
      }
      const diff = criterio(a, chave) - criterio(b, chave);
      return desc ? -diff : diff;
    });
  }, [data, ordem]);

  // Ajuste de estado durante o render: quando a lista muda de identidade
  // (filtro ou ordenação), a página volta ao início. Um efeito aqui
  // renderizaria uma vez com a página errada antes de corrigir.
  const [linhasVistas, setLinhasVistas] = React.useState(linhas);
  if (linhas !== linhasVistas) {
    setLinhasVistas(linhas);
    setPagina(0);
  }

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaAtual * TAMANHO_PAGINA;
  const fim = Math.min(inicio + TAMANHO_PAGINA, linhas.length);
  const paginaDados = linhas.slice(inicio, fim);

  function alternar(chave: Chave) {
    setOrdem((atual) =>
      atual.chave === chave ? { chave, desc: !atual.desc } : { chave, desc: true },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            {/* Faixa de fundo no cabeçalho, e o hover neutralizado para ela não
                reagir como as linhas de dados. */}
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {COLUNAS.map((coluna) => {
                const ativa = ordem.chave === coluna.chave;
                return (
                  <TableHead
                    key={coluna.rotulo}
                    className={coluna.numerica ? "text-right" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => alternar(coluna.chave)}
                      aria-label={`Ordenar por ${coluna.rotulo}`}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground",
                        // Nas colunas de valor o ícone vai para a esquerda do
                        // rótulo, senão ele descolaria da borda direita.
                        coluna.numerica && "flex-row-reverse",
                        ativa && "text-foreground",
                      )}
                    >
                      {coluna.rotulo}
                      {ativa ? (
                        ordem.desc ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUp className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginaDados.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUNAS.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              paginaDados.map((linha) => (
                <LinhaTabela key={linha.orgaoCodigo} linha={linha} total={total} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé: contagem à esquerda, navegação de página à direita. Os botões
          de exportação continuam levando o recorte inteiro, e não a página. */}
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {linhas.length === 0 ? (
            "Nenhum órgão"
          ) : (
            <>
              Mostrando {inicio + 1}–{fim} de {linhas.length}{" "}
              {linhas.length === 1 ? "órgão" : "órgãos"} · total{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatMoeda(total)}
              </span>
            </>
          )}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={paginaAtual === 0}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="tabular-nums">
            {paginaAtual + 1} / {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Próxima página"
            disabled={paginaAtual >= totalPaginas - 1}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LinhaTabela({ linha, total }: { linha: LinhaOrgao; total: number }) {
  return (
    <TableRow>
      <TableCell
        className="max-w-80"
        style={{ borderLeft: `3px solid ${corSecretaria(linha.orgao)}` }}
      >
        <span className="block font-medium">{siglaOrgao(linha.orgao)}</span>
        <span className="block text-xs text-muted-foreground">
          {linha.orgaoCodigo} · {linha.unidades}{" "}
          {linha.unidades === 1 ? "unidade" : "unidades"} · {linha.acoes}{" "}
          {linha.acoes === 1 ? "ação" : "ações"}
        </span>
        <span className="block text-xs text-muted-foreground">
          {nomeOrgao(linha.orgao)}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatMoeda(linha.ocadAtualizado)}
        <span className="block text-xs font-normal text-muted-foreground">
          {formatParticipacao(total > 0 ? linha.ocadAtualizado / total : 0)}
        </span>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatMoeda(linha.exclusivo)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatMoeda(linha.naoExclusivo)}
      </TableCell>
      <TableCell>
        <Classificacao linha={linha} />
      </TableCell>
      <TableCell>
        <span className="flex flex-wrap gap-1">
          {linha.funcoes.map((funcao) => (
            <span
              key={funcao}
              title={funcao}
              className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs"
            >
              <span
                aria-hidden
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: CORES_EIXO[funcao] }}
              />
              {funcao}
            </span>
          ))}
        </span>
      </TableCell>
    </TableRow>
  );
}

/**
 * No OCAD a classificação é da ação, não do órgão: quase toda secretaria
 * executa os dois tipos, e é ela que define o ponderador — exclusiva entra a
 * 100%, não exclusiva a 36%.
 *
 * Por isso o badge traz a composição inteira, em vez de um "misto" que serviria
 * à SEE (97% exclusiva) e à SESACRE (2%) com a mesma palavra. O tipo que
 * predomina vem primeiro, e o outro logo atrás com a fatia que falta para
 * fechar 100% — ler os dois lados não deveria exigir uma subtração de cabeça.
 *
 * O rótulo puro, sem percentual, é o que sinaliza que o órgão é todo de um
 * tipo.
 */
function Classificacao({ linha }: { linha: LinhaOrgao }) {
  if (linha.naoExclusivo === 0) return <Badge>Exclusivo</Badge>;
  if (linha.exclusivo === 0) return <Badge variant="secondary">Não exclusivo</Badge>;

  const total = linha.exclusivo + linha.naoExclusivo;
  const predomina = linha.exclusivo >= linha.naoExclusivo;

  const partes = [
    { rotulo: "Exclusivo", valor: linha.exclusivo },
    { rotulo: "Não exclusivo", valor: linha.naoExclusivo },
  ];
  if (!predomina) partes.reverse();

  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {partes.map((parte, i) => (
        <React.Fragment key={parte.rotulo}>
          {i > 0 ? <span className="text-muted-foreground">·</span> : null}
          {parte.rotulo}{" "}
          <span className="tabular-nums">{formatParticipacao(parte.valor / total)}</span>
        </React.Fragment>
      ))}
    </Badge>
  );
}
