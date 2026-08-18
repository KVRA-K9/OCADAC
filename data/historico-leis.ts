/**
 * Acervo normativo do OCAD — leis ordinárias, decretos, leis de estrutura
 * administrativa, PPAs, LDOs e LOAs.
 *
 * Gerado por `npm run historico:leis` a partir da planilha do histórico de
 * leis. Cada norma é datada pela sua própria publicação, e não pelo exercício a
 * que se refere: uma LOA de dezembro de 2025 rege o exercício de 2026.
 */

import normasBrutas from "@/data/historico-leis.json";
import metaBruta from "@/data/historico-leis.meta.json";

export const TIPOS_NORMA = [
  "Lei Ordinária",
  "Decreto",
  "Estrutura Administrativa",
  "PPA",
  "LDO",
  "LOA",
] as const;

export type TipoNorma = (typeof TIPOS_NORMA)[number];

export interface ValoresLOA {
  rp: number;
  outrasFontes: number;
  /** Sempre em real: os exercícios em cruzeiro já vêm convertidos. */
  total: number;
  moedaOriginal: "Cr$" | "R$";
  /** Valor como está na planilha, na moeda da época. */
  totalOriginal: number;
  codigos: string | null;
}

export interface Norma {
  id: string;
  tipo: TipoNorma;
  /** "Lei", "Lei Complementar" ou "Decreto". */
  especie: string;
  numero: string;
  ementa: string;
  /** Ano da norma. */
  ano: number;
  data: string | null;
  publicacao: string | null;
  /** Texto integral no Legis do Acre, como a planilha o registra. */
  link: string | null;
  /** Exercício regido, nas LDOs e LOAs. */
  exercicio: number | null;
  quadrienio: [number, number] | null;
  orgaos: string | null;
  citacoes: string | null;
  metas: string[];
  loa: ValoresLOA | null;
  /**
   * Abas da planilha em que a norma aparece. Quase sempre uma; a Lei 1.011/1991,
   * que cria o CEDCA, é lei ordinária e lei de estrutura ao mesmo tempo, e conta
   * uma vez só — a lista guarda a origem que a contagem não mostra.
   */
  abas?: TipoNorma[];
}

export interface MetaHistoricoLeis {
  arquivoFonte: string;
  origem: string;
  dataArquivo: string;
  atualizadoEm: string | null;
  geradoEm: string;
  normas: number;
  porTipo: Record<string, number>;
  observacoes: string[];
}

export const metaLeis = metaBruta as MetaHistoricoLeis;

/** Da mais recente para a mais antiga — a ordem da linha do tempo. */
export const normas = normasBrutas as Norma[];

export const anosNormas: number[] = [
  ...new Set(normas.map((n) => n.ano)),
].sort((a, b) => b - a);

export interface PontoLOA {
  /** Exercício regido pela lei, que é o que interessa na série. */
  exercicio: number;
  rp: number;
  outrasFontes: number;
  total: number;
  numero: string;
  moedaOriginal: "Cr$" | "R$";
  totalOriginal: number;
}

/**
 * Série da LOA, do primeiro ao último exercício. Cada ponto traz o valor em
 * real (`total`, convertido pelos cortes monetários nos exercícios anteriores
 * ao Plano Real) e o valor como a lei o fixou (`totalOriginal`, em Cr$ mil nos
 * quatro primeiros). A tela usa as duas fatias separadas, abaixo: moedas
 * diferentes não dividem eixo.
 */
export const serieLOA: PontoLOA[] = normas
  .filter((n) => n.loa !== null && n.exercicio !== null)
  .map((n) => ({
    exercicio: n.exercicio as number,
    numero: n.numero,
    ...(n.loa as ValoresLOA),
  }))
  .sort((a, b) => a.exercicio - b.exercicio);

/**
 * Exercício regido → id da norma que o rege. É por aqui que o gráfico da série
 * chega ao cartão na linha do tempo: a LOA do exercício X foi sancionada no ano
 * X−1, então o ano do cartão não serve de chave.
 */
export const normaPorExercicio: ReadonlyMap<number, string> = new Map(
  normas
    .filter((n) => n.loa !== null && n.exercicio !== null)
    .map((n) => [n.exercicio as number, n.id]),
);

/** Exercícios já fixados em real: a série comparável, a do gráfico principal. */
export const serieLOAReal: PontoLOA[] = serieLOA.filter(
  (p) => p.moedaOriginal === "R$",
);

/**
 * Exercícios anteriores ao real (1991–1994), que ganham gráfico próprio, em
 * cruzeiro nominal: é o valor que a lei fixou.
 */
export const exerciciosEmCruzeiro: PontoLOA[] = serieLOA.filter(
  (p) => p.moedaOriginal === "Cr$",
);
