export const pt = {
  titulo: "Histórico",
  descricao:
    "O acervo normativo do OCAD no Acre e o orçamento apurado em cada lei orçamentária.",

  kpiNormasTitulo: "Normas mapeadas",
  kpiNormasDica: (leis: number, decretos: number, estrutura: number) =>
    `${leis} leis, ${decretos} decretos, ${estrutura} de estrutura`,
  kpiPeriodoTitulo: "Período coberto",
  kpiPeriodoDica: (anos: number) =>
    `${anos} anos de normas sobre criança e adolescente`,
  kpiOrcamentariasTitulo: "Leis orçamentárias",
  kpiOrcamentariasDica: (loas: number, ldos: number) =>
    `${loas} LOAs e ${ldos} LDOs`,

  acervoTitulo: "Acervo normativo",
  acervoDescricao: "Escolha um tipo de norma para visualizar a lista.",
  naPlanilha: (quantidade: number) => `${quantidade} na planilha`,
  fechar: "Fechar",

  buscaPlaceholder:
    "Buscar por número, ementa, órgão ou meta — por exemplo, OCAD",
  buscaAria: (tipo: string) => `Buscar em ${tipo}`,
  limparBuscaAria: "Limpar busca",
  filtroDecadaAria: "Filtrar por década",
  todasDecadas: (quantidade: number) => `Todas as décadas (${quantidade})`,
  ordenarAria: "Ordenar",
  ordens: {
    recentes: "Mais recentes",
    antigas: "Mais antigas",
    numero: "Número da norma",
  },
  limparFiltros: "Limpar filtros",
  resultadoNormas: (total: number) =>
    `${total} ${total === 1 ? "norma" : "normas"}`,
  deTotal: (total: number) => ` de ${total}`,

  ocadPorExercicio: "OCAD por exercício",
  legendaComCuradoria: "Com curadoria — OCAD apurado na lei",
  legendaSemCuradoria: "Sem curadoria — dotação dos órgãos",
  exerciciosApurados: (apurados: number, total: number) =>
    `${apurados} de ${total} exercícios apurados`,
  informacao: "Informação: ",
  pandemiaTitulo: (inicio: number, fim: number) =>
    `Pandemia de COVID-19 — exercícios de ${inicio} a ${fim}`,
  pandemiaTexto:
    "Emergência declarada em março de 2020, encerrada no Brasil em maio de 2022 (Portaria GM/MS nº 913/2022) e pela OMS em maio de 2023. O recorte vai até 2024 pelos efeitos orçamentários.",
  notaLeitura1:
    "Cada barra é o OCAD apurado na lei do exercício: as unidades de ensino, do ISE e da infância somadas inteiras, mais as ações cujo nome traz um dos descritores (menino, menina, criança, adolescente, adolescência, infância, infantil, juventude, filho e filhos). O período de 1995 a 2009 ainda não passou por curadoria — seus anexos são anteriores à publicação eletrônica do Diário Oficial e existem apenas em versões físicas. Nele a barra traz a dotação total dos órgãos.",
  notaLeitura2:
    "Clique numa barra para ir à lei do exercício — sancionada no ano anterior, ela traz outra data no cabeçalho. Valores nominais, sem correção pela inflação.",
  antesDoRealTitulo: (inicio: number, fim: number) =>
    `Antes do real — exercícios de ${inicio} a ${fim}, convertidos para real`,
  antesDoRealNota: (salto: number) =>
    `Exercícios fixados em cruzeiro, convertidos para real pelos cortes monetários (Cr$ → CR$ → R$) e sem correção pela inflação — por isso ficam em escala própria, e não na do gráfico acima, onde sumiriam rentes ao eixo. A escala é logarítmica: cada dobro de comprimento vale dez vezes mais, o único jeito de as quatro barras caberem juntas. O salto de ${salto} é a hiperinflação, não crescimento da política. Clique numa barra para ir até a lei correspondente.`,

  exercicioRotulo: (label: string | number) => `Exercício ${label}`,
  ocadApurado: (valor: string) => `OCAD apurado: ${valor}`,
  apuracaoSemDetalhe:
    "Só as unidades de ensino, do ISE e da infância, lidas página a página: o caderno de 2014 desenha as tabelas como imagem, e a varredura por descritores não alcança esse exercício. O valor é um piso — nos anos vizinhos essa parcela fica abaixo de 1,5%.",
  apuracaoDetalhada: (
    integrais: string,
    acoes: string,
    quantidade: number,
  ) =>
    `${integrais} nas unidades de ensino, do ISE e da infância, somadas inteiras; ${acoes} em ${quantidade} ${
      quantidade === 1 ? "ação" : "ações"
    } com os descritores.`,
  naoDetalhadoInicio:
    "O caderno deste exercício imprime parte das ações sem valor: ",
  naoDetalhadoFim:
    " do que as unidades declaram não é detalhado por nenhuma linha publicada, e por isso não pôde passar pelos descritores.",
  dotacaoTotalOrgaos: (valor: string) => `Dotação Total dos Órgãos: ${valor}`,
  propriosOutrasFontes: (rp: string, outras: string) =>
    `${rp} próprios · ${outras} outras fontes`,
  semCuradoria: "Sem curadoria.",
  razaoSemApuracao:
    "Os anexos com a programação por unidade existem apenas em versões físicas — a publicação eletrônica do Diário Oficial começa no fim de 2009.",
  naLei: (valor: string) => `${valor} na lei`,

  fonteRotulo: "Fonte:",
  arquivoDe: (data: string) => `Arquivo de ${data}`,
  atualizadoNaOrigem: (data: string) => `, atualizado na origem em ${data}`,
  comNormas: (total: number) => `, com ${total} normas`,
};

