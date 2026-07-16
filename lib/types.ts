export type CategoriaEconomica = "Exclusivo" | "Não Exclusivo";

export type Estagio = "previsto" | "empenhado" | "liquidado" | "pago";

export interface ValoresOrcamentarios {
  previsto: number;
  empenhado: number;
  liquidado: number;
  pago: number;
}

export interface OrcamentoItem {
  id: string;
  ano: number;
  funcao: string;
  programa: string;
  acao: string;
  orgao: string;
  unidadeGestora: string;
  categoriaEconomica: CategoriaEconomica;
  valores: ValoresOrcamentarios;
}

export interface FiltrosOrcamento {
  ano: string;
  funcao: string[];
  categoriaEconomica: string;
  secretaria: string[];
}

export const VALORES_NULOS: ValoresOrcamentarios = {
  previsto: 0,
  empenhado: 0,
  liquidado: 0,
  pago: 0,
};
