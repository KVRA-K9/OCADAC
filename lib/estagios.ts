/**
 * Cores, rótulos e siglas compartilhados entre gráficos e cards.
 *
 * Ficam num módulo só para que a legenda de um gráfico e o marcador de um card
 * nunca divirjam: duas listas paralelas de cores acabam saindo de sincronia.
 */

import type { Estagio } from "@/lib/types";
import type { Locale } from "@/lib/messages";

export const SERIES_COLORS: Record<string, string> = {
  ocadInicial: "var(--chart-1)",
  ocadAtualizado: "var(--chart-2)",
  ocadEmpenhado: "var(--chart-4)",
  ocadLiquidado: "var(--chart-3)",
  ocadPago: "var(--chart-5)",
  ocadDisponivel: "var(--chart-6)",
};

/** Tom de cada eixo do OCAD, usado nos gráficos e nas pílulas das tabelas. */
export const CORES_EIXO: Record<string, string> = {
  "Educação": "#f7bb75",
  "Saúde": "#d15c57",
  "Assistência Social": "#92bf9f",
  "Outras": "var(--muted-foreground)",
};

export const ROTULOS_ESTAGIO: Record<string, string> = {
  ocadInicial: "Orçamento Inicial",
  ocadAtualizado: "Orçamento Atualizado",
  ocadEmpenhado: "Empenhado",
  ocadLiquidado: "Liquidado",
  ocadPago: "Pago",
  ocadDisponivel: "Disponível",
};

export const ROTULOS_ESTAGIO_EN: Record<string, string> = {
  ocadInicial: "Initial Budget",
  ocadAtualizado: "Updated Budget",
  ocadEmpenhado: "Committed",
  ocadLiquidado: "Settled",
  ocadPago: "Paid",
  ocadDisponivel: "Available",
};

/** Rótulos dos estágios da despesa no idioma ativo. */
export function getRotulosEstagio(locale: Locale): Record<string, string> {
  return locale === "en" ? ROTULOS_ESTAGIO_EN : ROTULOS_ESTAGIO;
}

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
  "SECRETARIA EXTRAORDINÁRIA DE ESPORTE E LAZER - SEEL": "SEEL",
  "SECRETARIA DE ESTADO DE HABITAÇÃO E URBANISMO - SEHURB": "SEHURB",
};

/**
 * Corrige quebras de hifenização e erros de digitação vindos diretamente do
 * cadastro do SICAF (ex.: `PAGAMEN TO`, `DESENVOLVI - MENTO`, `ESPOR- TE`).
 */
export function higienizarTextoSicaf(bruto: string): string {
  return bruto
    .replace(/PAGAMEN\s+TO/gi, "PAGAMENTO")
    .replace(/DESENVOLVI\s*-\s*MENTO/gi, "DESENVOLVIMENTO")
    .replace(/ESPOR\s*-\s*TE/gi, "ESPORTE")
    .replace(/ASSIT[ÊE]NCIA/gi, "ASSISTÊNCIA")
    .replace(/ACRE\s*-\s*FUNDHACRE/gi, "ACRE - FUNDHACRE")
    .replace(/\s+/g, " ")
    .trim();
}

/** Nome do órgão como vai para a tela. */
export function nomeOrgao(nome: string): string {
  return higienizarTextoSicaf(nome);
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

const SIGLAS_PRESERVADAS = new Set([
  "AC",
  "FDCA",
  "FEAS",
  "FEM",
  "FUNDES",
  "FUNDEB",
  "FUNDHACRE",
  "IEPTEC",
  "ISE",
  "SEAD",
  "SEASDH",
  "SEE",
  "SEEL",
  "SEHURB",
  "SEJUSP",
  "SEMULHER",
  "SEOP",
  "SESACRE",
]);

const PREPOSICOES_PT = new Set(["da", "das", "de", "do", "dos", "e", "em", "na", "no"]);

/**
 * Converte nomes vindos em caixa alta do SICAF para leitura natural,
 * preservando siglas institucionais e preposições em minúsculo.
 */
export function formatarNomeInstituicao(bruto: string): string {
  const limpo = bruto
    .replace(/\s*-\s+/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  return limpo
    .split(" ")
    .map((palavra, idx) => {
      if (palavra === "-" || palavra === "/") return palavra;
      const upper = palavra.toUpperCase();
      const semPontuacao = upper.replace(/[.,;:]+$/, "");
      if (SIGLAS_PRESERVADAS.has(semPontuacao)) return upper;
      const lower = palavra.toLowerCase();
      if (idx > 0 && PREPOSICOES_PT.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function nomeUnidade(unidade: string, secretaria: string): string {
  const normalizada = higienizarTextoSicaf(unidade).toUpperCase();
  if (normalizada === UNIDADE_GENERICA) {
    return formatarNomeInstituicao(nomeOrgao(secretaria));
  }
  return formatarNomeInstituicao(higienizarTextoSicaf(unidade));
}
