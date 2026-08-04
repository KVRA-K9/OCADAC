/**
 * Série de EXECUÇÃO por exercício. Combina duas fontes, cada uma com sua data
 * de corte e seu conjunto de estágios:
 *
 * - exercícios das planilhas OCAD: empenhado, liquidado e pago;
 * - exercício corrente do painel de orçamentos temáticos: apenas liquidado.
 *
 * O planejado oficial não vem daqui — está em `data/roca.ts`.
 */

import dadosHistoricos from "@/data/orcamento-historico.json";
import metaHistorico from "@/data/orcamento-historico.meta.json";
import {
  dataCorteVisaoGeral,
  metaVisaoGeral,
  orcamentoData,
} from "@/data/visao-geral";

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
  /** Ausente quando a fonte do ano não publica o estágio. */
  ocadEmpenhado: number | null;
  ocadLiquidado: number;
  ocadPago: number | null;
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
    fonte: `Planilha OCAD ${ano}`,
  }));
})();

/** Exercícios vindos do painel de orçamentos temáticos — só liquidado. */
const doPainel: PontoExecucao[] = metaVisaoGeral.anos.map((ano) => {
  const doAno = orcamentoData.filter((i) => i.ano === ano);
  const soma = (campo: "ocadInicial" | "ocadAtualizado" | "ocadLiquidado") =>
    doAno.reduce((acc, i) => acc + i.valores[campo], 0);
  return {
    ano,
    ocadInicial: soma("ocadInicial"),
    ocadAtualizado: soma("ocadAtualizado"),
    ocadEmpenhado: null,
    ocadLiquidado: soma("ocadLiquidado"),
    ocadPago: null,
    dataCorte: dataCorteVisaoGeral,
    fonte: "Painel de orçamentos temáticos",
  };
});

/**
 * Um exercício presente nas duas fontes fica com a do painel, que tem data de
 * corte mais recente — é o que mantém esta página e a Visão Geral coerentes.
 */
export const serieExecucao: PontoExecucao[] = (() => {
  const anosDoPainel = new Set(doPainel.map((p) => p.ano));
  return [
    ...dePlanilhas.filter((p) => !anosDoPainel.has(p.ano)),
    ...doPainel,
  ].sort((a, b) => a.ano - b.ano);
})();

/** Verdadeiro quando algum exercício da série não publica todos os estágios. */
export const serieExecucaoIncompleta = serieExecucao.some(
  (p) => p.ocadEmpenhado === null || p.ocadPago === null,
);
