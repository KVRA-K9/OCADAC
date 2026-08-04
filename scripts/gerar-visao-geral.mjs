import { readdir, stat, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const PASTA = resolve(raiz, "Planilhas");
const ABA = "Visão Geral";

const COLUNAS = [
  "Tema",
  "Código secretaria",
  "Secretaria",
  "Código unidade",
  "Unidade",
  "Código ação",
  "Ação",
  "Programa funcional",
  "Eixo",
  "Classificação",
  "Ponderador",
  "Orçamento inicial",
  "Orçamento atualizado",
  "Liquidado",
  "Disponível",
  "Planejado ponderado",
  "Orçamento atualizado ponderado",
  "Liquidado ponderado",
  "Ano",
  "Observação",
];

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;
  if (typeof valor === "number") return valor;
  const limpo = String(valor).replace(/\./g, "").replace(",", ".").trim();
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

const centavos = (v) => Math.round(v * 100) / 100;

/**
 * Escolhe o export mais recente pela data no nome do arquivo. Quando há mais de
 * uma versão do mesmo dia — `... (1).xlsx`, `... (2).xlsx` — vence o maior
 * número entre parênteses; sem número, a mais recente por data de modificação.
 * Sem esse desempate a escolha dependeria da ordem do sistema de arquivos.
 */
async function fonteMaisRecente() {
  const arquivos = await readdir(PASTA);
  const candidatos = await Promise.all(
    arquivos
      .map((nome) => {
        const m = nome.match(
          /^orcamentos-tematicos-visao-geral-(\d{4})-(\d{2})-(\d{2})(?:\s*\((\d+)\))?\s*\.xlsx?$/i,
        );
        if (!m) return null;
        return {
          nome,
          dataCorte: `${m[1]}-${m[2]}-${m[3]}`,
          versao: m[4] ? Number(m[4]) : 0,
        };
      })
      .filter(Boolean)
      .map(async (c) => ({
        ...c,
        modificadoEm: (await stat(resolve(PASTA, c.nome))).mtimeMs,
      })),
  );

  if (candidatos.length === 0) {
    throw new Error(
      `Nenhum arquivo orcamentos-tematicos-visao-geral-AAAA-MM-DD.xlsx encontrado em ${PASTA}`,
    );
  }

  candidatos.sort(
    (a, b) =>
      a.dataCorte.localeCompare(b.dataCorte) ||
      a.versao - b.versao ||
      a.modificadoEm - b.modificadoEm,
  );
  return candidatos[candidatos.length - 1];
}

function lerPlanilha(caminho) {
  const wb = XLSX.readFile(caminho, { cellText: false, cellDates: true });
  const ws = wb.Sheets[ABA];
  if (!ws) {
    throw new Error(`Aba "${ABA}" não encontrada. Abas: ${wb.SheetNames.join(", ")}`);
  }

  const linhas = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    defval: null,
  });
  const cabecalho = (linhas[0] ?? []).map((c) => String(c ?? "").trim());
  const faltando = COLUNAS.filter((c) => !cabecalho.includes(c));
  if (faltando.length > 0) {
    throw new Error(
      `Cabeçalho inesperado. Colunas ausentes: ${faltando.join(", ")}\nEncontrado: ${cabecalho.join(" | ")}`,
    );
  }

  const registros = XLSX.utils.sheet_to_json(ws, { defval: null });
  return registros
    .filter((r) => String(r["Tema"] ?? "").trim().toUpperCase() === "OCAD")
    .map((r) => {
      // O campo "Disponível" da fonte vem bruto, sem ponderação — por isso é
      // derivado aqui a partir das colunas já ponderadas.
      const ocadAtualizado = centavos(numero(r["Orçamento atualizado ponderado"]));
      const ocadLiquidado = centavos(numero(r["Liquidado ponderado"]));
      return {
        ano: numero(r["Ano"]),
        secretariaCodigo: String(r["Código secretaria"] ?? "").trim(),
        secretariaNome: String(r["Secretaria"] ?? "").trim(),
        unidadeCodigo: String(r["Código unidade"] ?? "").trim(),
        unidadeNome: String(r["Unidade"] ?? "").trim(),
        acaoCodigo: String(r["Código ação"] ?? "").trim(),
        acao: String(r["Ação"] ?? "").trim(),
        programaFuncional: String(r["Programa funcional"] ?? "").trim(),
        eixo: String(r["Eixo"] ?? "").trim(),
        classificacao: String(r["Classificação"] ?? "").trim(),
        ponderador: numero(r["Ponderador"]),
        dotacaoInicial: centavos(numero(r["Orçamento inicial"])),
        ocadInicial: centavos(numero(r["Planejado ponderado"])),
        ocadAtualizado,
        ocadLiquidado,
        ocadDisponivel: centavos(ocadAtualizado - ocadLiquidado),
      };
    });
}

async function main() {
  const { nome, dataCorte } = await fonteMaisRecente();
  const registros = lerPlanilha(resolve(PASTA, nome));

  const porClassificacao = registros.reduce((acc, r) => {
    const a = (acc[r.classificacao] ??= {
      linhas: 0,
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadLiquidado: 0,
      ocadDisponivel: 0,
    });
    a.linhas += 1;
    a.ocadInicial += r.ocadInicial;
    a.ocadAtualizado += r.ocadAtualizado;
    a.ocadLiquidado += r.ocadLiquidado;
    a.ocadDisponivel += r.ocadDisponivel;
    return acc;
  }, {});

  for (const a of Object.values(porClassificacao)) {
    a.ocadInicial = centavos(a.ocadInicial);
    a.ocadAtualizado = centavos(a.ocadAtualizado);
    a.ocadLiquidado = centavos(a.ocadLiquidado);
    a.ocadDisponivel = centavos(a.ocadDisponivel);
  }

  const soma = (campo) => centavos(registros.reduce((t, r) => t + r[campo], 0));
  const meta = {
    arquivoFonte: nome,
    dataCorte,
    geradoEm: new Date().toISOString().slice(0, 10),
    anos: [...new Set(registros.map((r) => r.ano))].sort(),
    linhas: registros.length,
    totais: {
      dotacaoInicial: soma("dotacaoInicial"),
      ocadInicial: soma("ocadInicial"),
      ocadAtualizado: soma("ocadAtualizado"),
      ocadLiquidado: soma("ocadLiquidado"),
      ocadDisponivel: soma("ocadDisponivel"),
    },
    porClassificacao,
  };

  await writeFile(
    resolve(raiz, "data", "visao-geral.json"),
    JSON.stringify(registros, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(raiz, "data", "visao-geral.meta.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );

  const reais = (v) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  console.log(`Fonte: ${nome} (corte ${dataCorte})`);
  console.log(`Linhas OCAD: ${registros.length} | anos: ${meta.anos.join(", ")}`);
  console.log("--- Totais ponderados ---");
  console.log(`OCAD Inicial:    ${reais(meta.totais.ocadInicial)}`);
  console.log(`OCAD Atualizado: ${reais(meta.totais.ocadAtualizado)}`);
  console.log(`OCAD Liquidado:  ${reais(meta.totais.ocadLiquidado)}`);
  console.log(`OCAD Disponível: ${reais(meta.totais.ocadDisponivel)}`);
  for (const [classificacao, v] of Object.entries(porClassificacao)) {
    console.log(
      `  ${classificacao}: ${v.linhas} linhas | inicial ${reais(v.ocadInicial)} | liquidado ${reais(v.ocadLiquidado)}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
