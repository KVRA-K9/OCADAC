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
  origemLeis: "Histórico de leis do Orçamento Criança e Adolescente — SEPLAN/AC",
  arquivoDe: (data: string) => `Arquivo de ${data}`,
  atualizadoNaOrigem: (data: string) => `, atualizado na origem em ${data}`,
  comNormas: (total: number) => `, com ${total} normas`,
  observacoes: [
    "O exercício de 1991 (Cr$ 4.518.657 mil) é menor que o de 1992 em plena hiperinflação, o que não fecha com a série.",
    "A lei do exercício de 1994 é de dezembro de 1993, quando já vigorava o cruzeiro real; a planilha rotula os quatro primeiros exercícios como Cr$ mil.",
    "A conversão de cruzeiro para real é nominal, pelos cortes monetários, sem correção pela inflação.",
    "1 norma(s) aparecem em mais de uma aba da planilha e foram contadas uma única vez: Lei 1.011/1991 (Lei Ordinária e Estrutura Administrativa).",
    "2 número(s) de lei aparecem em normas distintas, com links e ementas diferentes — inconsistência da fonte, mantida como está: Lei 1.156/1995; Lei 1.082/1993.",
  ],
};

export const en: typeof pt = {
  titulo: "History",
  descricao:
    "The OCAD legislative archive in Acre and the budget calculated across each budget law.",

  kpiNormasTitulo: "Mapped legislation",
  kpiNormasDica: (leis: number, decretos: number, estrutura: number) =>
    `${leis} laws, ${decretos} decrees, ${estrutura} on administrative structure`,
  kpiPeriodoTitulo: "Period covered",
  kpiPeriodoDica: (anos: number) =>
    `${anos} years of legislation on children and adolescents`,
  kpiOrcamentariasTitulo: "Budget laws",
  kpiOrcamentariasDica: (loas: number, ldos: number) =>
    `${loas} LOAs and ${ldos} LDOs`,

  acervoTitulo: "Legislative archive",
  acervoDescricao: "Select a category of legislation to view the list.",
  naPlanilha: (quantidade: number) => `${quantidade} in spreadsheet`,
  fechar: "Close",

  buscaPlaceholder:
    "Search by number, summary, agency, or goal — e.g., OCAD",
  buscaAria: (tipo: string) => `Search in ${tipo}`,
  limparBuscaAria: "Clear search",
  filtroDecadaAria: "Filter by decade",
  todasDecadas: (quantidade: number) => `All decades (${quantidade})`,
  ordenarAria: "Sort",
  ordens: {
    recentes: "Most recent",
    antigas: "Oldest",
    numero: "Act number",
  },
  limparFiltros: "Clear filters",
  resultadoNormas: (total: number) =>
    `${total} ${total === 1 ? "legal act" : "legal acts"}`,
  deTotal: (total: number) => ` of ${total}`,

  ocadPorExercicio: "OCAD by fiscal year",
  legendaComCuradoria: "Curated — OCAD identified in budget law",
  legendaSemCuradoria: "Uncurated — total agency appropriation",
  exerciciosApurados: (apurados: number, total: number) =>
    `${apurados} of ${total} fiscal years assessed`,
  informacao: "Information: ",
  pandemiaTitulo: (inicio: number, fim: number) =>
    `COVID-19 pandemic — fiscal years ${inicio} to ${fim}`,
  pandemiaTexto:
    "Emergency declared in March 2020, terminated in Brazil in May 2022 (GM/MS Ordinance No. 913/2022) and by WHO in May 2023. The timeline extends through 2024 to account for budgetary effects.",
  notaLeitura1:
    "Each bar represents the OCAD amount calculated in the budget law for that fiscal year: education, ISE, and early childhood units summed in full, plus actions containing target descriptors (menino, menina, criança, adolescente, adolescência, infância, infantil, juventude, filho, and filhos). The 1995–2009 period has not yet undergone curation — its annexes predate the digital publication of the Official Gazette and exist solely in physical format. For those years, the bar shows the total appropriation of the agencies.",
  notaLeitura2:
    "Click a bar to view the budget law for that fiscal year — enacted the previous year, it displays an earlier date in the header. Nominal values, without inflation adjustment.",
  antesDoRealTitulo: (inicio: number, fim: number) =>
    `Pre-Real currency — fiscal years ${inicio} to ${fim}, converted to reais`,
  antesDoRealNota: (salto: number) =>
    `Fiscal years enacted in cruzeiros, converted to reais through statutory currency reforms (Cr$ → CR$ → R$) without inflation adjustment — which is why they are displayed on a dedicated scale rather than the chart above, where they would be imperceptible against the axis. The scale is logarithmic: each doubling in length represents a tenfold increase, the only way to display the four bars coherently. The surge to ${salto} reflects hyperinflation, not policy expansion. Click a bar to view the corresponding law.`,

  exercicioRotulo: (label: string | number) => `Fiscal year ${label}`,
  ocadApurado: (valor: string) => `OCAD calculated: ${valor}`,
  apuracaoSemDetalhe:
    "Covers only education, ISE, and early childhood units through page-by-page review: the 2014 budget publication formatted tables as images, preventing descriptor keyword scanning for that year. This amount represents a floor — in surrounding years, this share remains below 1.5%.",
  apuracaoDetalhada: (
    integrais: string,
    acoes: string,
    quantidade: number,
  ) =>
    `${integrais} in education, ISE, and early childhood units, summed in full; ${acoes} across ${quantidade} ${
      quantidade === 1 ? "action" : "actions"
    } matched via descriptors.`,
  naoDetalhadoInicio:
    "The budget publication for this fiscal year lists several actions without values: ",
  naoDetalhadoFim:
    " of amounts declared by agencies are not detailed across published line items, and thus could not be scanned by descriptors.",
  dotacaoTotalOrgaos: (valor: string) =>
    `Total agency appropriations: ${valor}`,
  propriosOutrasFontes: (rp: string, outras: string) =>
    `${rp} own resources · ${outras} other sources`,
  semCuradoria: "Uncurated.",
  razaoSemApuracao:
    "Annexes detailing agency programming exist only in physical print — digital publication of the Official Gazette commenced in late 2009.",
  naLei: (valor: string) => `${valor} in the law`,

  fonteRotulo: "Source:",
  origemLeis: "Child and Adolescent Budget legislative history — SEPLAN/AC",
  arquivoDe: (data: string) => `File dated ${data}`,
  atualizadoNaOrigem: (data: string) => `, updated at source on ${data}`,
  comNormas: (total: number) => `, comprising ${total} legal acts`,
  observacoes: [
    "The 1991 fiscal year (Cr$ 4,518,657 thousand) is lower than 1992 despite prevailing hyperinflation, which does not align with the historical series.",
    "The 1994 fiscal year law dates from December 1993, when the cruzeiro real was already in effect; the source spreadsheet labels the first four fiscal years as Cr$ thousand.",
    "Conversion from cruzeiros to reais is nominal based on statutory currency reforms, without inflation adjustment.",
    "1 legal act appears across multiple spreadsheet tabs and was counted only once: Law 1,011/1991 (Ordinary Law and Administrative Structure).",
    "2 law numbers appear in separate legal acts with different links and summaries — source inconsistency, preserved as recorded: Law 1,156/1995; Law 1,082/1993.",
  ],
};
