import dadosHistoricos from "@/data/orcamento-historico.json";

export interface DadoHistorico {
  ano: number;
  pago: number;
}

export interface DadoHistoricoCompleto {
  ano: number;
  inicial: number;
  atual: number;
  empenhado: number;
  liquidado: number;
  pago: number;
  acumulado: boolean;
}

interface RegistroHistorico {
  ano: number;
  orgao: string;
  programa: string;
  acao: string;
  classificacao: string;
  orcamentoInicial: number;
  orcamentoAtual: number;
  empenhado: number;
  liquidado: number;
  pago: number;
}

const registros = dadosHistoricos as RegistroHistorico[];

export const serieHistoricaPago: DadoHistorico[] = (() => {
  const porAno = new Map<number, number>();
  for (const r of registros) {
    porAno.set(r.ano, (porAno.get(r.ano) ?? 0) + r.pago);
  }
  return [...porAno.entries()]
    .map(([ano, pago]) => ({ ano, pago }))
    .sort((a, b) => a.ano - b.ano);
})();

export const serieHistoricaCompleta: DadoHistoricoCompleto[] = (() => {
  const porAno = new Map<
    number,
    { inicial: number; atual: number; empenhado: number; liquidado: number; pago: number }
  >();
  for (const r of registros) {
    const acc =
      porAno.get(r.ano) ?? { inicial: 0, atual: 0, empenhado: 0, liquidado: 0, pago: 0 };
    acc.inicial += r.orcamentoInicial;
    acc.atual += r.orcamentoAtual;
    acc.empenhado += r.empenhado;
    acc.liquidado += r.liquidado;
    acc.pago += r.pago;
    porAno.set(r.ano, acc);
  }
  const anos = [...porAno.keys()].sort((a, b) => a - b);
  return anos.map((ano, i) => ({
    ano,
    inicial: porAno.get(ano)!.inicial,
    atual: porAno.get(ano)!.atual,
    empenhado: porAno.get(ano)!.empenhado,
    liquidado: porAno.get(ano)!.liquidado,
    pago: porAno.get(ano)!.pago,
    acumulado: i === anos.length - 1 && ano >= 2026,
  }));
})();