/**
 * OCAD apurado no texto de cada lei orçamentária, exercício a exercício.
 *
 * Gerado por `node scripts/extrair-ocad-loas.mjs`, que lê a programação por
 * unidade orçamentária dos cadernos da LOA e soma duas parcelas: as unidades que
 * entram integrais — ensino, ISE e as da infância — e, nas demais, as ações cujo
 * nome traz um dos descritores da metodologia.
 *
 * É medida diferente da que a planilha da SEPLAN traz, que é a dotação total
 * dos órgãos responsáveis pela política. As duas convivem no gráfico, cada uma
 * com sua cor, porque respondem a perguntas diferentes.
 *
 * De 1991 a 2009 e em 2014 não há apuração: falta fonte, não falta orçamento.
 */

import apuracoesBrutas from "@/data/ocad-loas.json";
import metaBruta from "@/data/ocad-loas.meta.json";

export interface ApuracaoOCAD {
  exercicio: number;
  /** Soma das unidades integrais mais as ações por descritor. Nulo sem apuração. */
  ocad: number | null;
  totalIntegrais: number | null;
  totalAcoes: number | null;
  cobertura: string;
  unidadesIntegrais: number;
  acoesCasadas: number;
  /**
   * Quanto do total que a lei declara não é explicado por nenhuma linha impressa
   * do caderno. De 2024 em diante a publicação traz ações só com o nome, sem
   * código e sem valor — é defeito do documento, e some quando é zero.
   */
  naoDetalhado: number;
  unidadesIncompletas: number;
}

export const apuracoesOCAD: ApuracaoOCAD[] = (
  apuracoesBrutas as Array<{
    exercicio: number;
    ocad: number | null;
    totalIntegrais: number | null;
    totalAcoes: number | null;
    cobertura: string;
    unidadesIntegrais: unknown[];
    acoesCasadas: unknown[];
    conferencia?: { naoDetalhado?: number; unidadesIncompletas?: number };
  }>
).map((a) => ({
  exercicio: a.exercicio,
  ocad: a.ocad,
  totalIntegrais: a.totalIntegrais,
  totalAcoes: a.totalAcoes,
  cobertura: a.cobertura,
  unidadesIntegrais: a.unidadesIntegrais.length,
  acoesCasadas: a.acoesCasadas.length,
  naoDetalhado: a.conferencia?.naoDetalhado ?? 0,
  unidadesIncompletas: a.conferencia?.unidadesIncompletas ?? 0,
}));

/** Exercício → apuração, para casar com a série da planilha. */
export const ocadPorExercicio: ReadonlyMap<number, ApuracaoOCAD> = new Map(
  apuracoesOCAD.filter((a) => a.ocad !== null).map((a) => [a.exercicio, a]),
);

/**
 * O que dizer no lugar do valor apurado. Uma frase: o motivo é o mesmo para
 * todos esses exercícios, e repetir o ano dentro do texto só ocupa espaço em
 * balão que já traz o ano no título.
 */
export function razaoSemApuracao(): string {
  return "Os anexos com a programação por unidade existem apenas em versões físicas — a publicação eletrônica do Diário Oficial começa no fim de 2009.";
}

export const metaOCAD = metaBruta as {
  geradoEm: string;
  origem: string;
  acervos: Record<string, string>;
  regras: string[];
  exerciciosSemApuracao: string;
  conferencia: string;
};
