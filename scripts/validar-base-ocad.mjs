/**
 * Verifica a integridade estrutural e aritmética de `data/base-ocad.json` e
 * `data/base-ocad.meta.json` antes de qualquer build ou commit automático.
 *
 * Uso: npm run dados:validar
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  CAMPOS_VALOR,
  centavos,
  chaveLogicaAcao,
  lerBaseAtual,
  lerCorteMensal,
  lerManifestoMeses,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const ValoresSchema = z.object({
  dotacaoInicial: z.number().finite(),
  ocadInicial: z.number().finite(),
  ocadAtualizado: z.number().finite(),
  ocadEmpenhado: z.number().finite(),
  ocadLiquidado: z.number().finite(),
  ocadPago: z.number().finite(),
  ocadDisponivel: z.number().finite(),
});

const FonteSchema = ValoresSchema.extend({
  codigo: z.string().regex(/^\d{8}$/),
  nome: z.string().min(1),
});

const RegistroSchema = ValoresSchema.extend({
  ano: z.number().int().min(2000).max(2100),
  secretariaCodigo: z.string().regex(/^\d{3}$/),
  secretariaNome: z.string().min(1),
  unidadeCodigo: z.string().regex(/^\d{3}$/),
  unidadeNome: z.string().min(1),
  acaoCodigo: z.string().min(1),
  acao: z.string().min(1),
  programaFuncional: z.string().regex(/^\d{17}$/),
  eixo: z.enum(["EDUCACAO", "SAUDE", "ASSISTENCIA_SOCIAL"]),
  classificacao: z.enum(["Exclusivo", "Não exclusivo"]),
  ponderador: z.number().gt(0).lte(1),
  fontes: z.array(FonteSchema).min(1),
});

const MetaSchema = z.object({
  arquivoFonte: z.string().min(1),
  origem: z.string().min(1),
  origemTipo: z.enum(["api", "planilha", "sicaf"]).optional(),
  dataArquivo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  geradoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  atualizadoEm: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/)
    .optional(),
  anos: z.array(z.number().int()).min(1),
  mesReferencia: z.number().int().min(1).max(12).optional(),
  linhasFonte: z.number().int().positive(),
  acoes: z.number().int().positive(),
  fontesDistintas: z.number().int().positive(),
  totais: ValoresSchema,
});

const ManifestoEntradaSchema = z.object({
  chave: z.string().regex(/^\d{4}-\d{2}$/),
  ano: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  dataArquivo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  arquivoFonte: z.string().min(1),
  acoes: z.number().int().positive(),
  linhasFonte: z.number().int().positive(),
  fontesDistintas: z.number().int().positive(),
  totais: ValoresSchema,
});

function validarConjunto(rawRegistros, rawMeta, rotulo) {
  const registros = z.array(RegistroSchema).min(1).parse(rawRegistros);
  const meta = MetaSchema.parse(rawMeta);

  const chaves = new Set();
  const fontesGlobais = new Set();

  for (const r of registros) {
    const chave = chaveLogicaAcao(
      r.secretariaCodigo,
      r.unidadeCodigo,
      r.programaFuncional,
    );
    if (chaves.has(chave)) {
      throw new Error(`Chave duplicada em ${rotulo}: ${chave}`);
    }
    chaves.add(chave);

    if (
      Math.round(r.ocadDisponivel * 100) !==
      Math.round(centavos(r.ocadAtualizado - r.ocadLiquidado) * 100)
    ) {
      throw new Error(`ocadDisponivel inconsistente em ${rotulo} na ação ${chave}`);
    }

    for (const f of r.fontes) {
      fontesGlobais.add(f.codigo);
      if (
        Math.round(f.ocadDisponivel * 100) !==
        Math.round(centavos(f.ocadAtualizado - f.ocadLiquidado) * 100)
      ) {
        throw new Error(
          `ocadDisponivel inconsistente em ${rotulo} na fonte ${f.codigo} da ação ${chave}`,
        );
      }
    }

    for (const campo of CAMPOS_VALOR) {
      const somaFontes = r.fontes.reduce(
        (t, f) => t + Math.round(f[campo] * 100),
        0,
      );
      if (Math.abs(somaFontes - Math.round(r[campo] * 100)) > r.fontes.length) {
        throw new Error(
          `Soma das fontes diverge do total da ação em ${campo} (${rotulo}, ${chave})`,
        );
      }
    }
  }

  if (meta.acoes !== registros.length) {
    throw new Error(
      `meta.acoes (${meta.acoes}) ≠ quantidade de registros (${registros.length}) em ${rotulo}`,
    );
  }
  if (meta.fontesDistintas !== fontesGlobais.size) {
    throw new Error(
      `meta.fontesDistintas (${meta.fontesDistintas}) ≠ fontes reais (${fontesGlobais.size}) em ${rotulo}`,
    );
  }

  for (const campo of CAMPOS_VALOR) {
    const soma = centavos(registros.reduce((t, r) => t + r[campo], 0));
    if (Math.round(soma * 100) !== Math.round(meta.totais[campo] * 100)) {
      throw new Error(
        `meta.totais.${campo} (${meta.totais[campo]}) ≠ soma das ações (${soma}) em ${rotulo}`,
      );
    }
  }

  return { registros, meta, fontesGlobais };
}

async function main() {
  const atual = await lerBaseAtual(raiz);
  if (!atual) {
    throw new Error("Arquivos data/base-ocad.json ou data/base-ocad.meta.json não encontrados.");
  }

  const { registros, meta, fontesGlobais } = validarConjunto(
    atual.registros,
    atual.meta,
    "base-ocad.json",
  );

  const manifesto = z.array(ManifestoEntradaSchema).parse(await lerManifestoMeses(raiz));
  for (const entrada of manifesto) {
    const corte = await lerCorteMensal(raiz, entrada.chave);
    if (!corte) {
      throw new Error(`Corte mensal ausente: public/data/meses/${entrada.chave}.json`);
    }
    const validado = validarConjunto(
      corte.registros,
      corte.meta,
      `public/data/meses/${entrada.chave}.json`,
    );
    if (validado.meta.acoes !== entrada.acoes) {
      throw new Error(`Manifesto ${entrada.chave}: acoes diverge do arquivo mensal.`);
    }
  }

  console.log(
    `OK: ${registros.length} ações, ${fontesGlobais.size} fontes distintas, corte ${meta.dataArquivo} (${meta.arquivoFonte}); ${manifesto.length} cortes mensais validados.`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
