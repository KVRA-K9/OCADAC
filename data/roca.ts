/**
 * Referência ao Relatório do Orçamento Criança e Adolescente (ROCA), publicado
 * em PDF pela SEPLAN.
 *
 * O site NÃO usa o ROCA como base de valores — todos os números exibidos vêm do
 * painel de orçamentos temáticos (`data/visao-geral.ts`), fonte única. Este
 * módulo existe só para documentar a metodologia e registrar que o total
 * publicado no relatório difere do total do painel, diferença exibida ao leitor
 * em `components/dashboard/nota-fontes.tsx`.
 */

import { relatoriosOcad, URL_SEPLAN_OCAD } from "./relatorios";

export const ANO_ROCA_ATUAL = 2026;

export const META_ROCA = {
  anoReferencia: ANO_ROCA_ATUAL,
  fonte: `ROCA ${ANO_ROCA_ATUAL}`,
  orgao: "Secretaria de Estado de Planejamento (SEPLAN/AC)",
  urlRelatorio:
    relatoriosOcad.find((r) => r.ano === ANO_ROCA_ATUAL)?.url ?? URL_SEPLAN_OCAD,
  urlPagina: URL_SEPLAN_OCAD,
  ponderador: 0.36,
  ponderadorJustificativa:
    "Ações não exclusivas entram a 36%, proporção da população de 0 a 19 anos do Acre, conforme metodologia da Fundação Abrinq adotada pelo ROCA. Ações exclusivas entram integralmente.",
  notaExecutado:
    "O ROCA considera executado o orçamento pago dentro do exercício de apuração. O painel de orçamentos temáticos publica apenas o liquidado — por isso este site não rotula nenhum valor como “executado”.",
} as const;

/**
 * Total publicado na Tabela 4 do ROCA 2026. Serve apenas de contraponto: o
 * painel não traz todas as ações não exclusivas que o relatório contabiliza, e
 * a diferença está inteira nesse recorte (o lado exclusivo bate).
 */
export const TOTAL_PUBLICADO_ROCA = {
  ano: ANO_ROCA_ATUAL,
  total: 3_336_053_795.37,
  exclusivo: 2_410_139_468.28,
  naoExclusivo: 925_914_327.09,
} as const;
