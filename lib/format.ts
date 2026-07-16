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

export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

export function formatNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}
