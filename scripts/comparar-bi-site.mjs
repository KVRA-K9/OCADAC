/**
 * Compara as duas bases do OCAD 2026:
 *
 *   BI    — Planilhas/OCAD_2026.xlsx            (formato por fonte de recurso)
 *   SITE  — Planilhas/orcamentos-tematicos-...  (formato consolidado por ação)
 *
 * A chave de cruzamento é órgão + unidade + funcional programática. A planilha
 * do BI é agregada por essa chave antes da comparação, porque ela detalha cada
 * fonte de recurso separadamente.
 *
 * Uso: node scripts/comparar-bi-site.mjs [arquivo-do-site.xlsx]
 */

import { readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PASTA = resolve(raiz, "Planilhas");
const ARQUIVO_BI = "OCAD_2026.xlsx";

/**
 * Ações cujo eixo foge da regra por função e está correto assim — a
 * classificação do OCAD é uma decisão de política pública, não uma consequência
 * automática da função orçamentária. Confirmadas com a SEPLAN.
 */
const EXCECOES_EIXO = {
  // Ação da SEE: promoção de direitos humanos e diversidade nas escolas.
  "717|001|14422145210430000": "EDUCACAO",
};

// Eixo esperado a partir da função orçamentária (2 primeiros dígitos da
// funcional programática), conforme a divisão em três eixos do OCAD.
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

const numero = (v) => {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/\./g, "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
};

const reais = (v) =>
  `R$ ${(v ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const titulo = (t) => console.log(`\n${"=".repeat(80)}\n${t}\n${"=".repeat(80)}`);
const normalizar = (s) =>
  String(s ?? "").toUpperCase().replace(/\s+/g, " ").replace(/[.\-—]/g, "").trim();

/** Agrega a planilha do BI por órgão + unidade + ação, aplicando o Ref. %. */
function lerBI() {
  const wb = XLSX.readFile(resolve(PASTA, ARQUIVO_BI));
  const linhas = XLSX.utils
    .sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
      header: 1,
      blankrows: false,
      defval: null,
    })
    .slice(1)
    .filter((r) => ["EX", "NEX"].includes(String(r?.[6]).trim().toUpperCase()));

  const mapa = new Map();
  for (const r of linhas) {
    const orgao = String(r[0]).replace("Órgão: ", "").trim();
    const unidade = String(r[1]).replace("Unidade: ", "").trim();
    const fp = String(r[2]).trim();
    const chave = `${orgao.slice(0, 3)}|${unidade.slice(0, 3)}|${fp.slice(0, 17)}`;
    const ref = numero(r[7]) / 100;

    const a = mapa.get(chave) ?? {
      chave,
      orgao: orgao.slice(0, 3),
      unidade: unidade.slice(0, 3),
      acaoCodigo: fp.slice(0, 17),
      descricao: fp.slice(20).trim(),
      tipo: String(r[6]).trim().toUpperCase(),
      ref,
      fontes: new Set(),
      dotacaoInicial: 0,
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadEmpenhado: 0,
      ocadLiquidado: 0,
      ocadPago: 0,
    };
    a.fontes.add(String(r[3]).slice(0, 8));
    a.dotacaoInicial += numero(r[4]);
    a.ocadInicial += numero(r[4]) * ref;
    a.ocadAtualizado += numero(r[5]) * ref;
    // As colunas rotuladas "% Empenhado/Liquidado/Pago" trazem o valor já
    // ponderado, apesar do nome.
    a.ocadEmpenhado += numero(r[9]);
    a.ocadLiquidado += numero(r[11]);
    a.ocadPago += numero(r[13]);
    mapa.set(chave, a);
  }
  return mapa;
}

async function arquivoDoSite(informado) {
  if (informado) return informado;
  const arquivos = await readdir(PASTA);
  const candidatos = arquivos
    .filter((n) => /^orcamentos-tematicos-visao-geral-.*\.xlsx$/i.test(n))
    .sort();
  if (!candidatos.length) throw new Error("Nenhum export do painel em Planilhas/");
  return candidatos[candidatos.length - 1];
}

function lerSite(nome) {
  const wb = XLSX.readFile(resolve(PASTA, nome));
  const registros = XLSX.utils
    .sheet_to_json(wb.Sheets["Visão Geral"], { defval: null })
    .filter((r) => String(r["Tema"] ?? "").trim().toUpperCase() === "OCAD");

  const mapa = new Map();
  for (const r of registros) {
    const chave = `${r["Código secretaria"]}|${r["Código unidade"]}|${r["Programa funcional"]}`;
    mapa.set(chave, {
      chave,
      orgao: String(r["Código secretaria"]),
      unidade: String(r["Código unidade"]),
      acaoCodigo: String(r["Programa funcional"]),
      descricao: String(r["Ação"]),
      tipo: r["Classificação"] === "Exclusivo" ? "EX" : "NEX",
      ref: r["Ponderador"],
      eixo: String(r["Eixo"]).trim(),
      dotacaoInicial: r["Orçamento inicial"],
      ocadInicial: r["Planejado ponderado"],
      ocadAtualizado: r["Orçamento atualizado ponderado"],
      ocadLiquidado: r["Liquidado ponderado"],
    });
  }
  return mapa;
}

async function main() {
  const nomeSite = await arquivoDoSite(process.argv[2]);
  const bi = lerBI();
  const site = lerSite(nomeSite);

  console.log(`BI   : ${ARQUIVO_BI}  (${bi.size} ações)`);
  console.log(`SITE : ${nomeSite}  (${site.size} ações)`);

  /* ---------------- 1. ações presentes em só uma das bases -------------- */
  titulo("1. AÇÕES PRESENTES EM APENAS UMA DAS BASES");
  const soBI = [...bi.values()].filter((a) => !site.has(a.chave));
  const soSite = [...site.values()].filter((a) => !bi.has(a.chave));
  console.log(`só no BI   : ${soBI.length}`);
  for (const a of soBI)
    console.log(`   ${a.orgao}/${a.unidade}  ${a.acaoCodigo}  ${reais(a.ocadInicial).padStart(20)}  ${a.descricao.slice(0, 44)}`);
  console.log(`só no SITE : ${soSite.length}`);
  for (const a of soSite)
    console.log(`   ${a.orgao}/${a.unidade}  ${a.acaoCodigo}  ${reais(a.ocadInicial).padStart(20)}  ${a.descricao.slice(0, 44)}`);

  /* ---------------- 2. divergências campo a campo ---------------- */
  const comuns = [...bi.values()].filter((a) => site.has(a.chave));
  const grupos = {
    "classificação (EX/NEX)": [],
    ponderador: [],
    "dotação inicial (bruta)": [],
    "OCAD inicial": [],
    "OCAD atualizado": [],
    "OCAD liquidado": [],
    descrição: [],
  };
  for (const a of comuns) {
    const b = site.get(a.chave);
    const dif = (x, y) => Math.abs((x ?? 0) - (y ?? 0)) > 0.05;
    if (a.tipo !== b.tipo) grupos["classificação (EX/NEX)"].push([a, b, "tipo"]);
    if (Math.abs(a.ref - b.ref) > 0.001) grupos.ponderador.push([a, b, "ref"]);
    if (dif(a.dotacaoInicial, b.dotacaoInicial))
      grupos["dotação inicial (bruta)"].push([a, b, "dotacaoInicial"]);
    if (dif(a.ocadInicial, b.ocadInicial)) grupos["OCAD inicial"].push([a, b, "ocadInicial"]);
    if (dif(a.ocadAtualizado, b.ocadAtualizado))
      grupos["OCAD atualizado"].push([a, b, "ocadAtualizado"]);
    if (dif(a.ocadLiquidado, b.ocadLiquidado))
      grupos["OCAD liquidado"].push([a, b, "ocadLiquidado"]);
    if (normalizar(a.descricao) !== normalizar(b.descricao))
      grupos.descrição.push([a, b, "descricao"]);
  }

  titulo("2. DIVERGÊNCIAS CAMPO A CAMPO (nas ações comuns)");
  for (const [nome, lista] of Object.entries(grupos)) {
    console.log(`\n${nome}: ${lista.length}`);
    if (lista.length === 0) continue;
    const numerico = !["classificação (EX/NEX)", "descrição"].includes(nome);
    if (numerico) {
      const soma = lista.reduce((t, [a, b, c]) => t + (b[c] - a[c]), 0);
      const maiorNoSite = lista.filter(([a, b, c]) => b[c] > a[c]).length;
      console.log(
        `   site maior em ${maiorNoSite} · BI maior em ${lista.length - maiorNoSite} · soma das diferenças ${reais(soma)}`,
      );
    }
    for (const [a, b, campo] of lista
      .slice()
      .sort((x, y) => Math.abs(y[1][y[2]] - y[0][y[2]]) - Math.abs(x[1][x[2]] - x[0][x[2]]))
      .slice(0, 60)) {
      const mostrar = (v) =>
        typeof v === "number" ? reais(v).padStart(22) : String(v).padStart(22);
      console.log(`   ${a.orgao}/${a.unidade} ${a.acaoCodigo}  ${a.descricao.slice(0, 40)}`);
      console.log(
        `        BI ${mostrar(a[campo])}   site ${mostrar(b[campo])}` +
          (typeof a[campo] === "number" ? `   Δ ${reais(b[campo] - a[campo])}` : ""),
      );
    }
  }

  /* ---------------- 3. eixo do site x função orçamentária ---------------- */
  titulo("3. EIXO ATRIBUÍDO NO SITE × FUNÇÃO ORÇAMENTÁRIA DA AÇÃO");
  console.log(
    "O eixo só existe na base do site. Aqui ele é conferido contra a função da\n" +
      "funcional programática, que é o critério de composição do OCAD.\n",
  );
  const eixoErrado = [];
  let excecoesAplicadas = 0;
  for (const b of site.values()) {
    const excecao = EXCECOES_EIXO[b.chave];
    if (excecao) {
      if (excecao === b.eixo) {
        excecoesAplicadas++;
        continue;
      }
      // A exceção deixou de valer: o eixo mudou para algo que não é nem a
      // regra nem o combinado. Melhor acusar do que silenciar.
    }
    const esperado = EIXO_POR_FUNCAO[b.acaoCodigo.slice(0, 2)];
    if (esperado && esperado !== b.eixo) eixoErrado.push([b, excecao ?? esperado]);
  }
  console.log(
    `divergências: ${eixoErrado.length}` +
      (excecoesAplicadas ? ` (${excecoesAplicadas} exceção(ões) confirmada(s) ignorada(s))` : ""),
  );
  for (const [b, esperado] of eixoErrado.sort((x, y) => y[0].ocadInicial - x[0].ocadInicial)) {
    console.log(
      `   ${b.orgao}/${b.unidade}  ${b.acaoCodigo}  ${reais(b.ocadInicial).padStart(20)}`,
    );
    console.log(
      `        eixo no site: ${b.eixo.padEnd(20)} esperado pela função ${b.acaoCodigo.slice(0, 2)}: ${esperado}`,
    );
    console.log(`        ${b.descricao.slice(0, 60)}`);
  }

  /* ---------------- 4. totais ---------------- */
  titulo("4. TOTAIS");
  const soma = (m, c) => [...m.values()].reduce((t, r) => t + (r[c] ?? 0), 0);
  const linha = (rot, x, y) =>
    console.log(`${rot.padEnd(20)} BI ${reais(x).padStart(22)}   site ${reais(y).padStart(22)}   Δ ${reais(y - x).padStart(20)}`);
  linha("OCAD inicial", soma(bi, "ocadInicial"), soma(site, "ocadInicial"));
  linha("OCAD atualizado", soma(bi, "ocadAtualizado"), soma(site, "ocadAtualizado"));
  linha("OCAD liquidado", soma(bi, "ocadLiquidado"), soma(site, "ocadLiquidado"));
  console.log(
    `\nsó no BI: empenhado ${reais(soma(bi, "ocadEmpenhado"))} · pago ${reais(soma(bi, "ocadPago"))}`,
  );
  const fontes = new Set();
  for (const a of bi.values()) for (const x of a.fontes) fontes.add(x);
  console.log(
    `só no BI: detalhe por fonte de recurso (${fontes.size} fontes) — o export do painel consolida`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
