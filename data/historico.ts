/**
 * Série de EXECUÇÃO por exercício, montada a partir das planilhas OCAD — a
 * mesma família de arquivos que alimenta o BI. Todos os exercícios trazem os
 * cinco estágios (inicial, atualizado, empenhado, liquidado e pago), e cada um
 * carrega o arquivo de origem.
 */

import dadosHistoricos from "@/data/orcamento-historico.json";
import metaHistorico from "@/data/orcamento-historico.meta.json";
import { dataBase, metaBase, totaisBase } from "@/data/base-ocad";

interface RegistroHistorico {
  ano: number;
  orgao: string;
  programa: string;
  acao: string;
  classificacao: string;
  ponderador: number;
  ocadInicial: number;
  ocadAtualizado: number;
  ocadEmpenhado: number;
  ocadLiquidado: number;
  ocadPago: number;
}

interface MetaHistorico {
  geradoEm: string;
  cortes: Record<string, { dataCorte: string; arquivoFonte: string }>;
}

export interface PontoExecucao {
  ano: number;
  ocadInicial: number;
  ocadAtualizado: number;
  ocadEmpenhado: number;
  ocadLiquidado: number;
  ocadPago: number;
  dataCorte: string;
  fonte: string;
}

const registros = dadosHistoricos as RegistroHistorico[];
const meta = metaHistorico as MetaHistorico;

const formatarData = (iso: string) => {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
};

/** Exercícios vindos das planilhas OCAD — têm os cinco estágios. */
const dePlanilhas: PontoExecucao[] = (() => {
  const porAno = new Map<
    number,
    {
      ocadInicial: number;
      ocadAtualizado: number;
      ocadEmpenhado: number;
      ocadLiquidado: number;
      ocadPago: number;
    }
  >();

  for (const r of registros) {
    const acc = porAno.get(r.ano) ?? {
      ocadInicial: 0,
      ocadAtualizado: 0,
      ocadEmpenhado: 0,
      ocadLiquidado: 0,
      ocadPago: 0,
    };
    acc.ocadInicial += r.ocadInicial;
    acc.ocadAtualizado += r.ocadAtualizado;
    acc.ocadEmpenhado += r.ocadEmpenhado;
    acc.ocadLiquidado += r.ocadLiquidado;
    acc.ocadPago += r.ocadPago;
    porAno.set(r.ano, acc);
  }

  return [...porAno.entries()].map(([ano, v]) => ({
    ano,
    ...v,
    dataCorte: formatarData(meta.cortes[String(ano)]?.dataCorte ?? ""),
    fonte: meta.cortes[String(ano)]?.arquivoFonte ?? `Planilha OCAD ${ano}`,
  }));
})();

/** Exercício corrente, vindo da mesma base que abastece o resto do site. */
const doExercicioCorrente: PontoExecucao[] = metaBase.anos.map((ano) => ({
  ano,
  ocadInicial: totaisBase.ocadInicial,
  ocadAtualizado: totaisBase.ocadAtualizado,
  ocadEmpenhado: totaisBase.ocadEmpenhado,
  ocadLiquidado: totaisBase.ocadLiquidado,
  ocadPago: totaisBase.ocadPago,
  dataCorte: dataBase,
  fonte: metaBase.arquivoFonte,
}));

/**
 * O exercício corrente vem da base do site; os anteriores, das planilhas
 * arquivadas. Um ano presente nos dois lugares fica com a base do site, que é a
 * mais recente — é o que mantém esta página e a Visão Geral coerentes.
 */
export const serieExecucao: PontoExecucao[] = (() => {
  const anosCorrentes = new Set(doExercicioCorrente.map((p) => p.ano));
  return [
    ...dePlanilhas.filter((p) => !anosCorrentes.has(p.ano)),
    ...doExercicioCorrente,
  ].sort((a, b) => a.ano - b.ano);
})();
