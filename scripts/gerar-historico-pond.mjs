import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const FONTES = [
  { caminho: "OCAD_Orcamento_Crianca_Adolescente 2025.xlsx", ano: 2025 },
  { caminho: "OCAD_Orcamento_Crianca_Adolescente-2026.06.xls", ano: 2026 },
];

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return valor;
  const limpo = String(valor).replace(/\./g, "").replace(",", ".").trim();
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
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

function lerPlanilha(caminho, ano) {
  const wb = XLSX.readFile(caminho, { cellText: false, cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
  if (linhas.length < 2) return [];
  const registros = [];
  for (let i = 1; i < linhas.length; i++) {
    const r = linhas[i];
    if (!r || r.length === 0) continue;
    const tipo = String(r[6] ?? "").trim().toUpperCase();
    if (tipo !== "EX" && tipo !== "NEX") continue;
    const fator = tipo === "NEX" ? 0.36 : 1.0;
    const inicial = numero(r[4]) * fator;
    const atual = numero(r[5]) * fator;
    const empenhado = numero(r[9]);
    const liquidado = numero(r[11]);
    const pago = numero(r[13]);
    registros.push({
      ano,
      orgao: String(r[0] ?? "").trim(),
      programa: extrairPrograma(r[2]),
      acao: extrairAcao(r[2]),
      classificacao: classificacaoDe(tipo),
      orcamentoInicial: Math.round(inicial * 100) / 100,
      orcamentoAtual: Math.round(atual * 100) / 100,
      empenhado: Math.round(empenhado * 100) / 100,
      liquidado: Math.round(liquidado * 100) / 100,
      pago: Math.round(pago * 100) / 100,
    });
  }
  return registros;
}

async function main() {
  const todos = [];
  for (const { caminho, ano } of FONTES) {
    const abs = resolve(raiz, caminho);
    const regs = lerPlanilha(abs, ano);
    console.log(`${ano}: ${regs.length} registros`);
    todos.push(...regs);
  }
  const saida = resolve(raiz, "data", "orcamento-historico.json");
  await writeFile(saida, JSON.stringify(todos, null, 2), "utf8");
  const resumo = todos.reduce((acc, r) => {
    acc[r.ano] = acc[r.ano] ?? { inicial: 0, atual: 0, empenhado: 0, liquidado: 0, pago: 0, linhas: 0 };
    acc[r.ano].inicial += r.orcamentoInicial;
    acc[r.ano].atual += r.orcamentoAtual;
    acc[r.ano].empenhado += r.empenhado;
    acc[r.ano].liquidado += r.liquidado;
    acc[r.ano].pago += r.pago;
    acc[r.ano].linhas += 1;
    return acc;
  }, {});
  console.log("--- Resumo por ano (ponderado) ---");
  for (const [ano, v] of Object.entries(resumo)) {
    console.log(
      `${ano}: linhas=${v.linhas} inicial=R$${v.inicial.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} atual=R$${v.atual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} empenhado=R$${v.empenhado.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} liquidado=R$${v.liquidado.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} pago=R$${v.pago.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`,
    );
  }
  console.log(`Gravado em ${saida} (${todos.length} registros)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});