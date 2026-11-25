/**
 * Sincroniza a base corrente do OCAD a partir da API do Sistema de Orçamentos
 * Temáticos e atualiza `data/base-ocad.json` e `data/base-ocad.meta.json`.
 *
 * Variáveis de ambiente:
 *   ORCAMENTOS_API_URL    URL do endpoint (obrigatória, ou via --url=...)
 *   ORCAMENTOS_API_TOKEN  Token enviado no cabeçalho `x-job-token` (opcional)
 *   OCAD_ANO              Exercício padrão a consultar (opcional)
 *
 * Uso:
 *   npm run dados:api
 *   npm run dados:api -- --dry-run
 *   npm run dados:api -- --ano=2026 --force
 */

import { appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  consolidarRegistrosOcad,
  formatarIsoRioBranco,
  gravarBaseSeAlterada,
  hojeRioBranco,
  imprimirResumo,
  lerBaseAtual,
  reais,
  validarSegurancaAtualizacao,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const TIMEOUT_MS = 30_000;
const MAX_TENTATIVAS = 3;

const FonteApiSchema = z.object({
  codigo: z.string().trim().regex(/^\d{8}$/, "Código da fonte deve ter 8 dígitos"),
  nome: z.string().trim().min(1, "Nome da fonte obrigatório"),
  orcInicial: z.number().finite().optional(),
  orcAtual: z.number().finite().optional(),
  empenhado: z.number().finite().optional(),
  liquidado: z.number().finite().optional(),
  pago: z.number().finite().optional(),
  dotacaoInicial: z.number().finite().optional(),
  ocadInicial: z.number().finite().optional(),
  ocadAtualizado: z.number().finite().optional(),
  ocadEmpenhado: z.number().finite().optional(),
  ocadLiquidado: z.number().finite().optional(),
  ocadPago: z.number().finite().optional(),
});

const AcaoApiSchema = z.object({
  secretariaCodigo: z.string().trim().regex(/^\d{3}$/),
  secretariaNome: z.string().trim().min(1),
  unidadeCodigo: z.string().trim().regex(/^\d{3}$/),
  unidadeNome: z.string().trim().min(1),
  programaFuncional: z.string().trim().regex(/^\d{17}$/),
  acaoCodigo: z.string().trim().min(1).optional(),
  acao: z.string().trim().min(1),
  eixo: z.enum(["EDUCACAO", "SAUDE", "ASSISTENCIA_SOCIAL"]).optional(),
  classificacao: z.enum(["Exclusivo", "Não exclusivo", "Não Exclusivo", "EX", "NEX"]),
  ponderador: z.number().gt(0).lte(1),
  fontes: z.array(FonteApiSchema).min(1),
});

const PayloadApiSchema = z.object({
  exercicio: z.number().int().min(2000).max(2100),
  dataCorte: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dataCorte deve estar em YYYY-MM-DD"),
  publicadoEm: z.string().trim().optional(),
  importId: z.string().trim().min(1).optional(),
  origem: z.string().trim().min(1).optional(),
  valoresJaPonderados: z.boolean().default(false),
  acoes: z.array(AcaoApiSchema).min(1),
});

function lerArgs(argv) {
  const opts = {
    dryRun: false,
    force: false,
    ano: process.env.OCAD_ANO ? Number(process.env.OCAD_ANO) : undefined,
    url: process.env.ORCAMENTOS_API_URL,
    token: process.env.ORCAMENTOS_API_TOKEN,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--force") opts.force = true;
    else if (arg.startsWith("--ano=")) opts.ano = Number(arg.slice("--ano=".length));
    else if (arg.startsWith("--url=")) opts.url = arg.slice("--url=".length);
    else if (arg.startsWith("--token=")) opts.token = arg.slice("--token=".length);
    else {
      throw new Error(`Argumento desconhecido: ${arg}`);
    }
  }

  opts.ano ??= Number(hojeRioBranco().slice(0, 4));
  if (!Number.isInteger(opts.ano) || opts.ano < 2000 || opts.ano > 2100) {
    throw new Error(`Exercício inválido: ${opts.ano}`);
  }
  if (!opts.url) {
    throw new Error(
      "URL da API não informada. Defina ORCAMENTOS_API_URL ou passe --url=...",
    );
  }
  return opts;
}

function normalizarClassificacao(valor) {
  if (valor === "Exclusivo" || valor === "EX") return "Exclusivo";
  return "Não exclusivo";
}

function exigirNumero(valor, nomeCampo, chaveFonte) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new Error(
      `Campo "${nomeCampo}" ausente ou inválido na fonte ${chaveFonte}.`,
    );
  }
  return valor;
}

