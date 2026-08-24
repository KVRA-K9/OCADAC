/**
 * Gera a base do site a partir da planilha OCAD — a mesma que alimenta o BI.
 *
 * Formato de entrada (uma linha por ação × fonte de recurso):
 *   Órgão | Unidade | Funcional Programática | Fonte de Recursos | Orç. Inicial |
 *   Orç. Atual | Tipo | Ref. % | Empenhado | % Empenhado | Liquidado |
 *   % Liquidado | Pago | % Pago
 *
 * Duas armadilhas dessa planilha, ambas já verificadas contra o BI:
 *
 *   1. As colunas rotuladas "% Empenhado", "% Liquidado" e "% Pago" NÃO são
 *      percentuais — trazem o valor já ponderado pelo Ref. %. Já "Orç. Inicial"
 *      e "Orç. Atual" vêm brutos e precisam ser ponderados aqui.
 *   2. Não existe coluna de eixo. Ele é derivado da função orçamentária (os dois
 *      primeiros dígitos da funcional programática), com as exceções abaixo.
 *
 * Uso: npm run dados
 */

import { stat, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const FONTE = "Planilhas/OCAD_2026.xlsx";
const ANO = 2026;

const COLUNAS_ESPERADAS = [
  "Órgão",
  "Unidade",
  "Funcional Programática",
  "Fonte de Recursos",
  "Orç. Inicial",
  "Orç. Atual",
  "Tipo",
  "Ref. %",
  "Empenhado",
  "% Empenhado",
  "Liquidado",
  "% Liquidado",
  "Pago",
  "% Pago",
];

const COL = {
  orgao: 0,
  unidade: 1,
  funcional: 2,
  fonte: 3,
  inicial: 4,
  atual: 5,
  tipo: 6,
  ref: 7,
  empenhadoPonderado: 9,
  liquidadoPonderado: 11,
  pagoPonderado: 13,
};

/** Eixo por função orçamentária, conforme a composição do OCAD. */
const EIXO_POR_FUNCAO = {
  "12": "EDUCACAO",
  "13": "EDUCACAO",
  "27": "EDUCACAO",
  "10": "SAUDE",
  "16": "SAUDE",
  "17": "SAUDE",
  "08": "ASSISTENCIA_SOCIAL",
  "14": "ASSISTENCIA_SOCIAL",
};

/**
 * Ações cujo eixo foge da regra por função. A classificação do OCAD é decisão
 * de política pública, não consequência automática da função orçamentária.
 * Confirmadas com a SEPLAN.
 */
const EXCECOES_EIXO = {
  // Ação da SEE: promoção de direitos humanos e diversidade nas escolas.
  "717|001|14422145210430000": "EDUCACAO",
};

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return valor;
  const limpo = String(valor).replace(/\./g, "").replace(",", ".").trim();
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

const centavos = (v) => Math.round(v * 100) / 100;

/** Campos monetários da ação, que a decomposição por fonte precisa reproduzir. */
const CAMPOS_VALOR = [
  "dotacaoInicial",
  "ocadInicial",
  "ocadAtualizado",
  "ocadEmpenhado",
  "ocadLiquidado",
  "ocadPago",
  "ocadDisponivel",
];

/** "Órgão: 714 SECRETARIA DE ESTADO DE ADMINISTRAÇÃO - SEAD" → código e nome. */
function separarCodigoNome(texto, prefixo) {
  const limpo = String(texto ?? "").replace(prefixo, "").trim();
  return { codigo: limpo.slice(0, 3), nome: limpo.slice(3).trim() };
}

/**
 * "15000100 RECURSOS PRÓPRIOS DO TESOURO" → código e nome.
 *
 * A planilha é reemitida a cada mês, então o formato é conferido aqui: um
 * código fora do padrão precisa estourar no `npm run dados`, e não virar uma
 * opção sem sentido no filtro do site.
 */
function separarFonte(texto, chave) {
  const limpo = String(texto ?? "").trim();
  const codigo = limpo.slice(0, 8);
  if (!/^\d{8}$/.test(codigo)) {
    throw new Error(
      `Fonte de Recursos fora do padrão na ação ${chave}: "${limpo}". ` +
        `Esperado um código de 8 dígitos seguido do nome.`,
    );
  }
  return { codigo, nome: limpo.slice(8).trim() };
}

function lerPlanilha(caminho) {
  const wb = XLSX.readFile(caminho, { cellText: false, cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  const cabecalho = (linhas[0] ?? []).map((c) => String(c ?? "").trim());
  const faltando = COLUNAS_ESPERADAS.filter((c) => !cabecalho.includes(c));
  if (faltando.length > 0) {
    throw new Error(
      `Cabeçalho inesperado em ${caminho}.\nColunas ausentes: ${faltando.join(", ")}\nEncontrado: ${cabecalho.join(" | ")}`,
    );
  }

  const acoes = new Map();
  let linhasUteis = 0;

  for (const r of linhas.slice(1)) {
    const tipo = String(r?.[COL.tipo] ?? "").trim().toUpperCase();
    if (tipo !== "EX" && tipo !== "NEX") continue;
    linhasUteis += 1;

    const orgao = separarCodigoNome(r[COL.orgao], "Órgão:");
    const unidade = separarCodigoNome(r[COL.unidade], "Unidade:");
    const funcional = String(r[COL.funcional] ?? "").trim();
    const programaFuncional = funcional.slice(0, 17);
    const chave = `${orgao.codigo}|${unidade.codigo}|${programaFuncional}`;

    const ref = numero(r[COL.ref]) / 100;
    if (ref <= 0 || ref > 1) {
      throw new Error(`Ref. % inválido (${r[COL.ref]}) na ação ${chave}`);
    }

    const eixo = EXCECOES_EIXO[chave] ?? EIXO_POR_FUNCAO[programaFuncional.slice(0, 2)];
    if (!eixo) {
      throw new Error(
        `Sem eixo para a função ${programaFuncional.slice(0, 2)} (ação ${chave}). ` +
          `Acrescente a função em EIXO_POR_FUNCAO ou a ação em EXCECOES_EIXO.`,
      );
    }

    const a = acoes.get(chave) ?? {
      ano: ANO,
      secretariaCodigo: orgao.codigo,
      secretariaNome: orgao.nome,
      unidadeCodigo: unidade.codigo,
      unidadeNome: unidade.nome,
      acaoCodigo: programaFuncional.slice(-8),
      acao: funcional.slice(20).trim(),
      programaFuncional,
      eixo,
      classificacao: tipo === "EX" ? "Exclusivo" : "Não exclusivo",
      ponderador: ref,
      fontes: new Map(),
      dotacaoInicial: 0,
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadEmpenhado: 0,
      ocadLiquidado: 0,
      ocadPago: 0,
    };

    if (a.ponderador !== ref || a.classificacao !== (tipo === "EX" ? "Exclusivo" : "Não exclusivo")) {
      throw new Error(`Tipo ou Ref. % divergente entre as fontes da ação ${chave}`);
    }

    // A mesma linha alimenta a ação e a sua fonte. Como a planilha já vem no
    // grão ação × fonte, o valor por fonte é o da própria linha — não há rateio
    // a fazer, e a soma das fontes fecha com a ação por construção.
    const fonte = separarFonte(r[COL.fonte], chave);
    const f = a.fontes.get(fonte.codigo) ?? {
      codigo: fonte.codigo,
      nome: fonte.nome,
      dotacaoInicial: 0,
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadEmpenhado: 0,
      ocadLiquidado: 0,
      ocadPago: 0,
    };

    for (const alvo of [a, f]) {
      alvo.dotacaoInicial += numero(r[COL.inicial]);
      alvo.ocadInicial += numero(r[COL.inicial]) * ref;
      alvo.ocadAtualizado += numero(r[COL.atual]) * ref;
      alvo.ocadEmpenhado += numero(r[COL.empenhadoPonderado]);
      alvo.ocadLiquidado += numero(r[COL.liquidadoPonderado]);
      alvo.ocadPago += numero(r[COL.pagoPonderado]);
    }

    a.fontes.set(fonte.codigo, f);
    acoes.set(chave, a);
  }

  const registros = [...acoes.values()].map((a) => {
    const ocadAtualizado = centavos(a.ocadAtualizado);
    const ocadLiquidado = centavos(a.ocadLiquidado);

    const fontes = [...a.fontes.values()]
      .map((f) => {
        const atualizado = centavos(f.ocadAtualizado);
        const liquidado = centavos(f.ocadLiquidado);
        return {
          codigo: f.codigo,
          nome: f.nome,
          dotacaoInicial: centavos(f.dotacaoInicial),
          ocadInicial: centavos(f.ocadInicial),
          ocadAtualizado: atualizado,
          ocadEmpenhado: centavos(f.ocadEmpenhado),
          ocadLiquidado: liquidado,
          ocadPago: centavos(f.ocadPago),
          ocadDisponivel: centavos(atualizado - liquidado),
        };
      })
      .sort((x, y) => y.ocadInicial - x.ocadInicial);

    const registro = {
      ...a,
      fontes,
      dotacaoInicial: centavos(a.dotacaoInicial),
      ocadInicial: centavos(a.ocadInicial),
      ocadAtualizado,
      ocadEmpenhado: centavos(a.ocadEmpenhado),
      ocadLiquidado,
      ocadPago: centavos(a.ocadPago),
      // A planilha não traz saldo disponível; ele é derivado dos ponderados.
      ocadDisponivel: centavos(ocadAtualizado - ocadLiquidado),
    };

    /*
     * O filtro por fonte recorta a tabela somando as fontes escolhidas. Se a
     * soma das partes não fechar com o todo, o total sem filtro e o total com
     * todas as fontes marcadas divergiriam.
     *
     * A comparação é em centavos inteiros, e a folga é de um centavo por fonte:
     * cada parcela é arredondada por si, então N fontes acumulam até N centavos
     * de desvio contra o total, que foi arredondado uma vez só. Qualquer coisa
     * além disso é erro de leitura, não arredondamento.
     */
    for (const campo of CAMPOS_VALOR) {
      const soma = fontes.reduce((t, f) => t + Math.round(f[campo] * 100), 0);
      if (Math.abs(soma - Math.round(registro[campo] * 100)) > fontes.length) {
        throw new Error(
          `Soma das fontes diverge do total da ação em ${campo}: ` +
            `${soma / 100} ≠ ${registro[campo]} (${a.secretariaCodigo}|${a.unidadeCodigo}|${a.programaFuncional})`,
        );
      }
    }

    return registro;
  });

  return { registros, linhasUteis };
}

const reais = (v) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function main() {
  const caminho = resolve(raiz, FONTE);
  const { registros, linhasUteis } = lerPlanilha(caminho);

  const soma = (campo) => centavos(registros.reduce((t, r) => t + r[campo], 0));
  const porClassificacao = registros.reduce((acc, r) => {
    const a = (acc[r.classificacao] ??= { acoes: 0, ocadInicial: 0, ocadLiquidado: 0 });
    a.acoes += 1;
    a.ocadInicial = centavos(a.ocadInicial + r.ocadInicial);
    a.ocadLiquidado = centavos(a.ocadLiquidado + r.ocadLiquidado);
    return acc;
  }, {});

  const { mtime } = await stat(caminho);

  const meta = {
    arquivoFonte: FONTE.replace("Planilhas/", ""),
    origem: "Planilha OCAD — mesma base do BI",
    // A planilha não carimba a data de extração; fica registrada a do arquivo.
    dataArquivo: new Date(mtime).toISOString().slice(0, 10),
    geradoEm: new Date().toISOString().slice(0, 10),
    anos: [ANO],
    linhasFonte: linhasUteis,
    acoes: registros.length,
    fontesDistintas: new Set(
      registros.flatMap((r) => r.fontes.map((f) => f.codigo)),
    ).size,
    eixoDerivado: true,
    totais: {
      dotacaoInicial: soma("dotacaoInicial"),
      ocadInicial: soma("ocadInicial"),
      ocadAtualizado: soma("ocadAtualizado"),
      ocadEmpenhado: soma("ocadEmpenhado"),
      ocadLiquidado: soma("ocadLiquidado"),
      ocadPago: soma("ocadPago"),
      ocadDisponivel: soma("ocadDisponivel"),
    },
    porClassificacao,
  };

  await writeFile(
    resolve(raiz, "data", "base-ocad.json"),
    JSON.stringify(registros, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(raiz, "data", "base-ocad.meta.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );

  console.log(`Fonte: ${meta.arquivoFonte} (arquivo de ${meta.dataArquivo})`);
  console.log(`${linhasUteis} linhas → ${registros.length} ações`);
  console.log("--- Totais ponderados ---");
  console.log(`OCAD Inicial:    ${reais(meta.totais.ocadInicial)}`);
  console.log(`OCAD Atualizado: ${reais(meta.totais.ocadAtualizado)}`);
  console.log(`OCAD Empenhado:  ${reais(meta.totais.ocadEmpenhado)}`);
  console.log(`OCAD Liquidado:  ${reais(meta.totais.ocadLiquidado)}`);
  console.log(`OCAD Pago:       ${reais(meta.totais.ocadPago)}`);
  console.log(`OCAD Disponível: ${reais(meta.totais.ocadDisponivel)}`);
  for (const [k, v] of Object.entries(porClassificacao)) {
    console.log(`  ${k}: ${v.acoes} ações | inicial ${reais(v.ocadInicial)}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