export const en: typeof pt = {
  titulo: "History",
  descricao:
    "The OCAD normative collection in Acre and the budget calculated in each budget law.",

  kpiNormasTitulo: "Mapped norms",
  kpiNormasDica: (leis: number, decretos: number, estrutura: number) =>
    `${leis} laws, ${decretos} decrees, ${estrutura} on structure`,
  kpiPeriodoTitulo: "Period covered",
  kpiPeriodoDica: (anos: number) =>
    `${anos} years of norms on children and adolescents`,
  kpiOrcamentariasTitulo: "Budget laws",
  kpiOrcamentariasDica: (loas: number, ldos: number) =>
    `${loas} LOAs and ${ldos} LDOs`,

  acervoTitulo: "Normative collection",
  acervoDescricao: "Choose a norm type to view the list.",
  naPlanilha: (quantidade: number) => `${quantidade} in the spreadsheet`,
  fechar: "Close",

  buscaPlaceholder:
    "Search by number, summary, agency or goal — for example, OCAD",
  buscaAria: (tipo: string) => `Search in ${tipo}`,
  limparBuscaAria: "Clear search",
  filtroDecadaAria: "Filter by decade",
  todasDecadas: (quantidade: number) => `All decades (${quantidade})`,
  ordenarAria: "Sort",
  ordens: {
    recentes: "Most recent",
    antigas: "Oldest",
    numero: "Norm number",
  },
  limparFiltros: "Clear filters",
  resultadoNormas: (total: number) =>
    `${total} ${total === 1 ? "norm" : "norms"}`,
  deTotal: (total: number) => ` of ${total}`,

  ocadPorExercicio: "OCAD by fiscal year",
  legendaComCuradoria: "Curated — OCAD calculated in the law",
  legendaSemCuradoria: "Without curation — appropriation of the agencies",
  exerciciosApurados: (apurados: number, total: number) =>
    `${apurados} of ${total} fiscal years assessed`,
  informacao: "Information: ",
  pandemiaTitulo: (inicio: number, fim: number) =>
    `COVID-19 pandemic — fiscal years from ${inicio} to ${fim}`,
  pandemiaTexto:
    "Emergency declared in March 2020, ended in Brazil in May 2022 (GM/MS Ordinance No. 913/2022) and by WHO in May 2023. The span runs through 2024 for its budget effects.",
  notaLeitura1:
    "Each bar is the OCAD calculated in the law for the fiscal year: the education, ISE and early-childhood units summed in full, plus the actions whose name carries one of the descriptors (boy, girl, child, adolescent, adolescence, childhood, child-related, youth, son and sons). The 1995–2009 period has not yet been curated — its annexes predate the electronic publication of the Official Gazette and exist only in physical versions. For those years the bar shows the total appropriation of the agencies.",
  notaLeitura2:
    "Click a bar to go to the law for that fiscal year — sanctioned the previous year, it carries a different date in the header. Nominal values, without inflation adjustment.",
  antesDoRealTitulo: (inicio: number, fim: number) =>
    `Before the real — fiscal years from ${inicio} to ${fim}, converted to reais`,
  antesDoRealNota: (salto: number) =>
    `Fiscal years fixed in cruzeiro, converted to reais through the monetary cuts (Cr$ → CR$ → R$) and without inflation adjustment — which is why they sit on their own scale, not on the one used by the chart above, where they would vanish against the axis. The scale is logarithmic: each doubling of length is worth ten times as much, the only way for the four bars to fit together. The jump to ${salto} is hyperinflation, not policy growth. Click a bar to go to the corresponding law.`,

  exercicioRotulo: (label: string | number) => `Fiscal year ${label}`,
  ocadApurado: (valor: string) => `OCAD calculated: ${valor}`,
  apuracaoSemDetalhe:
    "Only the education, ISE and early-childhood units, read page by page: the 2014 booklet draws its tables as images, and descriptor scanning does not reach this fiscal year. The value is a floor — in neighboring years this share stays below 1,5%.",
  apuracaoDetalhada: (
    integrais: string,
    acoes: string,
    quantidade: number,
  ) =>
    `${integrais} in the education, ISE and early-childhood units, summed in full; ${acoes} in ${quantidade} ${
      quantidade === 1 ? "action" : "actions"
    } matched through the descriptors.`,
  naoDetalhadoInicio:
    "The booklet for this fiscal year prints part of the actions without a value: ",
  naoDetalhadoFim:
    " of what the units declare is not detailed on any published line, and therefore could not pass through the descriptors.",
  dotacaoTotalOrgaos: (valor: string) =>
    `Total appropriation of the agencies: ${valor}`,
  propriosOutrasFontes: (rp: string, outras: string) =>
    `${rp} own sources · ${outras} other sources`,
  semCuradoria: "Without curation.",
  razaoSemApuracao:
    "The annexes with the unit-level programming exist only in physical versions — electronic publication of the Official Gazette begins at the end of 2009.",
  naLei: (valor: string) => `${valor} in the law`,

  fonteRotulo: "Source:",
  arquivoDe: (data: string) => `File dated ${data}`,
  atualizadoNaOrigem: (data: string) => `, updated at source on ${data}`,
  comNormas: (total: number) => `, with ${total} norms`,
};