function normalizarFonte(fonte, ponderador, valoresJaPonderados, chaveAcao) {
  const ctx = `${chaveAcao} / fonte ${fonte.codigo}`;

  if (valoresJaPonderados) {
    const dotacaoInicial = exigirNumero(
      fonte.dotacaoInicial ?? fonte.orcInicial,
      "dotacaoInicial/orcInicial",
      ctx,
    );
    return {
      codigo: fonte.codigo,
      nome: fonte.nome,
      dotacaoInicial,
      ocadInicial: exigirNumero(fonte.ocadInicial, "ocadInicial", ctx),
      ocadAtualizado: exigirNumero(fonte.ocadAtualizado, "ocadAtualizado", ctx),
      ocadEmpenhado: exigirNumero(fonte.ocadEmpenhado, "ocadEmpenhado", ctx),
      ocadLiquidado: exigirNumero(fonte.ocadLiquidado, "ocadLiquidado", ctx),
      ocadPago: exigirNumero(fonte.ocadPago, "ocadPago", ctx),
    };
  }

  const orcInicial = exigirNumero(fonte.orcInicial, "orcInicial", ctx);
  const orcAtual = exigirNumero(fonte.orcAtual, "orcAtual", ctx);
  const empenhado = exigirNumero(fonte.empenhado, "empenhado", ctx);
  const liquidado = exigirNumero(fonte.liquidado, "liquidado", ctx);
  const pago = exigirNumero(fonte.pago, "pago", ctx);

  return {
    codigo: fonte.codigo,
    nome: fonte.nome,
    dotacaoInicial: orcInicial,
    ocadInicial: orcInicial * ponderador,
    ocadAtualizado: orcAtual * ponderador,
    ocadEmpenhado: empenhado * ponderador,
    ocadLiquidado: liquidado * ponderador,
    ocadPago: pago * ponderador,
  };
}

function descreverErro(err) {
  const causa = err?.cause?.code ?? err?.cause?.message;
  return causa ? `${err.message} (causa: ${caus})` : err.message;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function buscarPayload(urlStr, token, ano) {
  const url = new URL(urlStr);
  if (!url.searchParams.has("ano")) {
    url.searchParams.set("ano", String(ano));
  }

  const headers = { Accept: "application/json" };
  if (token) headers["x-job-token"] = token;

  let ultimoErro;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (resp.status === 401 || resp.status === 403 || resp.status === 400 || resp.status === 404) {
        const corpo = await resp.text().catch(() => "");
        throw new Error(
          `API respondeu HTTP ${resp.status}${corpo ? `: ${corpo.slice(0, 200)}` : ""}`,
        );
      }

      if (!resp.ok) {
        const err = new Error(`API respondeu HTTP ${resp.status}`);
        err.retentavel = true;
        throw err;
      }

      return await resp.json();
    } catch (err) {
      ultimoErro = err;
      const retentavel =
        err?.retentavel === true ||
        err?.name === "TimeoutError" ||
        err?.name === "TypeError";
      if (!retentavel || tentativa === MAX_TENTATIVAS) {
        throw new Error(`Falha ao consultar API: ${descreverErro(err)}`, {
          cause: err,
        });
      }
      const atrasoMs = 1500 * 2 ** (tentativa - 1);
      console.warn(
        `Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou (${descreverErro(err)}). Nova tentativa em ${atrasoMs}ms...`,
      );
      await esperar(atrasoMs);
    }
  }
  throw ultimoErro;
}

