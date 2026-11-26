/**
 * Importa em lote planilhas mensais do OCAD exportadas do SICAF (`app.wprelocad`)
 * a partir de uma pasta local (ex.: `SICAF/2025`), gravando os cortes mensais
 * em `public/data/meses/<ano>-<mm>.json` e atualizando `data/base-ocad-meses.json`.
 *
 * Uso:
 *   npm run dados:pasta -- SICAF/2025 --ano=2025
 *   npm run dados:pasta -- SICAF/2025 --ano=2025 --dry-run
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  chaveCorteMensal,
  consolidarRegistrosOcad,
  formatarIsoRioBranco,
  gravarCorteMensal,
  lerCorteMensal,
  lerPlanilhaOcadBuffer,
  reais,
  validarSegurancaAtualizacao,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const MESES_PT = [
  ["JANEIRO", 1],
  ["FEVEREIRO", 2],
  ["MARÇO", 3],
  ["MARCO", 3],
  ["ABRIL", 4],
  ["MAIO", 5],
  ["JUNHO", 6],
  ["JULHO", 7],
  ["AGOSTO", 8],
  ["SETEMBRO", 9],
  ["OUTUBRO", 10],
  ["NOVEMBRO", 11],
  ["DEZEMBRO", 12],
];

function detectarMes(nomeArquivo) {
  const upper = nomeArquivo.toUpperCase();
  for (const [rotulo, mes] of MESES_PT) {
    if (upper.includes(rotulo)) return mes;
  }
  const mNum = nomeArquivo.match(/(?:^|[-_.\s])(0?[1-9]|1[0-2])(?:[-_.\s]|$)/);
  if (mNum) return Number(mNum[1]);
  throw new Error(`Não foi possível identificar o mês no arquivo "${nomeArquivo}".`);
}

function detectarDataArquivo(nomeArquivo, mtime) {
  const m = nomeArquivo.match(/(\d{4})(\d{2})(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return new Date(mtime).toISOString().slice(0, 10);
}

function lerArgs(argv) {
  const opts = { pasta: null, ano: null, dryRun: false, force: false };
  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--force") opts.force = true;
    else if (arg.startsWith("--ano=")) opts.ano = Number(arg.slice("--ano=".length));
    else if (!arg.startsWith("--") && !opts.pasta) opts.pasta = arg;
    else throw new Error(`Argumento inválido: ${arg}`);
  }
  if (!opts.pasta) {
    throw new Error("Informe o caminho da pasta, ex.: npm run dados:pasta -- SICAF/2025 --ano=2025");
  }
  if (!Number.isInteger(opts.ano) || opts.ano < 2000 || opts.ano > 2100) {
    throw new Error("Informe um exercício válido com --ano=AAAA (ex.: --ano=2025).");
  }
  return opts;
}

async function main() {
  const opts = lerArgs(process.argv.slice(2));
  const dir = resolve(raiz, opts.pasta);
  const entradas = await readdir(dir);
  const planilhas = entradas.filter((f) => {
    const ext = extname(f).toLowerCase();
    return (ext === ".xls" || ext === ".xlsx") && !f.startsWith("~$");
  });

  if (planilhas.length === 0) {
    throw new Error(`Nenhuma planilha .xls/.xlsx encontrada em ${dir}.`);
  }

  const lote = planilhas
    .map((arquivo) => ({ arquivo, mes: detectarMes(arquivo) }))
    .sort((a, b) => a.mes - b.mes);

  for (const { arquivo, mes } of lote) {
    const caminho = resolve(dir, arquivo);
    const [buffer, { mtime }] = await Promise.all([readFile(caminho), stat(caminho)]);
    const { itens, linhasUteis } = lerPlanilhaOcadBuffer(buffer, {
      ano: opts.ano,
      origem: arquivo,
    });

    const base = consolidarRegistrosOcad(itens, {
      ano: opts.ano,
      arquivoFonte: arquivo,
      origem: "SICAF/SEFAZ — Relatório OCAD (app.wprelocad)",
      origemTipo: "sicaf",
      dataArquivo: detectarDataArquivo(arquivo, mtime),
      atualizadoEm: formatarIsoRioBranco(mtime),
      linhasFonte: linhasUteis,
      mesReferencia: mes,
    });

    const chave = chaveCorteMensal(opts.ano, mes);
    const corteAtual = await lerCorteMensal(raiz, chave);
    validarSegurancaAtualizacao(base.registros, base.meta, corteAtual, {
      force: opts.force,
    });

    if (opts.dryRun) {
      console.log(`[dry-run] ${chave}: ${base.meta.acoes} ações | Liquidado ${reais(base.meta.totais.ocadLiquidado)}`);
    } else {
      const res = await gravarCorteMensal(raiz, opts.ano, mes, base);
      console.log(
        `${chave}: ${base.meta.acoes} ações (${linhasUteis} linhas) | Liquidado ${reais(base.meta.totais.ocadLiquidado)}${res.alterado ? " [gravado]" : " [sem alterações]"}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
