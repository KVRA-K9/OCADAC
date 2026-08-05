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

/**
 * Logotipo próprio de unidades que não usam a arte da secretaria. Chaveado por
 * `códigoDoÓrgão/códigoDaUnidade`; o arquivo troca a barra por hífen.
 */
export const LOGOS_UNIDADE: Record<string, { src: string; alt: string }> = {
  "717/212": {
    src: "/logos/717-212.webp",
    alt: "Logotipo do Instituto Estadual de Educação Profissional e Tecnológica",
  },
  "719/213": {
    src: "/logos/719-213.webp",
    alt: "Logotipo do Instituto Socioeducativo do Acre",
  },
  "721/302": {
    src: "/logos/721-302.webp",
    alt: "Logotipo da Fundação Hospital Estadual do Acre",
  },
};

/**
 * Logotipo a exibir numa unidade: o próprio, se houver, senão o da secretaria
 * a que ela pertence.
 */
export function logoUnidade(chave: string, secretaria: string) {
  return LOGOS_UNIDADE[chave] ?? logoOrgao(secretaria);
}

/**
 * Rótulo de cada unidade orçamentária, na nomenclatura do BI — `SIGLA` para a
 * unidade principal do órgão e `SIGLA/FUNDO` para as demais. A chave é
 * `códigoDoÓrgão/códigoDaUnidade`.
 *
 * É um mapa explícito, e não uma regra derivada do nome da unidade, porque a
 * convenção não é dedutível: `714/002` é FOLHA GERAL e `714/607` é FOLHA
 * FUNDES, ambas sem "001" e sem o termo no nome cadastrado.
 */
export const ROTULOS_UNIDADE: Record<string, string> = {
  "714/607": "SEAD/FOLHA/FUNDES",
  "714/002": "SEAD/FOLHA GERAL",
  "760/001": "SEASDH",
  "760/606": "SEASDH/FDCA",
  "760/608": "SEASDH/FEAS",
  "717/001": "SEE",
  "717/303": "SEE/FEM",
  "717/601": "SEE/FUNDEB",
  "717/212": "SEE/IEPTEC",
  "718/001": "SEEL",
  "744/001": "SEHURB",
  "719/213": "SEJUSP/ISE",
  "762/001": "SEMULHER",
  "754/001": "SEOP",
  "721/001": "SESACRE",
  "721/607": "SESACRE/FUNDES",
  "721/302": "FUNDHACRE",
};

/**
 * Rótulo da unidade. Sem entrada no mapa — unidade nova na planilha — monta
 * `SIGLA/CÓDIGO`, que identifica sem inventar um apelido.
 */
export function rotuloUnidade(
  secretaria: string,
  orgaoCodigo: string,
  unidadeCodigo: string,
): string {
  return (
    ROTULOS_UNIDADE[`${orgaoCodigo}/${unidadeCodigo}`] ??
    `${siglaOrgao(secretaria)}/${unidadeCodigo}`
  );
}
