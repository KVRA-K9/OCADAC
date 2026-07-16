export type EixoOds = "Educação" | "Saúde" | "Assistência Social";

export type StatusIndicador =
  | "Produzido"
  | "Em análise/construção"
  | "Sem dados";

export interface IndicadorOds {
  codigo: string;
  descricao: string;
  status: StatusIndicador;
  eixos: EixoOds[];
}

export interface Ods {
  numero: number;
  titulo: string;
  descricaoCurta: string;
  indicadoresContemplados: IndicadorOds[];
}

export const ODS_TITULOS: Record<number, { titulo: string; descricaoCurta: string }> = {
  1: { titulo: "Erradicação da Pobreza", descricaoCurta: "Acabar com a pobreza em todas as suas formas, em todos os lugares" },
  2: { titulo: "Fome Zero e Agricultura Sustentável", descricaoCurta: "Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável" },
  3: { titulo: "Saúde e Bem-Estar", descricaoCurta: "Assegurar uma vida saudável e promover o bem-estar para todos, em todas as idades" },
  4: { titulo: "Educação de Qualidade", descricaoCurta: "Assegurar a educação inclusiva e equitativa e de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todos" },
  5: { titulo: "Igualdade de Gênero", descricaoCurta: "Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas" },
  6: { titulo: "Água Potável e Saneamento", descricaoCurta: "Garantir disponibilidade e manejo sustentável da água e saneamento para todos" },
  7: { titulo: "Energia Limpa e Acessível", descricaoCurta: "Garantir acesso à energia barata, confiável, sustentável e renovável para todos" },
  8: { titulo: "Trabalho Decente e Crescimento Econômico", descricaoCurta: "Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo, e trabalho decente para todos" },
  9: { titulo: "Indústria, Inovação e Infraestrutura", descricaoCurta: "Construir infraestrutura resiliente, promover a industrialização inclusiva e sustentável, e fomentar a inovação" },
  10: { titulo: "Redução das Desigualdades", descricaoCurta: "Reduzir a desigualdade dentro dos países e entre eles" },
  11: { titulo: "Cidades e Comunidades Sustentáveis", descricaoCurta: "Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis" },
  12: { titulo: "Consumo e Produção Responsáveis", descricaoCurta: "Assegurar padrões de produção e de consumo sustentáveis" },
  13: { titulo: "Ação contra a Mudança Global do Clima", descricaoCurta: "Tomar medidas urgentes para combater a mudança do clima e seus impactos" },
  14: { titulo: "Vida na Água", descricaoCurta: "Conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável" },
  15: { titulo: "Vida Terrestre", descricaoCurta: "Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres" },
  16: { titulo: "Paz, Justiça e Instituições Eficazes", descricaoCurta: "Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável" },
  17: { titulo: "Parcerias e Meios de Implementação", descricaoCurta: "Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável" },
  18: { titulo: "Igualdade Étnico-Racial", descricaoCurta: "Eliminar o racismo e a discriminação étnico-racial contra povos indígenas e afrodescendentes" },
};

