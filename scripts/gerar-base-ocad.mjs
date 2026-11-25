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
 *      primeiros dígitos da funcional programática), com as exceções em
 *      `scripts/lib/ocad-base.mjs`.
 *
 * Uso: npm run dados [-- caminho/para/planilha.xls] [--dry-run] [--force]
 */

import { stat } from "node:fs/promises";
import { basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import {
  chaveLogicaAcao,
  consolidarRegistrosOcad,
  formatarIsoRioBranco,
  gravarBaseSeAlterada,
  imprimirResumo,
  lerBaseAtual,
  resolverEixo,
  validarSegurancaAtualizacao,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const posicionais = args.filter((a) => !a.startsWith("--"));

const DRY_RUN = flags.has("--dry-run");
const FORCE = flags.has("--force");

// A planilha é reemitida todo mês; a fonte corrente pode ser passada na linha
// de comando — `npm run dados -- Planilhas/Setembro_2026/arquivo.xls` — e, sem
// argumento, fica a do exercício vigente.
const FONTE =
  posicionais[0] ??
  "Planilhas/Setembro_2026/OCAD_Orcamento_Crianca_Adolescente-2776-20261008.xls";
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

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return valor;
  const limpo = String(valor).replace(/\./g, "").replace(",", ".").trim();
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

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
    const chave = chaveLogicaAcao(orgao.codigo, unidade.codigo, programaFuncional);

    const ref = numero(r[COL.ref]) / 100;
    if (ref <= 0 || ref > 1) {
      throw new Error(`Ref. % inválido (${r[COL.ref]}) na ação ${chave}`);
    }

    const eixo = resolverEixo(chave, programaFuncional);
    const classificacao = tipo === "EX" ? "Exclusivo" : "Não exclusivo";

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
      classificacao,
      ponderador: ref,
      fontes: [],
    };

    if (a.ponderador !== ref || a.classificacao !== classificacao) {
      throw new Error(`Tipo ou Ref. % divergente entre as fontes da ação ${chave}`);
    }

    // A mesma linha alimenta a ação e a sua fonte. Como a planilha já vem no
    // grão ação × fonte, o valor por fonte é o da própria linha — não há rateio
    // a fazer, e a soma das fontes fecha com a ação por construção.
    const fonte = separarFonte(r[COL.fonte], chave);
    const inicialBruto = numero(r[COL.inicial]);
    const atualBruto = numero(r[COL.atual]);

    a.fontes.push({
      codigo: fonte.codigo,
      nome: fonte.nome,
      dotacaoInicial: inicialBruto,
      ocadInicial: inicialBruto * ref,
      ocadAtualizado: atualBruto * ref,
      ocadEmpenhado: numero(r[COL.empenhadoPonderado]),
      ocadLiquidado: numero(r[COL.liquidadoPonderado]),
      ocadPago: numero(r[COL.pagoPonderado]),
    });

    acoes.set(chave, a);
  }

  return { itens: [...acoes.values()], linhasUteis };
}

async function main() {
  const caminho = resolve(raiz, FONTE);
  const { itens, linhasUteis } = lerPlanilha(caminho);
  const { mtime } = await stat(caminho);

  const base = consolidarRegistrosOcad(itens, {
    ano: ANO,
    arquivoFonte: basename(FONTE),
    origem: "Planilha OCAD — mesma base do BI",
    origemTipo: "planilha",
    // A planilha não carimba a data de extração; fica registrada a do arquivo.
    dataArquivo: new Date(mtime).toISOString().slice(0, 10),
    atualizadoEm: formatarIsoRioBranco(mtime),
    linhasFonte: linhasUteis,
  });

  const baseAtual = await lerBaseAtual(raiz);
  validarSegurancaAtualizacao(base.registros, base.meta, baseAtual, {
    force: FORCE,
  });

  if (DRY_RUN) {
    console.log("[dry-run] Nenhum arquivo gravado.");
  } else {
    const { alterado } = await gravarBaseSeAlterada(raiz, base, baseAtual);
    if (!alterado) {
      console.log("Base já está atualizada — nenhuma alteração gravada.");
    }
  }

  imprimirResumo(base.meta, { linhasUteis });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