async function registrarStepSummary({ meta, baseAtual, alterado, dryRun }) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const status = dryRun
    ? "Simulação (`dry_run`)"
    : alterado
      ? "Atualizado"
      : "Sem alterações";

  const linhas = [
    "## Sincronização OCAD via API",
    "",
    `- **Situação:** ${status}`,
    `- **Fonte:** ${meta.arquivoFonte} (${meta.origem})`,
    `- **Data de corte:** ${meta.dataArquivo}`,
    `- **Ações:** ${meta.acoes}${baseAtual ? ` (antes: ${baseAtual.meta?.acoes ?? "?"})` : ""}`,
    `- **Fontes distintas:** ${meta.fontesDistintas}`,
    `- **OCAD Inicial:** ${reais(meta.totais.ocadInicial)}`,
    `- **OCAD Atualizado:** ${reais(meta.totais.ocadAtualizado)}`,
    `- **OCAD Empenhado:** ${reais(meta.totais.ocadEmpenhado)}`,
    `- **OCAD Liquidado:** ${reais(meta.totais.ocadLiquidado)}`,
    `- **OCAD Pago:** ${reais(meta.totais.ocadPago)}`,
    "",
  ];

  await appendFile(summaryPath, linhas.join("\n"), "utf8");
}

async function main() {
  const opts = lerArgs(process.argv.slice(2));
  console.log(`Consultando API de Orçamentos Temáticos (exercício ${opts.ano})...`);

  const bruto = await buscarPayload(opts.url, opts.token, opts.ano);
  const parsed = PayloadApiSchema.safeParse(bruto);
  if (!parsed.success) {
    const detalhes = parsed.error.issues
      .slice(0, 8)
      .map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Payload da API inválido: ${detalhes}`);
  }

  const payload = parsed.data;
  if (payload.exercicio !== opts.ano) {
    throw new Error(
      `Exercício retornado (${payload.exercicio}) diverge do solicitado (${opts.ano}).`,
    );
  }

  const itens = payload.acoes.map((a) => {
    const chave = `${a.secretariaCodigo}|${a.unidadeCodigo}|${a.programaFuncional}`;
    return {
      ano: payload.exercicio,
      secretariaCodigo: a.secretariaCodigo,
      secretariaNome: a.secretariaNome,
      unidadeCodigo: a.unidadeCodigo,
      unidadeNome: a.unidadeNome,
      acaoCodigo: a.acaoCodigo ?? a.programaFuncional.slice(-8),
      acao: a.acao,
      programaFuncional: a.programaFuncional,
      eixo: a.eixo,
      classificacao: normalizarClassificacao(a.classificacao),
      ponderador: a.ponderador,
      fontes: a.fontes.map((f) =>
        normalizarFonte(f, a.ponderador, payload.valoresJaPonderados, chave),
      ),
    };
  });

  const atualizadoEm =
    payload.publicadoEm &&
    /[T ]\d{2}:\d{2}/.test(payload.publicadoEm) &&
    !Number.isNaN(Date.parse(payload.publicadoEm))
      ? formatarIsoRioBranco(new Date(payload.publicadoEm))
      : formatarIsoRioBranco();

  const base = consolidarRegistrosOcad(itens, {
    ano: payload.exercicio,
    arquivoFonte: payload.importId ?? `sicaf-${payload.dataCorte}`,
    origem: payload.origem ?? "API Orçamentos Temáticos — base SICAF/SEPLAN",
    origemTipo: "api",
    dataArquivo: payload.dataCorte,
    atualizadoEm,
  });

  const baseAtual = await lerBaseAtual(raiz);
  validarSegurancaAtualizacao(base.registros, base.meta, baseAtual, {
    force: opts.force,
  });

  let alterado = false;
  if (opts.dryRun) {
    console.log("[dry-run] Validação aprovada. Nenhum arquivo gravado.");
  } else {
    ({ alterado } = await gravarBaseSeAlterada(raiz, base, baseAtual));
    console.log(
      alterado
        ? "Base atualizada em data/base-ocad.json e data/base-ocad.meta.json."
        : "Base já está atualizada — nenhuma alteração gravada.",
    );
  }

  imprimirResumo(base.meta);
  await registrarStepSummary({
    meta: base.meta,
    baseAtual,
    alterado,
    dryRun: opts.dryRun,
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
