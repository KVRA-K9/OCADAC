/**
 * Dicionários de interface por domínio de tela.
 *
 * Cada arquivo de domínio exporta `pt` e `en` com exatamente a mesma forma —
 * `en: typeof pt` garante, em tempo de compilação, que nenhum texto fique sem
 * tradução. A montagem abaixo é o ponto único de onde `useT()` lê os textos
 * do idioma ativo.
 */

import * as common from "./common";
import * as nav from "./nav";
import * as landing from "./landing";
import * as painel from "./painel";
import * as tabela from "./tabela";
import * as evolucao from "./evolucao";
import * as historico from "./historico";
import * as ods from "./ods";
import * as exportar from "./exportar";

export type Locale = "pt" | "en";

export const LOCALE_COOKIE = "ocad-locale";

export type Messages = {
  common: typeof common.pt;
  nav: typeof nav.pt;
  landing: typeof landing.pt;
  painel: typeof painel.pt;
  tabela: typeof tabela.pt;
  evolucao: typeof evolucao.pt;
  historico: typeof historico.pt;
  ods: typeof ods.pt;
  exportar: typeof exportar.pt;
};

export const MESSAGES: Record<Locale, Messages> = {
  pt: {
    common: common.pt,
    nav: nav.pt,
    landing: landing.pt,
    painel: painel.pt,
    tabela: tabela.pt,
    evolucao: evolucao.pt,
    historico: historico.pt,
    ods: ods.pt,
    exportar: exportar.pt,
  },
  en: {
    common: common.en,
    nav: nav.en,
    landing: landing.en,
    painel: painel.en,
    tabela: tabela.en,
    evolucao: evolucao.en,
    historico: historico.en,
    ods: ods.en,
    exportar: exportar.en,
  },
};
