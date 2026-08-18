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
 * Nomes que a planilha grava com quebra de palavra no meio. Um mapa explícito,
 * e não uma regra do tipo "hífen seguido de espaço": a unidade
 * `FUNDAÇÃO HOSPITAL ESTADUAL DO ACRE- FUNDHACRE` tem a mesma forma sem ser
 * quebra, e viraria uma palavra só.
 */
export const NOMES_ORGAOS: Record<string, string> = {
  "SECRETARIA EXTRAORDINÁRIA DE ESPOR- TE E LAZER - SEEL":
    "SECRETARIA EXTRAORDINÁRIA DE ESPORTE E LAZER - SEEL",
};

/** Nome do órgão como vai para a tela. */
export function nomeOrgao(nome: string): string {
  return NOMES_ORGAOS[nome] ?? nome;
}

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
 * Tom de cada secretaria nos cards de unidade. Chaveado pela sigla.
 *
 * São as mesmas cores que os gráficos já usam — os seis tokens de `--chart-*` e
 * os tons dos eixos temáticos — para o painel inteiro falar uma língua só.
 * Secretaria fora do mapa cai num cinza neutro, sem inventar cor nova.
 */
export const CORES_SECRETARIA: Record<string, string> = {
  SEE: "var(--chart-1)",
  SESACRE: "var(--chart-2)",
  SEASDH: "var(--chart-3)",
  SEJUSP: "var(--chart-4)",
  SEAD: "var(--chart-5)",
  SEOP: "var(--chart-6)",
  SEEL: "#f7bb75",
  SEHURB: "#92bf9f",
  SEMULHER: "#d15c57",
};

/** Tom da secretaria a que a unidade pertence. */
export function corSecretaria(nome: string): string {
  return CORES_SECRETARIA[siglaOrgao(nome)] ?? "var(--muted-foreground)";
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

/**
 * A planilha não nomeia a unidade principal do órgão: grava só
 * "UNIDADE GESTORA", igual em sete unidades. Nesses casos o nome de exibição é
 * o da secretaria, que já vem na forma `NOME COMPLETO - SIGLA`.
 *
 * A comparação é exata, e não por prefixo, para preservar
 * `UNIDADE GESTORA DA FOLHA DE PAGAMEN TO DE PESSOAL`, que diz a que veio.
 */
const UNIDADE_GENERICA = "UNIDADE GESTORA";

export function nomeUnidade(unidade: string, secretaria: string): string {
  return unidade.trim().toUpperCase() === UNIDADE_GENERICA
    ? nomeOrgao(secretaria)
    : unidade;
}
