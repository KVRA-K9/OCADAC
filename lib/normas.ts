/**
 * Cor de cada tipo de norma na linha do tempo.
 *
 * São os mesmos seis tokens de `--chart-*` que os gráficos e os cards usam —
 * seis tipos, seis tokens, nenhuma cor nova entrando no sistema. Fica separado
 * de `lib/estagios.ts` porque nada aqui tem a ver com estágio da despesa.
 */

import {
  Building2,
  Landmark,
  ListChecks,
  Map,
  Scale,
  Stamp,
  type LucideIcon,
} from "lucide-react";

import type { TipoNorma } from "@/data/historico-leis";
import type { Locale } from "@/lib/messages";

export const CORES_NORMA: Record<TipoNorma, string> = {
  "Lei Ordinária": "var(--chart-5)",
  Decreto: "var(--chart-6)",
  "Estrutura Administrativa": "var(--chart-3)",
  PPA: "var(--chart-4)",
  /* O único que não entra cru: `--chart-1` é o mais claro dos seis
   * (oklch L 0.89) e, lavado no `--card`, o botão e os cartões da LDO ficavam
   * quase brancos. Aqui ele desce um degrau de luminosidade e mantém croma e
   * matiz — continua sendo a cor do token, só que mais firme, e acompanha
   * qualquer mudança futura em `--chart-1`. */
  LDO: "oklch(from var(--chart-1) calc(l - 0.08) c h)",
  LOA: "var(--chart-2)",
};

/** Ícone de cada tipo, para os nós do caminho e as fichas das normas. */
export const ICONES_NORMA: Record<TipoNorma, LucideIcon> = {
  "Lei Ordinária": Scale,
  Decreto: Stamp,
  "Estrutura Administrativa": Building2,
  PPA: Map,
  LDO: ListChecks,
  LOA: Landmark,
};

/**
 * Subtítulo do cabeçalho da aba aberta no acervo: o que o instrumento é e o que
 * ele faz, no mesmo registro de `BASES_LEGAIS` em `lib/conteudo-ocad.ts`.
 * Nenhuma promete cobertura que os dados não têm — daí a LOA dizer "onde houve
 * curadoria", o mesmo termo da legenda do gráfico logo abaixo, e o Decreto dizer
 * "entre eles", já que só metade dos seis trata do comitê.
 *
 * PPA, LDO e LOA abrem com o nome por extenso: o título do cabeçalho e o botão do
 * seletor mostram só a sigla, e esta linha é o único lugar da tela onde ela é
 * traduzida.
 */
export const DESCRICOES_NORMA: Record<TipoNorma, string> = {
  "Lei Ordinária":
    "Leis avulsas que criam programas, serviços e obrigações voltados à proteção de crianças e adolescentes no Acre.",
  Decreto:
    "Atos do Poder Executivo, entre eles os que instituem e alteram o Comitê de Apuração do OCAD.",
  /* O campo `orgaos` destas 13 normas guarda a resposta que a frase promete:
   * Assessoria da Juventude, SEDS, SEASDHM, SEASDH, SEASD, SEE — mais o CEDCA,
   * criado pela Lei 1.011/1991, a mais antiga da aba. */
  "Estrutura Administrativa":
    "Leis que definem qual órgão do Executivo responde pela criança e pelo adolescente, e como isso mudou desde 1991.",
  PPA: "Plano Plurianual: os programas de governo de cada quadriênio, e onde eles citam criança e adolescente.",
  LDO: "Lei de Diretrizes Orçamentárias: orienta a elaboração do orçamento seguinte e fixa suas metas e prioridades.",
  LOA: "Lei Orçamentária Anual: estima a receita e fixa a despesa do exercício, com o OCAD apurado onde houve curadoria.",
};

export const DESCRICOES_NORMA_EN: Record<TipoNorma, string> = {
  "Lei Ordinária":
    "Ordinary laws that create programs, services and obligations aimed at protecting children and adolescents in Acre.",
  Decreto:
    "Acts of the Executive Branch, including those that establish and amend the OCAD Assessment Committee.",
  "Estrutura Administrativa":
    "Laws that define which Executive Branch agency is responsible for children and adolescents, and how this has changed since 1991.",
  PPA: "Multi-Year Plan: the government programs of each four-year period, and where they mention children and adolescents.",
  LDO: "Budget Guidelines Law: guides the preparation of the following year's budget and sets its goals and priorities.",
  LOA: "Annual Budget Law: estimates revenue and fixes expenditure for the fiscal year, with the OCAD calculated wherever curation took place.",
} as Record<TipoNorma, string>;

/** Descrições dos tipos de norma no idioma ativo. */
export function getDescricoesNorma(locale: Locale): Record<TipoNorma, string> {
  return locale === "en" ? DESCRICOES_NORMA_EN : DESCRICOES_NORMA;
}
