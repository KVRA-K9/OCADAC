export const pt = {
  titulo: "Visão Geral",
  descricao:
    "Orçamento e execução da despesa para a Criança e o Adolescente no Estado do Acre, do valor inicial ao efetivamente pago.",
  orcamentoInicial: "Orçamento Inicial",
  orcamentoAtualizado: "Orçamento Atualizado",
  empenhado: "Empenhado",
  liquidado: "Liquidado",
  pago: "Pago",
  disponivel: "Disponível",
  acoes: (n: number) => `${n} ações`,
  variacaoSobreInicial: (variacao: string, delta: string) =>
    `${variacao} sobre o inicial · ${delta}`,
  pctDoAtualizado: (pct: string) => `${pct} do atualizado`,
  pctDoAtualizadoNaoLiquidado: (pct: string) =>
    `${pct} do atualizado — ainda não liquidado`,
  cadeiaExecucaoTitulo: "Cadeia de execução da despesa",
  cadeiaExecucaoDica:
    "Do orçamento inicial ao valor efetivamente pago. Os percentuais são calculados sobre o orçamento atualizado.",
  infoGrafico: "Informação sobre o gráfico",
  infoCardsUnidade: "Informação sobre os cards de unidade",
  distribuicaoEixoTitulo: "Distribuição por Eixo Temático",
  distribuicaoEixoDica:
    "Valores baseados no Orçamento Inicial previsto para o exercício, distribuídos pelos eixos temáticos.",
  composicaoOcadTitulo: "Composição do Orçamento Criança e Adolescente - OCAD",
  composicaoOcadDica:
    "Clique em uma fatia do gráfico para visualizar a quantidade de ações por secretaria.",
  exclusivoPorEixoTitulo: "Exclusivo x Não Exclusivo por eixo",
  execucaoEixoTitulo: "Execução por eixo × classificação",
  execucaoEixoDica:
    "Clique em uma barra para ver o detalhamento das ações que compõem aquele intervalo de valor liquidado, dentro do eixo correspondente.",
  execucaoUnidadeTitulo: "Execução por unidade orçamentária",
  execucaoUnidadeDica:
    "Mesmo recorte usado nos filtros do BI: um órgão aparece em mais de um card quando executa por fundos distintos. Clique sobre o card para obter as informações de orçamento e execução.",
  nenhumaUnidade: "Nenhuma unidade corresponde aos filtros selecionados.",
  mostrarNome: (rotulo: string) => `Mostrar o nome de ${rotulo}`,
  mostrarValores: (rotulo: string) => `Mostrar os valores de ${rotulo}`,
  fonte: "Fonte",
  origemBase: "Planilha OCAD — mesma base do BI",
  notaBaseArquivo: (data: string, acoes: number, linhas: number) =>
    `Arquivo de ${data}, com ${acoes} ações consolidadas de ${linhas} linhas por fonte de recurso.`,
};

export const en: typeof pt = {
  titulo: "Overview",
  descricao:
    "Budget and expenditure execution for Children and Adolescents in the State of Acre, from initial budget to amount actually paid.",
  orcamentoInicial: "Initial Budget",
  orcamentoAtualizado: "Updated Budget",
  empenhado: "Committed",
  liquidado: "Settled",
  pago: "Paid",
  disponivel: "Available",
  acoes: (n: number) => `${n} ${n === 1 ? "action" : "actions"}`,
  variacaoSobreInicial: (variacao: string, delta: string) =>
    `${variacao} vs. initial · ${delta}`,
  pctDoAtualizado: (pct: string) => `${pct} of updated budget`,
  pctDoAtualizadoNaoLiquidado: (pct: string) =>
    `${pct} of updated budget — not yet settled`,
  cadeiaExecucaoTitulo: "Expenditure execution chain",
  cadeiaExecucaoDica:
    "From initial budget to amount actually paid. Percentages are calculated against the updated budget.",
  infoGrafico: "Chart information",
  infoCardsUnidade: "Information on budget unit cards",
  distribuicaoEixoTitulo: "Distribution by Thematic Axis",
  distribuicaoEixoDica:
    "Amounts based on the Initial Budget projected for the fiscal year, distributed across thematic axes.",
  composicaoOcadTitulo: "Composition of the Child and Adolescent Budget - OCAD",
  composicaoOcadDica:
    "Click a chart segment to view the number of actions by secretariat.",
  exclusivoPorEixoTitulo: "Exclusive vs. Non-exclusive by axis",
  execucaoEixoTitulo: "Execution by axis × classification",
  execucaoEixoDica:
    "Click a bar to see the breakdown of actions comprising that settled expenditure range within the corresponding axis.",
  execucaoUnidadeTitulo: "Execution by budget unit",
  execucaoUnidadeDica:
    "Same breakdown used in the BI filters: an agency appears in more than one card when executing through different funds. Click a card to view budget and execution details.",
  nenhumaUnidade: "No budget unit matches the selected filters.",
  mostrarNome: (rotulo: string) => `Show name of ${rotulo}`,
  mostrarValores: (rotulo: string) => `Show amounts for ${rotulo}`,
  fonte: "Source",
  origemBase: "OCAD spreadsheet — same database as the BI",
  notaBaseArquivo: (data: string, acoes: number, linhas: number) =>
    `File dated ${data}, with ${acoes} actions consolidated across ${linhas} rows by funding source.`,
};
