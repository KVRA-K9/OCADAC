export const pt = {
  titulo: "Objetivos de Desenvolvimento Sustentável — ODS",
  descricao:
    "Indicadores dos 18 ODS contemplados pelos eixos do Orçamento Criança e Adolescente (OCAD): Educação, Saúde e Assistência Social.",
  kpiIndicadoresTitulo: "Indicadores contemplados",
  kpiIndicadoresDica: "Total de indicadores nos 18 ODS",
  kpiOdsTitulo: "ODS contemplados",
  kpiOdsDica: "ODS com ao menos um indicador contemplado pelo OCAD",
  kpiEixoTitulo: "Contemplação por eixo",
  kpiEixoDica: "Indicadores contemplados por eixo",
  kpiTransversaisTitulo: "Indicadores transversais",
  kpiTransversaisDica: "Indicadores contemplados por mais de um eixo",
  filtroEixo: "Eixo:",
  filtroStatus: "Status:",
  todos: "Todos",
  buscaPlaceholder: "Buscar por código, descrição ou ODS...",
  altOds: (numero: number) => `ODS ${numero}`,
  altOdsTitulo: (numero: number, titulo: string) => `ODS ${numero} — ${titulo}`,
  remover: "Fechar",
  removerAria: (numero: number) => `Fechar ODS ${numero} da seleção`,
  limparSelecao: (quantidade: number) => `Limpar seleção (${quantidade})`,
  vazioOds: "Nenhum indicador contemplado neste ODS pelo escopo do OCAD.",
  dicaSelecao:
    "Clique nos ODS acima para visualizar seus indicadores contemplados. Você pode selecionar mais de um.",
  sobreLinksBtn: "Sobre os links dos indicadores",
  sobreLinksTitulo: "Sobre os links dos indicadores",
  sobreLinksP1:
    "Os códigos com link levam à ficha do indicador produzido no portal ODS Brasil, do IBGE.",
  sobreLinksP2:
    "Os demais estão em elaboração, em análise ou sem dados produzidos pelo Governo Federal.",
  linkRelatorioSintese: "Acessar Relatório de Síntese no ODS Brasil",
  verFichaAria: (codigo: string) =>
    `Ver ficha do indicador ${codigo} no portal ODS Brasil (IBGE)`,
};

export const en: typeof pt = {
  titulo: "Sustainable Development Goals — SDGs",
  descricao:
    "Indicators across the 18 SDGs covered by the thematic axes of the Child and Adolescent Budget (OCAD): Education, Health, and Social Assistance.",
  kpiIndicadoresTitulo: "Indicators covered",
  kpiIndicadoresDica: "Total indicators across the 18 SDGs",
  kpiOdsTitulo: "SDGs covered",
  kpiOdsDica: "SDGs with at least one indicator covered by OCAD",
  kpiEixoTitulo: "Coverage by thematic axis",
  kpiEixoDica: "Indicators covered by thematic axis",
  kpiTransversaisTitulo: "Cross-cutting indicators",
  kpiTransversaisDica: "Indicators covered by more than one axis",
  filtroEixo: "Axis:",
  filtroStatus: "Status:",
  todos: "All",
  buscaPlaceholder: "Search by code, description, or SDG...",
  altOds: (numero: number) => `SDG ${numero}`,
  altOdsTitulo: (numero: number, titulo: string) => `SDG ${numero} — ${titulo}`,
  remover: "Close",
  removerAria: (numero: number) => `Close SDG ${numero} selection`,
  limparSelecao: (quantidade: number) => `Clear selection (${quantidade})`,
  vazioOds: "No indicators covered in this SDG within the OCAD scope.",
  dicaSelecao:
    "Click the SDGs above to view their covered indicators. You can select more than one.",
  sobreLinksBtn: "About indicator links",
  sobreLinksTitulo: "About the indicator links",
  sobreLinksP1:
    "Linked codes lead to the produced indicator sheet on the ODS Brasil portal, by IBGE.",
  sobreLinksP2:
    "The others are under development, under analysis, or without data produced by the Federal Government.",
  linkRelatorioSintese: "Open Synthesis Report on ODS Brasil",
  verFichaAria: (codigo: string) =>
    `View indicator sheet for ${codigo} on the ODS Brasil portal (IBGE)`,
};
