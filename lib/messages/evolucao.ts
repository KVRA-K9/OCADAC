export const pt = {
  titulo: "Evolução Temporal",
  descricao:
    "Comparativo ponderado do OCAD por exercício, do orçamento inicial ao valor pago. Cada ano identifica a planilha de origem e sua data.",
  orcamentosTitulo:
    "Orçamento Inicial e Atualizado (ponderados) — por exercício",
  variacaoTitulo: (de: number, ate: number) => `Variação ${de}–${ate}`,
  variacaoSentido: (aumento: boolean, de: number, ate: number) =>
    aumento
      ? `Aumento no orçamento inicial entre ${de} e ${ate}`
      : `Redução no orçamento inicial entre ${de} e ${ate}`,
  execucaoOrcamentaria: "Execução orçamentária",
  ponderacaoNota:
    "Todos os exercícios vêm de planilhas OCAD e trazem os cinco estágios, do orçamento inicial ao valor pago.",
  liquidadoTitulo: "Liquidado sobre o orçamento atualizado — por exercício",
  medidorLiquidado: (valor: string) => `${valor} liquidado`,
  medidorAtualizado: (valor: string) => `atualizado: ${valor}`,
  fonteCorte: (fonte: string, data: string) => `${fonte} · corte ${data}`,
  estagiosTitulo: "Estágios da despesa por exercício (ponderados)",
  valor: "Valor",
  outras: "Outras",
  faixas: [
    "< 10 mil",
    "10k – 100k",
    "100k – 1 mi",
    "1 – 10 mi",
    "10 – 100 mi",
    "100 mi +",
  ],
  faixa: (rotulo: string) => `Faixa: ${rotulo}`,
  acoes: (n: number) => `${n} ações`,
  acoesLabel: "ações",
  totalNaFaixa: "Total na faixa:",
  liquidadoRotulo: "liquidado:",
  totalLiquidado: "Total liquidado:",
  acoesFaixaAria: (faixa: string, eixo: string) =>
    `Ações da faixa ${faixa} em ${eixo}`,
  acoesSecretariaAria: (classificacao: string) =>
    `Ações ${classificacao} por secretaria`,
  semAcoesFaixa: "Sem ações nesta faixa.",
  semAcoesCategoria: "Sem ações nesta categoria.",
  fechar: "Fechar",
  ocadLiquidado: "OCAD Liquidado",
};

export const en: typeof pt = {
  titulo: "Multi-Year Evolution",
  descricao:
    "Weighted OCAD comparison by fiscal year, from initial budget to amount paid. Each year identifies the source spreadsheet and its date.",
  orcamentosTitulo: "Initial and Updated Budget (weighted) — by fiscal year",
  variacaoTitulo: (de, ate) => `Change ${de}–${ate}`,
  variacaoSentido: (aumento, de, ate) =>
    aumento
      ? `Increase in initial budget between ${de} and ${ate}`
      : `Decrease in initial budget between ${de} and ${ate}`,
  execucaoOrcamentaria: "Budget execution",
  ponderacaoNota:
    "All fiscal years come from OCAD spreadsheets and comprise the five stages, from initial budget to amount paid.",
  liquidadoTitulo: "Settled vs. updated budget — by fiscal year",
  medidorLiquidado: (valor) => `${valor} settled`,
  medidorAtualizado: (valor) => `updated: ${valor}`,
  fonteCorte: (fonte, data) => `${fonte} · cut-off ${data}`,
  estagiosTitulo: "Expenditure stages by fiscal year (weighted)",
  valor: "Amount",
  outras: "Others",
  faixas: [
    "< 10k",
    "10k – 100k",
    "100k – 1M",
    "1 – 10M",
    "10 – 100M",
    "100M +",
  ],
  faixa: (rotulo) => `Range: ${rotulo}`,
  acoes: (n) => `${n} ${n === 1 ? "action" : "actions"}`,
  acoesLabel: "actions",
  totalNaFaixa: "Total in range:",
  liquidadoRotulo: "settled:",
  totalLiquidado: "Total settled:",
  acoesFaixaAria: (faixa, eixo) => `Actions in range ${faixa} in ${eixo}`,
  acoesSecretariaAria: (classificacao) =>
    `${classificacao} actions by secretariat`,
  semAcoesFaixa: "No actions in this range.",
  semAcoesCategoria: "No actions in this category.",
  fechar: "Close",
  ocadLiquidado: "OCAD Settled",
};
