export const pt = {
  titulo: "Tabela Detalhada",
  descricao:
    "Ações do Orçamento Criança e Adolescente por órgão, unidade orçamentária e ação, do orçamento inicial ao valor pago. Clique em uma linha para abrir o nível seguinte.",
  registros: (n: number) => `${n} registros`,
  execucaoPorOrgao: "Execução por órgão, unidade e ação",
  visaoTabela: "Tabela",
  visaoDetalhado: "Detalhado",
  exportar: "Exportar",
  formatoExportacao: "Formato de exportação",
  semRegistros: "Não há registros para exportar.",
  pdfExportado: "PDF exportado com sucesso.",
  falhaPdf: "Falha ao exportar PDF.",
  xlsxExportado: "Planilha exportada com sucesso.",
  falhaXlsx: "Falha ao exportar planilha.",

  filtros: "Filtros",
  limparFiltros: "Limpar filtros",
  ano: "Ano",
  eixo: "Eixo",
  classificacao: "Classificação",
  secretaria: "Secretaria",
  todosOsAnos: "Todos os anos",
  todasAsClassificacoes: "Todas as Classificações",
  todosOsEixos: "Todos os Eixos",
  todasAsSecretarias: "Todas as Secretarias",

  orgaoUnidadeAcao: "Órgão / Unidade / Ação",
  expandirTudo: "Expandir tudo",
  recolherTudo: "Recolher tudo",
  nenhumRegistro: "Nenhum registro para os filtros selecionados.",
  orgaos: (n: number) => `${n} ${n === 1 ? "órgão" : "órgãos"}`,
  unidades: (n: number) => `${n} ${n === 1 ? "unidade" : "unidades"}`,
  acoes: (n: number) => `${n} ${n === 1 ? "ação" : "ações"}`,
  unidadesAbrev: (n: number) => `${n} un.`,

  colOrgao: "Órgão",
  colOrcamentoAtualizado: "Orçamento atualizado",
  colExclusivo: "Exclusivo",
  colNaoExclusivo: "Não exclusivo",
  colEixos: "Eixos",
  ordenarPor: (rotulo: string) => `Ordenar por ${rotulo}`,
  nenhumOrgao: "Nenhum órgão",
  mostrando: (inicio: number, fim: number, total: number) =>
    `Mostrando ${inicio}–${fim} de ${total} ${
      total === 1 ? "órgão" : "órgãos"
    } · total`,
  paginaAnterior: "Página anterior",
  proximaPagina: "Próxima página",

  fonte: "Fonte",
  filtrarFonte: "Filtrar por fonte de recursos",
  buscarFonte: "Buscar fonte de recursos",
  buscarCodigoNome: "Buscar por código ou nome...",
  selecionadas: (n: number) =>
    `${n} ${n === 1 ? "selecionada" : "selecionadas"}`,
  limpar: "Limpar",
  nenhumaFonte: "Nenhuma fonte com esse código ou nome.",
  maiores: "Maiores",
  demais: "Demais",

  fontesSelecionadas: (n: number) => `${n} fontes selecionadas`,
  fonteCodigo: (codigo: string) => `Fonte ${codigo}`,
  doRecorte: (pct: string) => `${pct} do recorte`,
  semRateio:
    "Valores da própria fonte em cada ação, como na planilha — sem rateio.",

  dotacaoNaLei: "Dotação na lei",
  totalFixado: "Total fixado na lei:",
  equivaleACortes: (valor: string) =>
    `Equivale a ${valor} pelos cortes monetários (Cr$ → CR$ → R$), sem correção pela inflação.`,
  recursosProprios: "Recursos próprios:",
  outrasFontes: "Outras fontes:",
  total: "Total:",
  rotuloOrgaos: "Órgãos",
  publicacaoDoe: "Publicação no DOE",
  textoNorma: "Texto da norma",
  abasPlanilha: "Abas da planilha",
  abasContagem: (abas: string) =>
    `${abas} — contada uma única vez no acervo`,
  citacoes: "Citações (criança/adolescente)",
  metasPrioridades: "Metas e prioridades",
  numeroNorma: (especie: string, numero: string) => `${especie} nº ${numero}`,
  exercicio: (n: number) => `· exercício ${n}`,
  normas: (n: number) => `${n} ${n === 1 ? "norma" : "normas"}`,
  nenhumaNorma: "Nenhuma norma desta aba corresponde à busca.",
};

