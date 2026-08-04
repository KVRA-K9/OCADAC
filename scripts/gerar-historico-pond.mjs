/**
 * Gera a série de EXECUÇÃO por exercício a partir das planilhas OCAD, que são a
 * única fonte com empenhado e pago (o painel de orçamentos temáticos publica
 * apenas o liquidado).
 *
 * O exercício de 2026 NÃO entra aqui: vem do painel, via
 * `scripts/gerar-visao-geral.mjs`, que tem data de corte mais recente. Misturar
 * as duas fontes no mesmo ano foi o que produzia números diferentes entre as
 * páginas do site.
 */

import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const FONTES = [
  {
    caminho: "Planilhas/OCAD_Orcamento_Crianca_Adolescente 2025.xlsx",
    ano: 2025,
    dataCorte: "2026-06-23",
  },
];

// Colunas da planilha OCAD. As de índice ímpar a partir de 9 trazem o valor já
// ponderado pelo "Ref. %" — apesar do cabeçalho dizer "% Empenhado" etc.
const COL = {
  orgao: 0,
  funcionalProgramatica: 2,
  orcInicial: 4,
  orcAtual: 5,
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

/** Lê o ponderador da coluna "Ref. %" em vez de assumir 36%. */
function ponderador(linha) {
  const ref = numero(linha[COL.ref]);
  if (ref <= 0 || ref > 100) {
    throw new Error(
      `Ref. % inválido: ${JSON.stringify(linha[COL.ref])} na linha ${JSON.stringify(linha[COL.funcionalProgramatica])}`,
    );
  }
  return ref / 100;
}

function extrairAcao(funcionalProgramatica) {
  const raw = String(funcionalProgramatica ?? "");
  const idx = raw.indexOf(" - ");
  return idx >= 0 ? raw.slice(idx + 3).trim() : raw.trim();
}

function extrairPrograma(funcionalProgramatica) {
  const raw = String(funcionalProgramatica ?? "");
  const idx = raw.indexOf(" - ");
  return idx >= 0 ? raw.slice(0, idx).trim() : "";
}

function classificacaoDe(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  if (t === "EX") return "Exclusivo";
  if (t === "NEX") return "Não exclusivo";
  return t || "Exclusivo";
}

const centavos = (v) => Math.round(v * 100) / 100;

function lerPlanilha(caminho, ano) {
  const wb = XLSX.readFile(caminho, { cellText: false, cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    defval: null,
  });
  if (linhas.length < 2) return [];

  const registros = [];
  for (let i = 1; i < linhas.length; i++) {
    const r = linhas[i];
    if (!r || r.length === 0) continue;
    const tipo = String(r[COL.tipo] ?? "").trim().toUpperCase();
    if (tipo !== "EX" && tipo !== "NEX") continue;

    // Orçamento inicial e atual vêm brutos e precisam ser ponderados aqui;
    // empenhado, liquidado e pago já vêm ponderados da planilha.
    const fator = ponderador(r);
    registros.push({
      ano,
      orgao: String(r[COL.orgao] ?? "").trim(),
      programa: extrairPrograma(r[COL.funcionalProgramatica]),
      acao: extrairAcao(r[COL.funcionalProgramatica]),
      classificacao: classificacaoDe(tipo),
      ponderador: fator,
      ocadInicial: centavos(numero(r[COL.orcInicial]) * fator),
      ocadAtualizado: centavos(numero(r[COL.orcAtual]) * fator),
      ocadEmpenhado: centavos(numero(r[COL.empenhadoPonderado])),
      ocadLiquidado: centavos(numero(r[COL.liquidadoPonderado])),
      ocadPago: centavos(numero(r[COL.pagoPonderado])),
    });
  }
  return registros;
}

async function main() {
  const todos = [];
  const cortes = {};
  for (const { caminho, ano, dataCorte } of FONTES) {
    const regs = lerPlanilha(resolve(raiz, caminho), ano);
    cortes[ano] = { dataCorte, arquivoFonte: caminho.replace(/^Planilhas\//, "") };
    console.log(`${ano}: ${regs.length} registros (corte ${dataCorte})`);
    todos.push(...regs);
  }

  await writeFile(
    resolve(raiz, "data", "orcamento-historico.json"),
    JSON.stringify(todos, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(raiz, "data", "orcamento-historico.meta.json"),
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), cortes }, null, 2),
    "utf8",
  );

  const resumo = todos.reduce((acc, r) => {
    const a = (acc[r.ano] ??= {
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadEmpenhado: 0,
      ocadLiquidado: 0,
      ocadPago: 0,
      linhas: 0,
    });
    a.ocadInicial += r.ocadInicial;
    a.ocadAtualizado += r.ocadAtualizado;
    a.ocadEmpenhado += r.ocadEmpenhado;
    a.ocadLiquidado += r.ocadLiquidado;
    a.ocadPago += r.ocadPago;
    a.linhas += 1;
    return acc;
  }, {});

  const reais = (v) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  console.log("--- Resumo por ano (ponderado) ---");
  for (const [ano, v] of Object.entries(resumo)) {
    console.log(
      `${ano}: linhas=${v.linhas} inicial=${reais(v.ocadInicial)} atualizado=${reais(v.ocadAtualizado)} empenhado=${reais(v.ocadEmpenhado)} liquidado=${reais(v.ocadLiquidado)} pago=${reais(v.ocadPago)}`,
    );
  }
  console.log(`${todos.length} registros gravados em data/orcamento-historico.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
