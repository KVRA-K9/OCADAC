export type CategoriaEconomica = "Exclusivo" | "Não Exclusivo";

/**
 * Estágios como nomeados na planilha OCAD. `dotacaoInicial` é o valor bruto;
 * os demais já saem ponderados (exclusivo ×1,0 / não exclusivo ×0,36).
 */
export type Estagio =
  | "dotacaoInicial"
  | "ocadInicial"
  | "ocadAtualizado"
  | "ocadEmpenhado"
  | "ocadLiquidado"
  | "ocadPago"
  | "ocadDisponivel";

/** Estágios da despesa na ordem em que ocorrem, para gráficos e tabelas. */
export const CADEIA_EXECUCAO = [
  "ocadInicial",
  "ocadAtualizado",
  "ocadEmpenhado",
  "ocadLiquidado",
  "ocadPago",
] as const satisfies readonly Estagio[];

export interface ValoresOrcamentarios {
  /** Dotação inicial da ação, sem ponderação. */
  dotacaoInicial: number;
  /** Dotação inicial × ponderador. */
  ocadInicial: number;
  ocadAtualizado: number;
  ocadEmpenhado: number;
  ocadLiquidado: number;
  ocadPago: number;
  /** Derivado: ocadAtualizado − ocadLiquidado. */
  ocadDisponivel: number;
}

/**
 * Uma fonte de recurso dentro de uma ação, com os mesmos estágios da ação.
 *
 * A planilha vem no grão ação × fonte, então estes valores são os das próprias
 * linhas — não há rateio, e a soma das fontes reproduz a ação.
 */
export interface FonteAcao extends ValoresOrcamentarios {
  /** Código de 8 dígitos da fonte, como na coluna "Fonte de Recursos". */
  codigo: string;
  nome: string;
}

export interface OrcamentoItem {
  id: string;
  ano: number;
  funcao: string;
  programa: string;
  /** Código da ação na planilha, como o BI a identifica. */
  acaoCodigo: string;
  acao: string;
  orgao: string;
  orgaoCodigo: string;
  unidadeGestora: string;
  unidadeCodigo: string;
  categoriaEconomica: CategoriaEconomica;
  valores: ValoresOrcamentarios;
  /** Decomposição de `valores` por fonte de recurso. */
  fontes: FonteAcao[];
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
  ocadEmpenhado: 0,
  ocadLiquidado: 0,
  ocadPago: 0,
  ocadDisponivel: 0,
};
