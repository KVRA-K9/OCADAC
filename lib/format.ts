import type { Locale } from "@/lib/messages";

/*
 * Todos os formatadores dependem do idioma ativo: separadores (1.234,5 x
 * 1,234.5), abreviações compactas (mi/bi x M/B) e datas. Por isso não há
 * exports soltos aqui — quem formata precisa dizer o idioma, e nos componentes
 * isso vem de `useFormat()` (lib/i18n).
 */

const INTL_LOCALE: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
};

function criarFormatadores(locale: Locale) {
  const intl = INTL_LOCALE[locale];

  const moeda = new Intl.NumberFormat(intl, {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  const moedaCompacta = new Intl.NumberFormat(intl, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  const percent = new Intl.NumberFormat(intl, {
    style: "percent",
    maximumFractionDigits: 1,
  });

  const numero = new Intl.NumberFormat(intl);

  const decimal = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 });

  /*
   * Data no formato do idioma: dd/mm/aaaa em português e "Sep 21, 2026" em
   * inglês — numérica, a data americana (09/21/2026) leria como outra data para
   * quem espera dia/mês. UTC porque a entrada é só a data (AAAA-MM-DD): no fuso
   * local ela recuaria um dia.
   */
  const data =
    locale === "en"
      ? new Intl.DateTimeFormat(intl, {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : new Intl.DateTimeFormat(intl, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "UTC",
        });

  const formatMoeda = (valor: number): string => moeda.format(valor);

  const formatMoedaCompacta = (valor: number): string =>
    `R$ ${moedaCompacta.format(valor)}`;

  /*
   * Os quatro primeiros exercícios do acervo foram fixados em cruzeiro e a
   * planilha os traz em milhares. Ficam na moeda da época: convertê-los para real
   * pelos cortes monetários dá números sem significado (Cr$ 4.518.657 mil viram
   * R$ 1.643).
   */
  const formatCruzeiroMil = (valor: number): string =>
    `Cr$ ${numero.format(valor)} ${locale === "en" ? "thousand" : "mil"}`;

  const formatPercent = (ratio: number): string => percent.format(ratio);

  /** Menor participação que uma casa decimal consegue exprimir. */
  const PISO_PARTICIPACAO = 0.001;

  /**
   * Participação com piso explícito: "< 0,1%" quando a fatia é positiva mas não
   * chega a uma décima.
   *
   * Uma fonte de R$ 360 num orçamento de R$ 3,2 bilhões aparecia como "0%", que
   * se lê como ausência de valor — e não é: são R$ 360 de verdade. Zero exato
   * continua "0%", porque ali é verdade, não arredondamento.
   */
  const formatParticipacao = (ratio: number): string => {
    if (ratio > 0 && ratio < PISO_PARTICIPACAO) {
      return `< ${percent.format(PISO_PARTICIPACAO)}`;
    }
    return percent.format(ratio);
  };

  /**
   * Variação percentual com sinal sempre explícito. O "+" importa: sem ele, um
   * acréscimo de crédito e uma anulação ficam visualmente iguais.
   */
  const formatVariacao = (ratio: number): string =>
    `${ratio > 0 ? "+" : ""}${percent.format(ratio)}`;

  /** Valor com sinal explícito, em notação compacta. */
  const formatVariacaoMoeda = (valor: number): string => {
    const sinal = valor > 0 ? "+" : valor < 0 ? "−" : "";
    return `${sinal}${formatMoedaCompacta(Math.abs(valor))}`;
  };

  const formatNumero = (valor: number): string => numero.format(valor);

  /** Número com até uma casa decimal, no separador do idioma ("1,5" x "1.5"). */
  const formatDecimal = (valor: number): string => decimal.format(valor);

  /**
   * Data (AAAA-MM-DD) no formato do idioma. Entrada que não é uma data ISO
   * volta como veio: melhor mostrar o texto da fonte do que "Invalid Date".
   */
  const formatData = (iso: string): string => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const d = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? iso : data.format(d);
  };

  return {
    formatMoeda,
    formatMoedaCompacta,
    formatCruzeiroMil,
    formatPercent,
    formatParticipacao,
    formatVariacao,
    formatVariacaoMoeda,
    formatNumero,
    formatDecimal,
    formatData,
  };
}

export type Formatadores = ReturnType<typeof criarFormatadores>;

const cache: Partial<Record<Locale, Formatadores>> = {};

/** Formatadores do idioma, criados uma vez e reaproveitados. */
export function getFormatadores(locale: Locale): Formatadores {
  return (cache[locale] ??= criarFormatadores(locale));
}