export const ODS: Ods[] = [
  {
    numero: 1,
    titulo: ODS_TITULOS[1].titulo,
    descricaoCurta: ODS_TITULOS[1].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "1.2.1", descricao: "Proporção da população vivendo abaixo da linha de pobreza nacional, por sexo, idade, condição perante o trabalho e localização geográfica (urbano/rural).", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "1.2.2", descricao: "Proporção de homens, mulheres e crianças de todas as idades vivendo na pobreza em todas as dimensões de acordo com as definições nacionais", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "1.3.1", descricao: "Proporção da população abrangida por regimes de proteção social, por sexo e para os seguintes grupos populacionais: crianças, população desempregada, população idosa, população com deficiência, mulheres grávidas, crianças recém-nascidas, pessoas que sofreram acidentes de trabalho, população em risco de pobreza e outros grupos populacionais vulneráveis", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "1.4.1", descricao: "Proporção da população que vive em domicílios com acesso a serviços básicos", status: "Em análise/construção", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "1.a.2", descricao: "Proporção do total das despesas públicas com serviços essenciais (educação, saúde e proteção social)", status: "Em análise/construção", eixos: ["Educação", "Saúde", "Assistência Social"] },
      { codigo: "1.b.1", descricao: "Gastos sociais públicos em favor dos pobres", status: "Em análise/construção", eixos: ["Assistência Social"] },
    ],
  },
  {
    numero: 2,
    titulo: ODS_TITULOS[2].titulo,
    descricaoCurta: ODS_TITULOS[2].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "2.1.1", descricao: "Prevalência de subalimentação", status: "Produzido", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "2.1.2", descricao: "Prevalência de insegurança alimentar moderada ou grave, baseada em escala de insegurança alimentar", status: "Produzido", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "2.2.1", descricao: "Prevalência de atrasos no crescimento nas crianças com menos de 5 anos de idade", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "2.2.2", descricao: "Prevalência de malnutrição nas crianças com menos de 5 anos de idade, por tipo de malnutrição (baixo peso e excesso de peso)", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "2.2.3", descricao: "Prevalência de anemia em mulheres de 15 a 49 anos, segundo estado de gravidez", status: "Sem dados", eixos: ["Saúde"] },
      { codigo: "2.2.4", descricao: "Prevalência do limiar mínimo de diversidade alimentar, por grupo populacional (crianças de 6 a 23,9 meses e mulheres não grávidas de 15 a 49 anos)", status: "Em análise/construção", eixos: ["Saúde", "Assistência Social"] },
    ],
  },
  {
    numero: 3,
    titulo: ODS_TITULOS[3].titulo,
    descricaoCurta: ODS_TITULOS[3].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "3.1.1", descricao: "Razão de mortalidade materna", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.1.2", descricao: "Proporção de nascimentos assistidos por pessoal de saúde qualificado", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.2.1", descricao: "Taxa de mortalidade em menores de 5 anos", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.2.2", descricao: "Taxa de mortalidade neonatal", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.3.1", descricao: "Número de novas infecções por HIV por 1.000 habitantes, por sexo, idade e populações específicas", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.3.2", descricao: "Taxa de incidência de tuberculose por 100.000 habitantes", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.3.3", descricao: "Taxa de incidência da malária por 1.000 habitantes", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.3.4", descricao: "Taxa de incidência da hepatite B por 100 mil habitantes", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.3.5", descricao: "Número de pessoas que necessitam de intervenções contra doenças tropicais negligenciadas (DTN)", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.4.1", descricao: "Taxa de mortalidade por doenças do aparelho circulatório, tumores malignos, diabetes mellitus e doenças crônicas respiratórias", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.4.2", descricao: "Taxa de mortalidade por suicídio", status: "Produzido", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "3.5.1", descricao: "Cobertura das intervenções (farmacológicas, psicossociais, de reabilitação e de pós-tratamento) para o tratamento do abuso de substâncias", status: "Sem dados", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "3.5.2", descricao: "Consumo de álcool em litros de álcool puro per capita (com 15 anos ou mais) por ano", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.6.1", descricao: "Taxa de mortalidade por acidentes de trânsito", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.7.1", descricao: "Proporção de mulheres em idade reprodutiva (15 a 49 anos) que utilizam métodos modernos de planejamento familiar", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.7.2", descricao: "Número de nascidos vivos de mães adolescentes (grupos etários 10-14 e 15-19) por 1.000 mulheres destes grupos etários", status: "Produzido", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "3.8.1", descricao: "Cobertura de serviços essenciais de saúde", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.8.2", descricao: "Proporção de pessoas em famílias com grandes gastos em saúde em relação ao total de despesas familiares", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.9.1", descricao: "Taxa de mortalidade por poluição ambiental (externa e doméstica) do ar", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.9.2", descricao: "Taxa de mortalidade atribuída a fontes de água inseguras, saneamento inseguro e falta de higiene", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.9.3", descricao: "Taxa de mortalidade atribuída a intoxicação não intencional", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.a.1", descricao: "Prevalência do consumo atual de tabaco na população de 15 anos ou mais", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "3.b.1a", descricao: "Proporção da população-alvo que recebeu 3 doses da vacina contra difteria, tétano e coqueluche (DTP3)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.1b", descricao: "Proporção da população-alvo que recebeu a segunda dose da vacina contendo sarampo (MCV2)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.1c", descricao: "Proporção da população-alvo que recebeu a 3ª dose da vacina pneumocócica conjugada (PCV3)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.1d", descricao: "Proporção da população-alvo que recebeu a dose final da vacina contra o papilomavírus humano (HPV)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.1", descricao: "Taxa de cobertura vacinal da população em relação às vacinas incluídas no Programa Nacional de Vacinação", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.2", descricao: "Ajuda oficial ao desenvolvimento total líquida para a investigação médica e para os setores básicos de saúde", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.b.3", descricao: "Índice de Acesso a Produtos de Saúde", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.c.1", descricao: "Número de profissionais de saúde por habitante", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.d.1", descricao: "Capacidade para o Regulamento Sanitário Internacional (RSI) e preparação para emergências de saúde", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "3.d.2", descricao: "Porcentagem de infecções da corrente sanguínea, devido a organismos resistentes a antimicrobianos selecionados", status: "Em análise/construção", eixos: ["Saúde"] },
    ],
  },
  {
    numero: 4,
    titulo: ODS_TITULOS[4].titulo,
    descricaoCurta: ODS_TITULOS[4].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "4.1.1", descricao: "Proporção de crianças e jovens: (a) nos segundo e terceiro anos do ensino fundamental; (b) no final dos anos iniciais do ensino fundamental; e c) no final dos anos finais do ensino fundamental, que atingiram um nível mínimo de proficiência em (i) leitura e (ii) matemática, por sexo", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "4.1.2", descricao: "Taxa de conclusão do ensino fundamental e ensino médio", status: "Produzido", eixos: ["Educação"] },
      { codigo: "4.2.1", descricao: "Proporção de crianças com idade entre 24-59 meses que estão com desenvolvimento adequado da saúde, aprendizagem e bem-estar psicossocial, por sexo", status: "Sem dados", eixos: ["Educação", "Saúde"] },
      { codigo: "4.2.2", descricao: "Taxa de participação no ensino organizado (um ano antes da idade oficial de ingresso no ensino fundamental), por sexo", status: "Produzido", eixos: ["Educação"] },
      { codigo: "4.3.1", descricao: "Taxa de participação de jovens e adultos na educação formal e não formal, nos últimos 12 meses, por sexo", status: "Sem dados", eixos: ["Educação"] },
      { codigo: "4.4.1", descricao: "Proporção de jovens e adultos com habilidades em tecnologias de informação e comunicação (TIC), por tipo de habilidade", status: "Sem dados", eixos: ["Educação"] },
      { codigo: "4.5.1", descricao: "Índices de paridade (mulher/homem, rural/urbano, 1º/5º quintis de renda e outros como população com deficiência, populações indígenas e populações afetadas por conflitos, à medida que os dados estejam disponíveis) para todos os indicadores nesta lista que possam ser desagregados", status: "Produzido", eixos: ["Educação"] },
      { codigo: "4.6.1", descricao: "Taxa de Alfabetização de Jovens/Adultos", status: "Produzido", eixos: ["Educação"] },
      { codigo: "4.7.1", descricao: "Grau em que a (i) a educação para a cidadania global e (ii) a educação para o desenvolvimento sustentável são integradas nas (a) políticas nacionais de educação; (b) currículos escolares; (c) formação de professores; e (d) avaliação de estudantes", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "4.a.1", descricao: "Proporção de escolas com acesso a: (a) eletricidade; (b) internet para fins pedagógicos; (c) computadores para fins pedagógicos; (d) infraestrutura e materiais adaptados para alunos com deficiência; (e) água potável; (f) instalações sanitárias separadas por sexo; e (g) instalações básicas para lavagem das mãos (de acordo com as definições dos indicadores WASH)", status: "Produzido", eixos: ["Educação", "Saúde"] },
      { codigo: "4.c.1", descricao: "Proporção de professores que receberam a qualificação mínima exigida, por nível de ensino", status: "Produzido", eixos: ["Educação"] },
    ],
  },
  {
    numero: 5,
    titulo: ODS_TITULOS[5].titulo,
    descricaoCurta: ODS_TITULOS[5].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "5.2.1", descricao: "Proporção de mulheres e meninas de 15 anos de idade ou mais que sofreram violência física, sexual ou psicológica, por parte de um parceiro íntimo atual ou anterior, nos últimos 12 meses, por forma de violência e por idade", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "5.2.2", descricao: "Proporção de mulheres e meninas de 15 anos ou mais que sofreram violência sexual por outras pessoas não parceiras íntimas, nos últimos 12 meses, por idade e local de ocorrência", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "5.4.1", descricao: "Proporção de tempo gasto em trabalho doméstico não remunerado e cuidados, por sexo, idade e localização", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "5.6.1", descricao: "Proporção de mulheres com idade entre 15 e 49 anos que tomam decisões informadas sobre suas relações sexuais, uso de contraceptivos e cuidados com saúde reprodutiva", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "5.6.2", descricao: "Número de países com legislação e regulamentação que garantam o acesso pleno e igualitário de mulheres e homens, com 15 anos ou mais de idade, aos cuidados, informação e educação em saúde sexual e reprodutiva", status: "Sem dados", eixos: ["Saúde"] },
    ],
  },
  {
    numero: 6,
    titulo: ODS_TITULOS[6].titulo,
    descricaoCurta: ODS_TITULOS[6].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "6.1.1", descricao: "Proporção da população que utiliza serviços de água potável gerenciados de forma segura", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.2.1", descricao: "Proporção da população que utiliza (a) serviços de saneamento gerenciados de forma segura e (b) instalações para lavagem das mãos com água e sabão", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.3.1", descricao: "Proporção do fluxo de águas residuais doméstica e industrial tratadas de forma segura", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.3.2", descricao: "Proporção de corpos hídricos com boa qualidade ambiental", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.4.1", descricao: "Alteração da eficiência no uso da água ao longo do tempo", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.4.2", descricao: "Nível de stress hídrico: proporção das retiradas de água doce em relação ao total dos recursos de água doce disponíveis", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.5.1", descricao: "Grau de implementação da gestão integrada de recursos hídricos (0-100)", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.5.2", descricao: "Proporção das áreas de bacias hidrográficas transfronteiriças abrangidas por um acordo operacional para cooperação hídrica", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.6.1", descricao: "Alteração na extensão dos ecossistemas relacionados a água ao longo do tempo", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.a.1", descricao: "Montante de ajuda oficial ao desenvolvimento na área da água e saneamento, inserida num plano governamental de despesa", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "6.b.1", descricao: "Participação das comunidades locais na gestão de água e saneamento", status: "Produzido", eixos: ["Saúde", "Assistência Social"] },
    ],
  },
  {
    numero: 7,
    titulo: ODS_TITULOS[7].titulo,
    descricaoCurta: ODS_TITULOS[7].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "7.1.1", descricao: "Percentagem da população com acesso à eletricidade", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "7.1.2", descricao: "Percentagem da população com acesso primário a combustíveis e tecnologias limpos", status: "Produzido", eixos: ["Saúde"] },
    ],
  },
  {
    numero: 8,
    titulo: ODS_TITULOS[8].titulo,
    descricaoCurta: ODS_TITULOS[8].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "8.5.1", descricao: "Rendimento médio por hora real das pessoas de 15 anos ou mais de idade ocupadas na semana de referência com rendimento de trabalho, habitualmente recebido em todos os trabalhos, por sexo, grupo de idade, grupamento ocupacional do trabalho principal e existência de deficiência", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "8.5.2", descricao: "Taxa de desocupação, por sexo, grupo de idade e existência de deficiência", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "8.6.1", descricao: "Percentual de pessoas de 15 a 24 anos não ocupadas, não estudantes e que não estão em treinamento para um trabalho", status: "Produzido", eixos: ["Educação", "Assistência Social"] },
      { codigo: "8.7.1", descricao: "Proporção e número de crianças de 5-17 anos envolvidos no trabalho infantil, por sexo e idade", status: "Produzido", eixos: ["Assistência Social", "Educação"] },
      { codigo: "8.b.1", descricao: "Existência de uma estratégia nacional desenvolvida e operacionalizada para o emprego dos jovens, como estratégia distinta ou como parte de uma estratégia nacional para o emprego", status: "Em análise/construção", eixos: ["Assistência Social"] },
    ],
  },
  {
    numero: 9,
    titulo: ODS_TITULOS[9].titulo,
    descricaoCurta: ODS_TITULOS[9].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "9.c.1", descricao: "Proporção da população coberta por rede móvel, por tipo de tecnologia", status: "Produzido", eixos: ["Educação"] },
      { codigo: "9.1.1", descricao: "Proporção de população residente em áreas rurais que vive num raio de 2 km de acesso a uma estrada transitável em todas as estações do ano", status: "Sem dados", eixos: ["Saúde"] },
    ],
  },
  {
    numero: 10,
    titulo: ODS_TITULOS[10].titulo,
    descricaoCurta: ODS_TITULOS[10].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "10.1.1", descricao: "Taxa de crescimento das despesas domiciliares ou rendimento per capita entre os 40% com os menores rendimentos da população e a população total", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "10.2.1", descricao: "Proporção da pessoas vivendo abaixo de 50% da mediana da renda, por sexo, idade e pessoas com deficiência", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "10.4.1", descricao: "Proporção das remunerações no PIB, incluindo salários e as transferências de proteção social", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "10.4.2", descricao: "Impacto redistributivo da política fiscal", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "10.7.4", descricao: "Proporção da população de refugiados, por país de origem", status: "Produzido", eixos: ["Assistência Social"] },
    ],
  },
  {
    numero: 11,
    titulo: ODS_TITULOS[11].titulo,
    descricaoCurta: ODS_TITULOS[11].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "11.1.1", descricao: "Proporção de população urbana vivendo em assentamentos precários, assentamentos informais ou domicílios inadequados", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "11.2.1", descricao: "Proporção de população que tem acesso adequado a transporte público, por sexo, idade e pessoas com deficiência", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "11.3.2", descricao: "Proporção de cidades com uma estrutura de participação direta da sociedade civil no planejamento e gestão urbana que opera de forma regular e democrática", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "11.4.1", descricao: "Total da despesa (pública e privada) per capita gasta na preservação, proteção e conservação de todo o patrimônio cultural e natural, por tipo de patrimônio", status: "Produzido", eixos: ["Educação"] },
      { codigo: "11.6.1", descricao: "Proporção de resíduos sólidos urbanos coletados e gerenciados em instalações controladas pelo total de resíduos urbanos gerados, por cidades", status: "Produzido", eixos: ["Saúde"] },
      { codigo: "11.6.2", descricao: "Nível médio anual de partículas inaláveis (ex: com diâmetro inferior a 2,5 µm e 10 µm) nas cidades (população ponderada)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "11.7.1", descricao: "Proporção da área construída nas cidades que é espaço público aberto para uso de todos, por sexo, idade e pessoas com deficiência", status: "Sem dados", eixos: ["Educação", "Assistência Social"] },
      { codigo: "11.7.2", descricao: "Proporção da população vítima de assédio físico ou sexual, por sexo, grupo etário, pessoas com deficiência e local da ocorrência, nos últimos 12 meses", status: "Sem dados", eixos: ["Assistência Social"] },
      { codigo: "11.a.1", descricao: "Número de países que possuem políticas urbanas nacionais ou planos de desenvolvimento regional que (a) respondem à dinâmica populacional; (b) garantem um desenvolvimento territorial equilibrado; e (c) possuem responsabilidade fiscal", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "11.b.1", descricao: "Número de países que adotam e implementam estratégias nacionais de redução de risco de desastres em linha com o Marco de Sendai para a Redução de Risco de Desastres 2015-2030", status: "Produzido", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "11.b.2", descricao: "Proporção de governos locais que adotam e implementam estratégias locais de redução de risco de desastres em linha com as estratégias nacionais de redução de risco de desastres", status: "Produzido", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "11.c.1", descricao: "Assistência oficial total ao desenvolvimento e outros fluxos oficiais para infraestrutura urbana ou projetos de infraestrutura urbana, por setor", status: "Em análise/construção", eixos: ["Saúde"] },
    ],
  },
  {
    numero: 12,
    titulo: ODS_TITULOS[12].titulo,
    descricaoCurta: ODS_TITULOS[12].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "12.8.1", descricao: "Grau em que a (i) a educação para a cidadania global e (ii) a educação para o desenvolvimento sustentável são integradas nas (a) políticas nacionais de educação; (b) currículos escolares; (c) formação de professores; e (d) avaliação de estudantes", status: "Sem dados", eixos: ["Educação"] },
    ],
  },
  {
    numero: 13,
    titulo: ODS_TITULOS[13].titulo,
    descricaoCurta: ODS_TITULOS[13].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "13.3.1", descricao: "Grau em que a (i) a educação para a cidadania global e (ii) a educação para o desenvolvimento sustentável são integradas nas (a) políticas nacionais de educação; (b) currículos escolares; (c) formação de professores; e (d) avaliação de estudantes", status: "Sem dados", eixos: ["Educação"] },
    ],
  },
  {
    numero: 14,
    titulo: ODS_TITULOS[14].titulo,
    descricaoCurta: ODS_TITULOS[14].descricaoCurta,
    indicadoresContemplados: [],
  },
  {
    numero: 15,
    titulo: ODS_TITULOS[15].titulo,
    descricaoCurta: ODS_TITULOS[15].descricaoCurta,
    indicadoresContemplados: [],
  },
  {
    numero: 16,
    titulo: ODS_TITULOS[16].titulo,
    descricaoCurta: ODS_TITULOS[16].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "16.1.1", descricao: "Número de vítimas de homicídio intencional, por 100.000 habitantes, por sexo e idade", status: "Produzido", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "16.1.3", descricao: "Proporção da população sujeita a violência física, psicológica ou sexual nos últimos 12 meses", status: "Produzido", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "16.1.4", descricao: "Proporção da população que se sente segura quando caminha sozinha na área onde vive", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.2.1", descricao: "Proporção de crianças com idade entre 1 e 17 anos que sofreram qualquer punição física e/ou e/ou agressão psicológica por parte de cuidadores no último mês", status: "Sem dados", eixos: ["Assistência Social"] },
      { codigo: "16.2.2", descricao: "Número de vítimas de tráfico de pessoas por 100.000 habitantes, por sexo, idade e forma de exploração", status: "Sem dados", eixos: ["Assistência Social"] },
      { codigo: "16.2.3", descricao: "Proporção de mulheres e homens jovens com idade entre 18 e 29 anos que foram vítimas de violência sexual até a idade de 18 anos", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "16.3.1", descricao: "Proporção de vítimas de violência nos últimos 12 meses que reportaram às autoridades competentes ou a outros organismos de resolução de conflitos oficialmente reconhecidos", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.3.2", descricao: "Proporção de presos sem sentença em relação à população prisional em geral", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.6.1", descricao: "Despesas públicas primárias como proporção do orçamento original aprovado, por setor (ou por códigos de orçamento ou similares)", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.7.1", descricao: "Proporções de cargos (por sexo, idade, pessoas com deficiência e grupos populacionais) em instituições públicas (legislativo nacional e locais, administração pública e tribunais) em relação às distribuições nacionais", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.7.2", descricao: "Proporção da população que considera que os processos de tomada de decisão são inclusivos e adequados, por sexo, idade, deficiência e grupo populacional", status: "Sem dados", eixos: ["Assistência Social"] },
      { codigo: "16.9.1", descricao: "Proporção de crianças com menos de 5 anos cujos nascimentos foram registrados por uma autoridade civil, por idade", status: "Produzido", eixos: ["Assistência Social"] },
      { codigo: "16.10.1", descricao: "Número de casos verificados de homicídio, sequestro, desaparecimento forçado, detenção arbitrária e tortura de jornalistas, pessoal de mídia, sindicalistas e defensores dos direitos humanos nos últimos 12 meses", status: "Sem dados", eixos: ["Assistência Social"] },
      { codigo: "16.10.2", descricao: "Número de países que adotam e implementam garantias constitucionais, estatutárias e/ou políticas para acesso público à informação", status: "Produzido", eixos: ["Assistência Social", "Educação"] },
      { codigo: "16.a.1", descricao: "Existência de instituições nacionais independentes de direitos humanos, de acordo com os Princípios de Paris", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "16.b.1", descricao: "Proporção da população que reportou ter-se sentido pessoalmente discriminada ou assediada nos últimos 12 meses por motivos de discriminação proibidos no âmbito da legislação internacional dos direitos humanos", status: "Sem dados", eixos: ["Assistência Social"] },
    ],
  },
  {
    numero: 17,
    titulo: ODS_TITULOS[17].titulo,
    descricaoCurta: ODS_TITULOS[17].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "17.18.1", descricao: "Indicador de capacidade estatística para monitoramento dos Objetivos do Desenvolvimento Sustentável", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "17.19.1", descricao: "Valor em dólares de todos os recursos disponibilizados para fortalecer a capacidade estatística nos países em desenvolvimento", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "17.19.2", descricao: "Proporção de países que (a) realizaram pelo menos um Recenseamento da População e da Habitação nos últimos 10 anos; e (b) atingiram 100% de registros de nascimento e 80% de registros de óbitos", status: "Produzido", eixos: ["Assistência Social"] },
    ],
  },
  {
    numero: 18,
    titulo: ODS_TITULOS[18].titulo,
    descricaoCurta: ODS_TITULOS[18].descricaoCurta,
    indicadoresContemplados: [
      { codigo: "18.1.3", descricao: "Renda mensal média de trabalhadores por raça/cor, etnia, sexo e território, por grupamento ocupacional e nível de escolaridade", status: "Em análise/construção", eixos: ["Educação", "Assistência Social"] },
      { codigo: "18.2.1", descricao: "Taxa de vítimas de homicídio intencional, por 100.000 habitantes, por sexo, idade e cor/raça", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "18.2.2", descricao: "Proporção da população por sexo e cor/raça sujeita a violência física, psicológica ou sexual nos últimos 12 meses", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "18.2.3", descricao: "Número de óbitos decorrentes de intervenções policiais por sexo, faixa etária e cor/raça", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "18.2.4", descricao: "Taxa de homicídios de mulheres e meninas dentro e fora das residências por raça/cor", status: "Em análise/construção", eixos: ["Assistência Social", "Saúde"] },
      { codigo: "18.2.5", descricao: "Número de casos de violência contra pessoas LGBTQIAPN+ por cor/raça, idade", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.2.6", descricao: "Número de homicídios contra pessoas LGBTQIAPN+ por cor/raça, idade", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.2.7", descricao: "Número de denúncias de crimes de ódio associados ao racismo e à injúria racial e misoginia, incluindo crimes cometidos em ambientes virtuais, em relação às populações indígenas e afrodescendentes", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.3.1", descricao: "Distribuição de pessoas encarceradas por raça/cor, idade, etnia, sexo e tipo de crime", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.3.2", descricao: "Distribuição de pessoas encarceradas sem sentença por raça/cor, idade, etnia e sexo", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.3.3", descricao: "Número de processos relacionados a racismo/injúria racial, intolerância religiosa, homofobia e transfobia", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.3.4", descricao: "Proporção de pessoas residentes em municípios com potencial assistência jurídica pela Defensoria Pública por cor/raça", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.3.5", descricao: "Proporção da população que se sente segura quando caminha sozinha na área onde vive por cor/raça e sexo", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.1", descricao: "Proporção de assentos ocupados por sexo, cor/raça no Executivo (governador, prefeito) e Legislativo (senador, dep. federal, dep. estadual/distrital, vereador)", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.2", descricao: "Proporção de pessoas que se candidatam a eleições (candidatos executivo/legislativo), por cor/raça, etnia e sexo, identidade gênero e orientação sexual, tipo de financiamento", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.3", descricao: "Proporção de servidoras e servidores públicos por cor/raça, etnia, sexo, identidade gênero, orientação sexual e nível da Classificação Brasileira de Ocupações (CBO) nos três Poderes", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.4", descricao: "Proporção de cargos de médio e alto escalão no setor público ocupados, por cor/raça, etnia, sexo, identidade gênero e orientação sexual", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.5", descricao: "Proporção de funcionários e funcionárias no setor privado por cor/raça, etnia, sexo, identidade gênero, orientação sexual, por remuneração, tipo de ocupação, tipo de cargos", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.4.6", descricao: "Proporção de assentos em órgãos colegiados e instâncias de participação ocupados em conselhos de administração de empresas x público/privado, por cor/raça, etnia, sexo, identidade gênero e orientação sexual", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.5.1", descricao: "Pessoas indígenas ou quilombolas residentes em territórios regularizados", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.5.2", descricao: "Pessoas indígenas ou quilombolas em famílias inscritas no Cadastro Único para programas sociais", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.5.6", descricao: "População em área de risco de desastre geológico por raça/cor", status: "Em análise/construção", eixos: ["Saúde", "Assistência Social"] },
      { codigo: "18.6.1", descricao: "Moradores indígenas ou quilombolas em domicílios com abastecimento de água adequado", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.6.2", descricao: "Domicílios com pelo menos uma pessoa indígena ou quilombola com esgotamento sanitário inadequado", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.6.3", descricao: "Proporção de população urbana vivendo em assentamentos precários, assentamentos informais ou domicílios inadequados", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.6.4", descricao: "Percentual de pessoas em situação de rua que receberam algum tipo de acolhimento (albergues, centros Pop, CRA, CREAS ou outras instituições governamentais)", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.6.5", descricao: "Déficit habitacional por sexo, cor/raça segundo responsável pelo domicílio", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.1", descricao: "Proporção de nascidos vivos de mães que fizeram 7 ou mais consultas de pré-natal", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.2", descricao: "Percentual da população afrodescendente coberta por equipes de atenção primária, incluindo as equipes de Saúde Família", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.3", descricao: "Percentual da população indígena coberta por Equipes Multiprofissionais de Saúde Indígena (EMSI)", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.4", descricao: "Proporção de realização de consultas de acompanhamento do crescimento e desenvolvimento da criança conforme recomendação do MS até 2 anos", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.5", descricao: "Taxa de cobertura vacinal da população em relação às vacinas incluídas no Programa Nacional de Vacinação, por grupos de idade, raça/cor/etnia", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.6", descricao: "Percentual de casos de neoplasia maligna cuja diferença entre o diagnóstico e o início do tratamento ultrapasse 60 dias por cor/raça", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.7", descricao: "Proporção de municípios com existência de instância específica ou órgão de gestão para as ações de saúde voltadas à população negra de acordo com a PNSIPN", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.8", descricao: "Percentual de pessoas de 18 anos ou mais que referem diagnóstico de doença mental, por profissional de saúde, em tratamento com psicoterapia ou medicamentos ou acompanhamento regular, por cor ou raça e segundo tipos de doença mental", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.9", descricao: "Percentual de pessoas que tiveram uso abusivo de álcool (nos últimos 30 dias), por raça/cor, gênero e por existência ou não de acompanhamento em serviço de saúde mental", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.7.10", descricao: "Ausência de atendimento em serviço de saúde por motivo que levou a procurar atendimento por raça/cor e gênero", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.8.1", descricao: "Taxa de atendimento escolar na educação básica entre jovens de 15 a 17 anos por raça/cor (incluindo indígenas e quilombolas) por sexo e UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.2", descricao: "Taxa de distorção idade-série por raça/cor (incluindo indígenas e quilombolas) na educação básica (desagregada em EFI, II e EM), por sexo e UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.3", descricao: "Taxa de abandono por raça/cor, (incluindo indígenas e quilombolas) na educação básica (desagregada em EFI, II e EM), por sexo e UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.4", descricao: "Proporção de escolas da educação básica que implementaram a Lei 10.639/2003 e 11.465/2008, por UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.5", descricao: "Nota do SAEB dos estudantes por raça/cor, (incluindo indígenas e quilombolas), por sexo e UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.6", descricao: "Taxa de atendimento escolar no ensino superior por raça/cor (incluindo indígenas e quilombolas, (desagregada por curso e tipo de IES), por sexo e UF", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.7", descricao: "Percentual de estudantes pretos e pardos matriculados por sexo e UF em Programas de Pós-Graduação Stricto Sensu", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.8", descricao: "Quantitativo e percentual de pretos, pardos e indígenas por sexo com título e Mestre e Doutor", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.8.9", descricao: "Proporção de escolas com acesso a: (a) eletricidade; (b) internet para fins pedagógicos; (c) computadores para fins pedagógicos; (d) infraestrutura e materiais adaptados para alunos com deficiência; (e) água potável; (f) instalações sanitárias separadas por sexo; e (g) instalações básicas para lavagem das mãos (de acordo com as definições dos indicadores WASH)", status: "Em análise/construção", eixos: ["Educação", "Saúde"] },
      { codigo: "18.8.10", descricao: "Percentual de pesquisadores pretos, pardos e indígenas por sexo e UF com bolsa de produtividade em pesquisa", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.10.1", descricao: "Percentual de imigrantes matriculados na educação básica e no ensino superior e em Programas de Pós-graduação por nacionalidade, sexo, raça/cor e UF e municípios, segundo nível de escolaridade, em relação ao total de alunos", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.10.2", descricao: "Taxa de conclusão do ensino fundamental e ensino médio de pessoas imigrantes no Brasil, por raça/cor e nacionalidade/país de origem", status: "Em análise/construção", eixos: ["Educação"] },
      { codigo: "18.10.3", descricao: "Razão de imigrantes por nacionalidade, raça/cor e sexo com CID 10 identificada, por capítulo, e o quantitativo de auxílios-doença concedidos", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.10.4", descricao: "Razão entre o número de imigrantes e volume de ocorrências médicas, por CID, por nacionalidade, raça/cor e sexo por estado e município", status: "Em análise/construção", eixos: ["Saúde"] },
      { codigo: "18.10.5", descricao: "Taxa de ocupação de pessoas imigrantes no Brasil, por raça/cor, sexo, nível de escolaridade e grupos de ocupação, segundo grupos de idade", status: "Em análise/construção", eixos: ["Assistência Social"] },
      { codigo: "18.10.6", descricao: "Rendimento de todos os trabalhos de pessoas residentes no Brasil com nacionalidade estrangeira (ou de imigrantes), por classes de salário-mínimo, segundo raça/cor e sexo, nível de escolaridade e grupos de ocupação", status: "Em análise/construção", eixos: ["Assistência Social"] },
    ],
  },
  ];

export const ODS_LISTA: Ods[] = ODS;

export const EIXOS_ODS_OCAD: Record<EixoOds, string> = {
  "Educação": "var(--chart-1)",
  "Saúde": "var(--chart-2)",
  "Assistência Social": "var(--chart-3)",
};

export const ODS_IMAGEM: Record<number, string> = {
  1: "/ods/01_1.png",
  2: "/ods/02_0.png",
  3: "/ods/03_0.png",
  4: "/ods/04_0.png",
  5: "/ods/05_0.png",
  6: "/ods/06_0.png",
  7: "/ods/07_0.png",
  8: "/ods/08_0.png",
  9: "/ods/09_0.png",
  10: "/ods/10_0.png",
  11: "/ods/11_0.png",
  12: "/ods/12_0.png",
  13: "/ods/13_0.png",
  14: "/ods/14_0.png",
  15: "/ods/15_0.png",
  16: "/ods/16_0.png",
  17: "/ods/17_0.png",
  18: "/ods/18_0.png",
};

export function contarIndicadoresPorEixo(): Record<EixoOds, number> {
  const contagem: Record<EixoOds, number> = {
    "Educação": 0,
    "Saúde": 0,
    "Assistência Social": 0,
  };
  for (const ods of ODS_LISTA) {
    for (const ind of ods.indicadoresContemplados) {
      for (const eixo of ind.eixos) {
        contagem[eixo]++;
      }
    }
  }
  return contagem;
}

export function totalIndicadoresContemplados(): number {
  return ODS_LISTA.reduce((acc, o) => acc + o.indicadoresContemplados.length, 0);
}

export interface FiltroOds {
  eixos: EixoOds[];
  busca: string;
  status: StatusIndicador[];
}

export function filtraIndicadores(filtro: FiltroOds): Ods[] {
  const termo = filtro.busca.trim().toLowerCase();
  const eixos = filtro.eixos;
  const status = filtro.status;
  return ODS_LISTA.map((ods) => {
    const indicadores = ods.indicadoresContemplados.filter((ind) => {
      const eixoOk = eixos.length === 0 || eixos.some((e) => ind.eixos.includes(e));
      if (!eixoOk) return false;
      const statusOk = status.length === 0 || status.includes(ind.status);
      if (!statusOk) return false;
      if (!termo) return true;
      return (
        ind.codigo.toLowerCase().includes(termo) ||
        ind.descricao.toLowerCase().includes(termo) ||
        ods.titulo.toLowerCase().includes(termo)
      );
    });
    return { ...ods, indicadoresContemplados: indicadores };
  });
}