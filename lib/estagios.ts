/**
 * Cores, rótulos e siglas compartilhados entre gráficos e cards.
 *
 * Ficam num módulo só para que a legenda de um gráfico e o marcador de um card
 * nunca divirjam: duas listas paralelas de cores acabam saindo de sincronia.
 */

import type { Estagio } from "@/lib/types";

export const SERIES_COLORS: Record<string, string> = {
  ocadInicial: "var(--chart-1)",
  ocadAtualizado: "var(--chart-2)",
  ocadEmpenhado: "var(--chart-4)",
  ocadLiquidado: "var(--chart-3)",
  ocadPago: "var(--chart-5)",
  ocadDisponivel: "var(--chart-6)",
};

export const ROTULOS_ESTAGIO: Record<string, string> = {
  ocadInicial: "Orçamento Inicial",
  ocadAtualizado: "Orçamento Atualizado",
  ocadEmpenhado: "Empenhado",
  ocadLiquidado: "Liquidado",
  ocadPago: "Pago",
  ocadDisponivel: "Disponível",
};

/** Estágios exibidos no recorte por secretaria. */
export const ESTAGIOS_SECRETARIA = [
  "ocadAtualizado",
  "ocadEmpenhado",
  "ocadLiquidado",
  "ocadPago",
] as const satisfies readonly Estagio[];

/** Nome completo do órgão → sigla, para títulos curtos. */
export const SIGLAS_ORGAOS: Record<string, string> = {
  "SECRETARIA DE ESTADO DE ADMINISTRAÇÃO - SEAD": "SEAD",
  "SECRETARIA DE ESTADO DA EDUCAÇÃO, CULTURA E ESPORTES - SEE": "SEE",
  "SECRETARIA DE ESTADO DE ASSISTÊNCIA SOCIAL E DIREITOS HUMANOS - SEASDH":
    "SEASDH",
  "SECRETARIA DE ESTADO DE SAÚDE - SESACRE": "SESACRE",
  "SECRETARIA DE ESTADO DA JUSTIÇA E SEGURANÇA PÚBLICA - SEJUSP": "SEJUSP",
  "SECRETARIA DE ESTADO DA MULHER - SEMULHER": "SEMULHER",
  "SECRETARIA DE ESTADO DE OBRAS PÚBLICAS - SEOP": "SEOP",
  "SECRETARIA EXTRAORDINÁRIA DE ESPOR- TE E LAZER - SEEL": "SEEL",
  "SECRETARIA DE ESTADO DE HABITAÇÃO E URBANISMO - SEHURB": "SEHURB",
};

/**
 * Sigla do órgão. Sem entrada no mapa, cai para o trecho após o último hífen do
 * nome — que é onde a sigla costuma estar — e, na falta dele, para o nome todo.
 */
export function siglaOrgao(nome: string): string {
  const conhecida = SIGLAS_ORGAOS[nome];
  if (conhecida) return conhecida;
  const partes = nome.split(" - ");
  return partes.length > 1 ? partes[partes.length - 1].trim() : nome;
}

/**
 * Logo de cada secretaria, servida de `public/logos/`. Chaveada pela sigla.
 *
 * Os arquivos são gerados por `npm run logos`, que normaliza todos na mesma
 * tela — é o que os deixa do mesmo tamanho no card. Secretarias ausentes daqui
 * simplesmente não viram, para o card não prometer uma imagem que não existe.
 */
export const LOGOS_ORGAOS: Record<string, { src: string; alt: string }> = {
  SEE: {
    src: "/logos/see.webp",
    alt: "Logotipo da Secretaria de Estado da Educação, Cultura e Esportes",
  },
  SEAD: {
    src: "/logos/sead.webp",
    alt: "Logotipo da Secretaria de Estado de Administração",
  },
  SESACRE: {
    src: "/logos/sesacre.webp",
    alt: "Logotipo da Secretaria de Estado de Saúde",
  },
  SEASDH: {
    src: "/logos/seasdh.webp",
    alt: "Logotipo da Secretaria de Estado de Assistência Social e Direitos Humanos",
  },
  SEJUSP: {
    src: "/logos/sejusp.webp",
    alt: "Logotipo da Secretaria de Estado da Justiça e Segurança Pública",
  },
  SEEL: {
    src: "/logos/seel.webp",
    alt: "Logotipo da Secretaria Extraordinária de Esporte e Lazer",
  },
  SEOP: {
    src: "/logos/seop.webp",
    alt: "Logotipo da Secretaria de Estado de Obras Públicas",
  },
  SEHURB: {
    src: "/logos/sehurb.webp",
    alt: "Logotipo da Secretaria de Estado de Habitação e Urbanismo",
  },
  SEMULHER: {
    src: "/logos/semulher.webp",
    alt: "Logotipo da Secretaria de Estado da Mulher",
  },
};

export function logoOrgao(nome: string) {
  return LOGOS_ORGAOS[siglaOrgao(nome)];
}
