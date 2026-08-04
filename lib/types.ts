export type CategoriaEconomica = "Exclusivo" | "Não Exclusivo";

/**
 * Estágios na nomenclatura do ROCA. `dotacaoInicial` é o valor bruto da ação;
 * os demais já saem ponderados (exclusivo ×1,0 / não exclusivo ×0,36).
 */
export type Estagio =
  | "dotacaoInicial"
  | "ocadInicial"
  | "ocadAtualizado"
  | "ocadLiquidado"
  | "ocadDisponivel";

export interface ValoresOrcamentarios {
  /** Dotação inicial da ação, sem ponderação. */
  dotacaoInicial: number;
  /** "OCAD Inicial" no ROCA: dotação inicial × ponderador. */
  ocadInicial: number;
  ocadAtualizado: number;
  ocadLiquidado: number;
  /** Derivado: ocadAtualizado − ocadLiquidado. */
  ocadDisponivel: number;
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
  dotacaoInicial: 0,
  ocadInicial: 0,
  ocadAtualizado: 0,
  ocadLiquidado: 0,
  ocadDisponivel: 0,
};
