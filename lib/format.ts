const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const moedaCompacta = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatMoeda(valor: number): string {
  return moeda.format(valor);
}

export function formatMoedaCompacta(valor: number): string {
  return `R$ ${moedaCompacta.format(valor)}`;
}

/*
 * Os quatro primeiros exercícios do acervo foram fixados em cruzeiro e a
 * planilha os traz em milhares. Ficam na moeda da época: convertê-los para real
 * pelos cortes monetários dá números sem significado (Cr$ 4.518.657 mil viram
 * R$ 1.643).
 */
export function formatCruzeiroMil(valor: number): string {
  return `Cr$ ${new Intl.NumberFormat("pt-BR").format(valor)} mil`;
}

export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

/**
 * Variação percentual com sinal sempre explícito. O "+" importa: sem ele, um
 * acréscimo de crédito e uma anulação ficam visualmente iguais.
 */
export function formatVariacao(ratio: number): string {
  return `${ratio > 0 ? "+" : ""}${percent.format(ratio)}`;
}

/** Valor com sinal explícito, em notação compacta. */
export function formatVariacaoMoeda(valor: number): string {
  const sinal = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return `${sinal}${formatMoedaCompacta(Math.abs(valor))}`;
}

export function formatNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}