const ESPECIE_NORMA_EN: Record<string, string> = {
  Lei: "Law",
  Decreto: "Decree",
  "Lei Complementar": "Supplementary Law",
};

export const en: typeof pt = {
  titulo: "Detailed Table",
  descricao:
    "Child and Adolescent Budget actions by agency, budget unit, and action, from initial budget to amount paid. Click a row to open the next level.",
  registros: (n: number) => `${n} ${n === 1 ? "record" : "records"}`,
  execucaoPorOrgao: "Execution by agency, unit, and action",
  visaoTabela: "Table",
  visaoDetalhado: "Detailed",
  exportar: "Export",
  formatoExportacao: "Export format",
  semRegistros: "There are no records to export.",
  pdfExportado: "PDF exported successfully.",
  falhaPdf: "Failed to export PDF.",
  xlsxExportado: "Spreadsheet exported successfully.",
  falhaXlsx: "Failed to export spreadsheet.",

  filtros: "Filters",
  limparFiltros: "Clear filters",
  ano: "Year",
  eixo: "Thematic Axis",
  classificacao: "Classification",
  secretaria: "Secretariat",
  todosOsAnos: "All years",
  todasAsClassificacoes: "All Classifications",
  todosOsEixos: "All Axes",
  todasAsSecretarias: "All Secretariats",

  orgaoUnidadeAcao: "Agency / Unit / Action",
  expandirTudo: "Expand all",
  recolherTudo: "Collapse all",
  nenhumRegistro: "No records match the selected filters.",
  orgaos: (n: number) => `${n} ${n === 1 ? "agency" : "agencies"}`,
  unidades: (n: number) => `${n} ${n === 1 ? "unit" : "units"}`,
  acoes: (n: number) => `${n} ${n === 1 ? "action" : "actions"}`,
  unidadesAbrev: (n: number) =>
    `${n} ${n === 1 ? "unit" : "units"}`,

  colOrgao: "Agency",
  colOrcamentoAtualizado: "Updated Budget",
  colExclusivo: "Exclusive",
  colNaoExclusivo: "Non-exclusive",
  colEixos: "Axes",
  ordenarPor: (rotulo: string) => `Sort by ${rotulo}`,
  nenhumOrgao: "No agencies",
  mostrando: (inicio: number, fim: number, total: number) =>
    `Showing ${inicio}–${fim} of ${total} ${
      total === 1 ? "agency" : "agencies"
    } · total`,
  paginaAnterior: "Previous page",
  proximaPagina: "Next page",

  fonte: "Source",
  filtrarFonte: "Filter by funding source",
  buscarFonte: "Search funding source",
  buscarCodigoNome: "Search by code or name...",
  selecionadas: (n: number) => `${n} selected`,
  limpar: "Clear",
  nenhumaFonte: "No funding source matches this code or name.",
  maiores: "Largest",
  demais: "Others",

  fontesSelecionadas: (n: number) => `${n} selected funding sources`,
  fonteCodigo: (codigo: string) => `Source ${codigo}`,
  doRecorte: (pct: string) => `${pct} of selection`,
  semRateio:
    "Direct values per action from source spreadsheet — without apportionment.",

  dotacaoNaLei: "Appropriation in the law",
  totalFixado: "Total set by law:",
  equivaleACortes: (valor: string) =>
    `Equivalent to ${valor} following monetary conversions (Cr$ → CR$ → R$), without inflation adjustment.`,
  recursosProprios: "Own resources:",
  outrasFontes: "Other sources:",
  total: "Total:",
  rotuloOrgaos: "Agencies",
  publicacaoDoe: "Publication in the Official Gazette",
  textoNorma: "Full text of legislation",
  abasPlanilha: "Spreadsheet tabs",
  abasContagem: (abas: string) =>
    `${abas} — counted only once in collection`,
  citacoes: "Citations (children/adolescents)",
  metasPrioridades: "Goals and priorities",
  numeroNorma: (especie: string, numero: string) =>
    `${ESPECIE_NORMA_EN[especie] ?? especie} No. ${numero}`,
  exercicio: (n: number) => `· fiscal year ${n}`,
  normas: (n: number) =>
    `${n} ${n === 1 ? "legal act" : "legal acts"}`,
  nenhumaNorma: "No legal act in this tab matches the search.",
};
