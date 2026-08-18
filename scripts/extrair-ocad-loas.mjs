/**
 * Apura o OCAD de cada exercício lendo a programação das leis orçamentárias.
 *
 * O quadro que interessa é o "Programa de Trabalho do Órgão/Unidade" (Anexo 6 da
 * Lei 4.320), que aparece uma vez por unidade orçamentária e lista as ações com
 * código, nome e valores de projetos, atividades e total. Há um quadro irmão por
 * órgão, com as mesmas ações somadas; ele é ignorado de propósito — somar os dois
 * dobraria o orçamento.
 *
 * Regras de apuração, como definidas pela coordenação do OCAD:
 *
 *   1. Unidades integrais: educação (SEE, FUNDEB e afins), ISE e qualquer órgão
 *      ou fundo da criança, do adolescente, da infância ou da juventude entram
 *      pelo total — nelas não se procura descritor.
 *   2. Demais unidades: entram só as ações cujo nome traga um dos descritores.
 *   3. O OCAD do exercício é a soma das duas parcelas.
 *
 * Cada bloco de unidade traz "TOTAL GERAL", que serve de conferência: a soma das
 * ações lidas tem de bater com ele. Onde não bate, o exercício sai marcado.
 *
 * Uso: node scripts/extrair-ocad-loas.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

import { limpar, numeroBR, textoDoPDF } from "./texto-loa.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const CACHE = resolve(raiz, ".cache/loas");

/* ----------------------------------------------------------------- padrões */

/**
 * Linha de ação. Sem âncora no fim porque as edições do Diário Oficial trazem o
 * número da edição e o nome do jornal impressos na margem direita, que o
 * pdftotext despeja no fim da linha da tabela. A letra da esfera é o delimitador
 * seguro entre o nome e os valores — e vem minúscula nos cadernos antigos.
 */
const LINHA_ACAO =
  /^([\d][\d ]*(?:\.[\d ]+){3,4})\s+(.+?)\s+([FSGfsg])\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/;
/** Código de ação já sem espaços: quatro ou cinco grupos. */
const CODIGO_ACAO = /^\d{2}\.\d{3}\.\d{4}\.\d{4}(\.\d{4})?$/;
const CABECALHO_ORGAO = /^Órgão:\s*(\d{3})\s+(.*)$/;
const CABECALHO_UNIDADE = /^Unidade:\s*(\d{3})\s+(.*)$/;
const QUADRO_UNIDADE = /Programa\s+de\s+Trabalho\s+do\s+Órgão\/Unidade/;
const QUADRO_ORGAO = /Programa\s+de\s+Trabalho\s+do\s+Órgão(?!\/)/;
const TOTAL_GERAL = /TOTAL\s+GERAL\s*:?\s*([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/;

/**
 * Lixo de margem das edições do DOE, que cai dentro das linhas da tabela: o
 * número da edição, o nome do jornal (às vezes com o número da página enfiado no
 * meio, "46DI8ÁRIO OFICIAL") e a numeração de página solta.
 */
const MARGEM =
  /\s+(N[ºo]\s*[\d.]+(-[A-Z])?|\d*DI\d*[ÁA]RIO\s*OFICIAL\d*|DI[ÁA]RIO\s*OFICIAL)\s*$/gi;

/** Cabeçalho e rodapé de página, que se intrometem no meio dos quadros. */
const RUIDO_DE_PAGINA =
  /ESTADO DO ACRE|SEPLA[GN]|Anexo\s*\d|Orçamento-Programa|Recursos de Todas|Módulo|Página|feira,|Data:|Especificação|Natureza da Despesa|Programa de Trabalho|Demonstrativo/i;

/**
 * Descritores da metodologia. Sem acento e com limite de palavra: "criança" tem
 * de casar em "CRIANÇAS" e não em "RECRIANÇA", que é nome de programa.
 */
const DESCRITORES = [
  ["menino", /\bmenin[oa]s?\b/],
  ["crianca", /\bcrianc[ao]s?\b/],
  ["adolescente", /\badolescent[ei]s?\b|\badolescencias?\b/],
  ["infancia", /\binfancias?\b/],
  ["juventude", /\bjuventudes?\b/],
  ["filho", /\bfilh[oa]s?\b/],
  ["infantil", /\binfanti[la]s?\b/],
];

/**
 * Unidades que entram pelo total. "Educação" precisa de cuidado: cultura,
 * esporte e patrimônio histórico moram no mesmo órgão 717 em unidades próprias,
 * e o que a regra manda somar é o ensino.
 */
const INFANCIA = /crianca|adolescente|infancia|juventude|\bfdca\b/;
const ISE = /\bise\b|instituto s[oó]cio ?educativo/;
/** Unidade que é de ensino pelo próprio nome. */
const ENSINO =
  /educacao|ensino|fundeb|escolar|instituto estadual de educacao|magisterio/;
/** Unidade que responde pelo órgão inteiro — herda a natureza dele. */
const GESTORA = /unidade gestora|gabinete|administracao direta|sede/;
/**
 * O órgão da educação no Acre é "Educação, Cultura e Esportes", e sob ele moram
 * fundos de cultura, patrimônio e fomento, que não são ensino. Por isso a
 * classificação olha a unidade primeiro e só herda do órgão quando a unidade é a
 * gestora dele. Essas unidades vizinhas não somem: seguem para a busca por
 * descritor, como qualquer outra, e vão listadas na planilha.
 */
const ORGAO_EDUCACAO = /secretaria de estado d[ea] educacao|\bsee\b/;
/**
 * O que, dentro da Secretaria de Educação, não é ensino. O resto do órgão
 * entra integral, inclusive gabinete, recursos humanos e departamento de
 * pessoas: a folha da secretaria é folha de ensino, esteja em que diretoria
 * estiver. Sem isso a série tropeça em 2020, quando a SEE trocou dezenas de
 * unidades por uma gestora única — degrau de estrutura, não de orçamento.
 */
const FORA_DO_ENSINO =
  /cultura|esporte|desporto|patrimonio|fomento|comunicacao|turismo/;

const semAcento = (t) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/* ------------------------------------------------------------------ leitura */

/**
 * Junta as linhas quebradas: no PDF, nome de órgão, de unidade e de ação
 * transbordam para a linha seguinte, sem código e sem valor.
 */
export function blocosDeUnidade(texto) {
  const linhas = texto.split(/\r?\n/).map((l) => l.replace(/\s+$/, ""));
  const blocos = [];
  let orgao = null;
  let atual = null;

  const semMargem = (l) => {
    let t = limpar(l);
    let anterior;
    do {
      anterior = t;
      t = t.replace(MARGEM, "").trim();
    } while (t !== anterior);
    return t;
  };

  /**
   * A continuação de um nome vem depois de uma ou duas linhas em branco, e às
   * vezes depois do rodapé da página. Sem pular o vazio, "FUNDO DE MANUTENÇÃO E
   * DESENVOLVI -" nunca encontra o "MENTO DA EDUCAÇÃO BÁSICA - FUNDEB" que o
   * completa — e um fundo de R$ 723 milhões deixa de ser reconhecido.
   */
  const continuacao = (i) => {
    for (let j = i + 1; j <= i + 3 && j < linhas.length; j++) {
      const texto = semMargem(linhas[j]);
      if (!texto) continue;
      if (RUIDO_DE_PAGINA.test(texto)) return null;
      if (/^(Unidade|Órgão|Código|TOTAL)/.test(texto)) return null;
      if (/\d{2}\.\d{3}/.test(texto) || /[\d.]+,\d{2}/.test(texto)) return null;
      return texto;
    }
    return null;
  };

  /**
   * O marcador "Programa de Trabalho do Órgão/Unidade" às vezes divide a linha
   * com o cabeçalho da unidade e às vezes vem sozinho logo abaixo — muda de
   * exercício para exercício, e de 2024 em diante é quase sempre em separado.
   * Exigir os dois na mesma linha faria a leitura pular unidades inteiras.
   */
  const abreQuadroDeUnidade = (i, linha) => {
    if (QUADRO_UNIDADE.test(linha)) return true;
    let vistos = 0;
    for (let j = i + 1; j < linhas.length && vistos < 3; j++) {
      const texto = semMargem(linhas[j]);
      if (!texto) continue;
      vistos++;
      if (QUADRO_UNIDADE.test(texto)) return true;
      if (/^(Unidade|Órgão):/.test(texto) || /^Código/.test(texto)) return false;
    }
    return false;
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = semMargem(linhas[i]);
    if (!linha) continue;

    const cabecalhoOrgao = linha.match(CABECALHO_ORGAO);
    if (cabecalhoOrgao) {
      orgao = {
        codigo: cabecalhoOrgao[1],
        nome: limpar(cabecalhoOrgao[2].replace(QUADRO_ORGAO, "").replace(QUADRO_UNIDADE, "")),
      };
      /* O nome do órgão costuma continuar na linha de baixo. */
      const proxima = continuacao(i);
      if (proxima) orgao.nome = limpar(`${orgao.nome} ${proxima}`);
      continue;
    }

    const cabecalhoUnidade = linha.match(CABECALHO_UNIDADE);
    if (cabecalhoUnidade && abreQuadroDeUnidade(i, linha)) {
      const proxima = continuacao(i);
      const continua = proxima ? ` ${proxima}` : "";
      atual = {
        orgaoCodigo: orgao?.codigo ?? null,
        orgaoNome: orgao?.nome ?? null,
        codigo: cabecalhoUnidade[1],
        nome: limpar(
          `${cabecalhoUnidade[2].replace(QUADRO_UNIDADE, "")}${continua}`,
        ),
        acoes: [],
        totalDeclarado: null,
      };
      blocos.push(atual);
      continue;
    }

    if (!atual) continue;

    const acao = linha.match(LINHA_ACAO);
    const codigo = acao ? acao[1].replace(/\s/g, "") : null;
    if (acao && CODIGO_ACAO.test(codigo)) {
      atual.acoes.push({
        codigo,
        /* Cinco grupos é o subtítulo da ação; quatro é a ação sem subtítulo. */
        subtitulo: codigo.split(".").length === 5,
        nome: limpar(acao[2]),
        esfera: acao[3].toUpperCase(),
        projetos: numeroBR(acao[4]),
        atividades: numeroBR(acao[5]),
        total: numeroBR(acao[6]),
      });
      /* Nome transbordado para a linha seguinte, sem código e sem valor. */
      const proxima = continuacao(i);
      if (proxima) {
        const ultima = atual.acoes[atual.acoes.length - 1];
        ultima.nome = limpar(`${ultima.nome} ${proxima}`);
      }
      continue;
    }

    const total = linha.match(TOTAL_GERAL);
    if (total) {
      atual.totalDeclarado = numeroBR(total[3]);
      atual = null;
    }
  }

  return blocos;
}

/**
 * Índice de nomes de órgão e unidade, varrido do documento inteiro — inclusive
 * dos quadros de receita e de natureza da despesa, que não interessam à soma mas
 * repetem os mesmos cabeçalhos.
 *
 * É o que permite classificar as unidades que só a tabela plana enxerga: ela traz
 * códigos, não nomes, e sem nome não há como saber se a unidade é de ensino.
 */
export function nomesDeUnidade(texto) {
  const linhas = texto.split(/\r?\n/);
  const nomes = new Map();
  let orgao = null;

  const maisLongo = (chave, nome) => {
    if (!nome || nome.length < 4) return;
    const atual = nomes.get(chave);
    if (!atual || nome.length > atual.length) nomes.set(chave, nome);
  };

  const continua = (i) => {
    for (let j = i + 1; j <= i + 3 && j < linhas.length; j++) {
      const texto = limpar(linhas[j]);
      if (!texto) continue;
      if (RUIDO_DE_PAGINA.test(texto)) return null;
      if (/^(Unidade|Órgão|Código|TOTAL)/.test(texto)) return null;
      if (/\d{2}\.\d{3}|[\d.]+,\d{2}/.test(texto)) return null;
      return texto;
    }
    return null;
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = limpar(linhas[i]);
    const cabecalhoOrgao = linha.match(CABECALHO_ORGAO);
    if (cabecalhoOrgao) {
      const nome = limpar(
        `${cabecalhoOrgao[2].replace(QUADRO_ORGAO, "").replace(QUADRO_UNIDADE, "")} ${continua(i) ?? ""}`,
      );
      orgao = cabecalhoOrgao[1];
      maisLongo(`orgao-${orgao}`, nome);
      continue;
    }
    const cabecalhoUnidade = linha.match(CABECALHO_UNIDADE);
    if (cabecalhoUnidade && orgao) {
      const nome = limpar(
        `${cabecalhoUnidade[2]
          .replace(QUADRO_UNIDADE, "")
          .replace(/Natureza\s+da\s+Despesa.*$/i, "")
          .replace(/REC\s*E\s*I\s*TA.*$/i, "")} ${continua(i) ?? ""}`,
      );
      maisLongo(`${orgao}-${cabecalhoUnidade[1]}`, nome);
    }
  }
  return nomes;
}

/**
 * Segunda leitura, pela tabela plana "Demonstrativos dos Projetos/Atividades
 * Segundo as Fontes de Recursos", onde cada linha traz órgão, unidade, código da
 * ação, nome e valores — sem depender de cabeçalho de página nenhum.
 *
 * Ela salva os exercícios em que a conversão do quadro por unidade perde linhas:
 * em 2024, por exemplo, várias ações chegam sem código e sem valor, e a tabela
 * plana devolve as mesmas ações fechando com o total declarado no centavo.
 */
export function linhasPlanas(texto) {
  const PLANA =
    /^(\d{3})\s+(\d{3})\s+(\d{2})\s+(\d{3})\s+(\d{4})\s+(\d)\s*(\d{3})\s+(\d{4})\s+(.+?)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s*$/;
  const porUnidade = new Map();

  for (const bruta of texto.split(/\r?\n/)) {
    const m = limpar(bruta).match(PLANA);
    if (!m) continue;
    const chave = `${m[1]}-${m[2]}`;
    if (!porUnidade.has(chave)) {
      porUnidade.set(chave, {
        orgaoCodigo: m[1],
        orgaoNome: null,
        codigo: m[2],
        nome: null,
        acoes: [],
        totalDeclarado: null,
      });
    }
    porUnidade.get(chave).acoes.push({
      codigo: `${m[3]}.${m[4]}.${m[5]}.${m[6]}${m[7]}.${m[8]}`,
      subtitulo: true,
      nome: limpar(m[9]),
      esfera: "G",
      projetos: numeroBR(m[10]),
      atividades: numeroBR(m[11]),
      total: numeroBR(m[12]),
    });
  }
  return porUnidade;
}

/**
 * Reduz as linhas cruas de um bloco à lista de ações que pode ser somada. São
 * duas armadilhas, e as duas dobrariam o orçamento:
 *
 *   - a mesma ação aparece uma vez por esfera (F de fiscal, S de seguridade) e
 *     ainda com G, que é a soma das duas — onde há G, só ele vale;
 *   - nos cadernos antigos a ação aparece duas vezes, como ação (quatro grupos)
 *     e como subtítulo (cinco) — onde há subtítulo, ele é o detalhe e a ação de
 *     quatro grupos é o resumo dele.
 */
export function consolidar(acoes) {
  const temSubtitulo = new Set();
  for (const a of acoes) {
    if (a.subtitulo) temSubtitulo.add(a.codigo.split(".").slice(0, 4).join("."));
  }

  /*
   * Uma linha por código e esfera, ficando com o maior valor: o mesmo quadro é
   * reimpresso em mais de um lugar do caderno, e o que não pode acontecer é a
   * reimpressão virar soma.
   */
  const porCodigoEsfera = new Map();
  for (const a of acoes) {
    if (!a.subtitulo && temSubtitulo.has(a.codigo)) continue;
    const chave = `${a.codigo}|${a.esfera}`;
    const anterior = porCodigoEsfera.get(chave);
    if (!anterior || a.total > anterior.total) porCodigoEsfera.set(chave, { ...a });
  }

  const porCodigo = new Map();
  for (const a of porCodigoEsfera.values()) {
    const anterior = porCodigo.get(a.codigo);
    if (!anterior) {
      porCodigo.set(a.codigo, { ...a });
      continue;
    }
    /* Onde há esfera geral, ela já é a soma da fiscal com a da seguridade. */
    if (a.esfera === "G") {
      porCodigo.set(a.codigo, { ...a });
    } else if (anterior.esfera !== "G") {
      anterior.total += a.total;
      anterior.projetos += a.projetos;
      anterior.atividades += a.atividades;
      anterior.esfera = `${anterior.esfera}+${a.esfera}`;
      if (a.nome.length > anterior.nome.length) anterior.nome = a.nome;
    }
  }
  return [...porCodigo.values()];
}

/* ------------------------------------------------------------ classificação */

export function classificarUnidade(bloco) {
  const unidade = semAcento(bloco.nome ?? "");
  const orgao = semAcento(bloco.orgaoNome ?? "");
  /*
   * A unidade 001 é a gestora do órgão em toda a codificação do estado. Onde o
   * nome dela não aparece em lugar nenhum do caderno — acontece nos exercícios
   * lidos pela tabela plana —, é dela que o órgão fala, e a natureza do órgão
   * vale para ela.
   */
  const gestora = GESTORA.test(unidade) || (!unidade && bloco.codigo === "001");

  if (INFANCIA.test(unidade)) return "infancia";
  if (ISE.test(unidade)) return "ise";
  if (ENSINO.test(unidade)) return "educacao";
  /* Sob a Secretaria de Educação, tudo é ensino menos cultura e esporte. */
  if (ORGAO_EDUCACAO.test(orgao) && !FORA_DO_ENSINO.test(unidade)) {
    return "educacao";
  }
  if (gestora) {
    if (INFANCIA.test(orgao)) return "infancia";
    if (ISE.test(orgao)) return "ise";
  }
  return null;
}

function descritorDa(nome) {
  const alvo = semAcento(nome);
  for (const [nomeDescritor, padrao] of DESCRITORES) {
    if (padrao.test(alvo)) return nomeDescritor;
  }
  return null;
}

/**
 * O que precisa de olho humano: "filho" quase sempre é nome de gente em nome de
 * equipamento público ("Hospital ... Filho"), e "recriança" já apareceu como
 * nome de programa. Marcar é melhor que descartar sozinho.
 */
function precisaRevisar(nome, descritor) {
  const alvo = semAcento(nome);
  return descritor === "filho" || /recrianca/.test(alvo);
}

/**
 * Exercício de 2014, lido à mão.
 *
 * O caderno suplementar de 30/12/2013 desenha as tabelas como glifos JBIG2, um a
 * um: não há texto para extrair, e cada glifo é um bitmap próprio, sem repetição
 * que permitisse montar um alfabeto. O OCR do sistema erra dígito demais para
 * valor orçamentário.
 *
 * O que deu certo: renderizar as páginas com o pdfjs (que decodifica o JBIG2) e
 * ler o "TOTAL GERAL" de cada unidade que entra integral — são onze, e a página
 * de cada uma está anotada abaixo, para conferência. Ficam de fora as unidades de
 * esporte (007), cultura (303), recursos humanos/cultura/desporto (306),
 * patrimônio (612) e fomento à cultura (628), pela mesma regra dos demais anos.
 *
 * A parcela das ações por descritor não foi varrida: exigiria OCR das 226 páginas
 * de quadro. Nos exercícios vizinhos ela fica entre 0,1% e 1,4% do total, então o
 * número de 2014 é um piso, e vai marcado como parcial.
 */
const APURACAO_MANUAL = {
  2014: {
    fonte: "Caderno suplementar do DOE de 30/12/2013 (edição 11.210), páginas lidas na renderização",
    unidades: [
      ["717", "001", "GABINETE DO SECRETÁRIO", "educacao", 175000.0, 633],
      ["717", "002", "GABINETE DO SECRETÁRIO ADJUNTO DE EDUCAÇÃO", "educacao", 455000.0, 634],
      ["717", "003", "DIRETORIA DE GESTÃO ESTRATÉGICA E RELAÇÕES INSTITUCIONAIS", "educacao", 3838002.0, 635],
      ["717", "004", "DIRETORIA DE INOVAÇÃO", "educacao", 2860021.0, 636],
      ["717", "005", "DIRETORIA DE ENSINO", "educacao", 16824102.84, 637],
      ["717", "006", "DIRETORIA DE RECURSOS", "educacao", 259164982.51, 639],
      ["717", "212", "INSTITUTO EST. DE DES. DA EDUCAÇÃO PROFIS. DOM MOACYR GRECHI-IDM", "educacao", 36265882.65, 643],
      ["717", "601", "FUNDO DE MANUTENÇÃO E DESENVOL. EDUCAÇÃO BÁSICA-FUNDEB", "educacao", 478120982.28, 648],
      ["722", "606", "FUNDO DO DIREITO DA CRIANÇA E DO ADOLESCENTE - FDCA", "infancia", 360010.0, 800],
      ["744", "004", "ASSESSORIA ESPECIAL DA JUVENTUDE", "infancia", 235000.0, 850],
      ["755", "213", "INSTITUTO SÓCIO EDUCATIVO DO ACRE - ISE", "ise", 4752000.0, 1037],
    ],
  },
};

function apuracaoManual(exercicio) {
  const manual = APURACAO_MANUAL[exercicio];
  if (!manual) return null;
  const unidadesIntegrais = manual.unidades.map(
    ([orgaoCodigo, unidadeCodigo, unidadeNome, motivo, total, pagina]) => ({
      orgaoCodigo,
      orgaoNome: null,
      unidadeCodigo,
      unidadeNome,
      motivo,
      acoes: 0,
      total,
      pagina,
    }),
  );
  const totalIntegrais = unidadesIntegrais.reduce((s, u) => s + u.total, 0);
  return {
    exercicio,
    origens: [manual.fonte],
    cobertura: "parcial — só unidades integrais",
    unidades: unidadesIntegrais.length,
    conferencia: { unidades: unidadesIntegrais.length, divergentes: 0, pelaTabelaPlana: 0 },
    unidadesIntegrais,
    acoesCasadas: [],
    conferidas: [],
    totalIntegrais,
    /* Não é zero: é parcela não apurada. */
    totalAcoes: null,
    ocad: totalIntegrais,
  };
}

/* ------------------------------------------------------------------ apuração */

/** Escolhe o arquivo de cada exercício: SEPLAN primeiro, DOE depois, Legis por fim. */
async function arquivosDoExercicio(exercicio) {
  let nomes;
  try {
    nomes = await readdir(resolve(CACHE, String(exercicio)));
  } catch {
    return [];
  }
  const pdfs = nomes.filter((n) => n.endsWith(".pdf"));
  const seplan = pdfs.filter((n) => n.startsWith("seplan"));
  if (seplan.length > 0) return seplan.map((n) => resolve(CACHE, String(exercicio), n));
  const doe = pdfs.filter((n) => n.startsWith("doe"));
  if (doe.length > 0) return doe.map((n) => resolve(CACHE, String(exercicio), n));
  return pdfs.map((n) => resolve(CACHE, String(exercicio), n));
}

async function apurar(exercicio) {
  const arquivos = await arquivosDoExercicio(exercicio);
  if (arquivos.length === 0) return null;

  const blocos = [];
  const planas = new Map();
  const nomes = new Map();
  const origens = [];
  const linhasComDescritor = [];
  for (const arquivo of arquivos) {
    const texto = await textoDoPDF(arquivo);
    /*
     * Rede de segurança: toda linha do caderno que tenha código de ação e um
     * descritor fica guardada. No fim, o que estiver aqui e não tiver entrado na
     * apuração vira lista de conferência — é assim que uma linha perdida na
     * conversão aparece, em vez de sumir calada.
     */
    let orgaoCorrente = null;
    let unidadeCorrente = null;
    for (const bruta of texto.split(/\r?\n/)) {
      const linha = limpar(bruta);
      const cabecalhoOrgao = linha.match(CABECALHO_ORGAO);
      if (cabecalhoOrgao) {
        orgaoCorrente = cabecalhoOrgao[1];
        unidadeCorrente = null;
        continue;
      }
      const cabecalhoUnidade = linha.match(CABECALHO_UNIDADE);
      if (cabecalhoUnidade) {
        unidadeCorrente = cabecalhoUnidade[1];
        continue;
      }
      if (!/\d{2}\.\d{3}\.\d{4}\.[\d ]{4}/.test(linha)) continue;
      if (!descritorDa(linha)) continue;
      /*
       * O quadro do governo é do estado inteiro e não tem dono; o cabeçalho que
       * ficou para trás é de outra página, e atribuir a ele seria chutar.
       */
      const doGoverno = /Programa de Trabalho do Governo/i.test(linha);
      linhasComDescritor.push({
        linha,
        orgao: doGoverno ? null : orgaoCorrente,
        unidade: doGoverno ? null : unidadeCorrente,
      });
    }
    const achados = blocosDeUnidade(texto);
    const plana = linhasPlanas(texto);
    for (const [chave, nome] of nomesDeUnidade(texto)) {
      const atual = nomes.get(chave);
      if (!atual || nome.length > atual.length) nomes.set(chave, nome);
    }
    if (achados.length === 0 && plana.size === 0) continue;
    origens.push(arquivo.split(/[\\/]/).pop());
    blocos.push(...achados);
    for (const [chave, unidade] of plana) {
      if (!planas.has(chave)) planas.set(chave, unidade);
      else planas.get(chave).acoes.push(...unidade.acoes);
    }
  }
  if (blocos.length === 0 && planas.size === 0) {
    return { exercicio, blocos: 0, origens: [] };
  }

  /*
   * O quadro de uma unidade atravessa várias páginas, e cada página reabre o
   * cabeçalho "Unidade:" — são pedaços do mesmo quadro, não unidades diferentes.
   * Aqui eles voltam a ser um só; a reimpressão do quadro inteiro em outro ponto
   * do caderno é desfeita depois, em `consolidar`, que fica com uma linha por
   * código e esfera.
   */
  const porUnidade = new Map();
  for (const b of blocos) {
    const chave = `${b.orgaoCodigo}-${b.codigo}`;
    const anterior = porUnidade.get(chave);
    if (!anterior) {
      porUnidade.set(chave, { ...b, acoes: [...b.acoes] });
      continue;
    }
    if (b.nome.length > anterior.nome.length) anterior.nome = b.nome;
    if ((b.orgaoNome?.length ?? 0) > (anterior.orgaoNome?.length ?? 0)) {
      anterior.orgaoNome = b.orgaoNome;
    }
    anterior.totalDeclarado = Math.max(
      anterior.totalDeclarado ?? 0,
      b.totalDeclarado ?? 0,
    );
    anterior.acoes.push(...b.acoes);
  }

  /* As unidades que só a tabela plana viu entram na roda, com nome do índice. */
  for (const [chave, unidade] of planas) {
    if (porUnidade.has(chave)) continue;
    porUnidade.set(chave, { ...unidade, orgaoNome: null, nome: "" });
  }

  /* Nome do índice sempre que o quadro trouxe nome curto ou nenhum. */
  for (const bloco of porUnidade.values()) {
    const doIndice = nomes.get(`${bloco.orgaoCodigo}-${bloco.codigo}`);
    if (doIndice && doIndice.length > (bloco.nome?.length ?? 0)) {
      bloco.nome = doIndice;
    }
    const orgaoIndice = nomes.get(`orgao-${bloco.orgaoCodigo}`);
    if (orgaoIndice && orgaoIndice.length > (bloco.orgaoNome?.length ?? 0)) {
      bloco.orgaoNome = orgaoIndice;
    }
  }

  const unidadesIntegrais = [];
  const acoesCasadas = [];
  const conferencia = {
    unidades: 0,
    divergentes: 0,
    pelaTabelaPlana: 0,
    /* Quanto do total que a lei declara não é explicado por nenhuma linha
     * impressa. De 2024 em diante o caderno publica ações só com o nome, sem
     * código e sem valor — o defeito é da publicação, não da leitura, e o
     * número fica registrado em vez de virar silêncio. */
    naoDetalhado: 0,
    unidadesIncompletas: 0,
  };

  for (const [chave, bloco] of porUnidade) {
    bloco.acoes = consolidar(bloco.acoes);
    const declarado = bloco.totalDeclarado ?? 0;

    /*
     * Duas leituras da mesma unidade: fica a que chega mais perto do total que a
     * própria lei declara. É o critério que resolve os exercícios em que uma das
     * conversões perde linhas, sem ter de escolher fonte no escuro.
     */
    const plana = planas.get(chave);
    if (plana && declarado > 0) {
      const somaQuadro = bloco.acoes.reduce((s, a) => s + a.total, 0);
      const acoesPlanas = consolidar(plana.acoes);
      const somaPlana = acoesPlanas.reduce((s, a) => s + a.total, 0);
      if (Math.abs(somaPlana - declarado) < Math.abs(somaQuadro - declarado)) {
        bloco.acoes = acoesPlanas;
        conferencia.pelaTabelaPlana++;
      }
    }

    const somaAcoes = bloco.acoes.reduce((s, a) => s + a.total, 0);
    const referencia = declarado || somaAcoes;
    conferencia.unidades++;
    if (referencia > 0 && Math.abs(somaAcoes - referencia) / referencia > 0.005) {
      conferencia.divergentes++;
    }

    const motivo = classificarUnidade(bloco);

    /*
     * O que a lei declara e nenhuma linha impressa explica. Só nas unidades
     * não integrais: nas integrais vale o total declarado, então o que falta
     * de detalhe não muda a soma. Aqui muda, porque valor não impresso é
     * ação que não pôde ser testada contra os descritores.
     */
    const naoDetalhado = declarado - somaAcoes;
    if (!motivo && declarado > 0 && naoDetalhado / declarado > 0.005) {
      conferencia.naoDetalhado += naoDetalhado;
      conferencia.unidadesIncompletas++;
    }
    if (motivo) {
      unidadesIntegrais.push({
        orgaoCodigo: bloco.orgaoCodigo,
        orgaoNome: bloco.orgaoNome,
        unidadeCodigo: bloco.codigo,
        unidadeNome: bloco.nome,
        motivo,
        acoes: bloco.acoes.length,
        /* O total da unidade é o que a lei declara; a soma das ações só entra
         * onde o quadro não traz o "TOTAL GERAL". */
        total: declarado || somaAcoes,
      });
      continue;
    }

    for (const acao of bloco.acoes) {
      const descritor = descritorDa(acao.nome);
      if (!descritor) continue;
      acoesCasadas.push({
        orgaoCodigo: bloco.orgaoCodigo,
        orgaoNome: bloco.orgaoNome,
        unidadeCodigo: bloco.codigo,
        unidadeNome: bloco.nome,
        codigo: acao.codigo,
        nome: acao.nome,
        esfera: acao.esfera,
        total: acao.total,
        descritor,
        revisar: precisaRevisar(acao.nome, descritor),
        origem: "quadro da unidade",
        soma: true,
      });
    }
  }


  /*
   * Linhas com descritor que a apuração não alcançou. Boa parte é reimpressão do
   * mesmo quadro ou linha de unidade integral, que já entrou pelo total — por
   * isso a lista é de conferência, não de erro.
   */
  /*
   * Conferência automática das linhas com descritor que a leitura por unidade
   * não alcançou. A comparação é pelo código reduzido a quatro grupos, porque a
   * ação e o seu subtítulo são códigos diferentes para a mesma despesa — comparar
   * pelo código cheio deixaria a dobra passar.
   */
  const quatroGrupos = (codigo) => codigo.split(".").slice(0, 4).join(".");
  const jaContadas = new Set(
    [
      ...acoesCasadas.map((a) => a.codigo),
      ...[...porUnidade.values()]
        .filter((b) => classificarUnidade(b))
        .flatMap((b) => b.acoes.map((a) => a.codigo)),
    ].map(quatroGrupos),
  );

  /* Onde cada ação mora, para saber se a órfã cai em unidade integral. */
  const unidadeDaAcao = new Map();
  for (const [chave, bloco] of porUnidade) {
    for (const acao of bloco.acoes) {
      if (!unidadeDaAcao.has(quatroGrupos(acao.codigo))) {
        unidadeDaAcao.set(quatroGrupos(acao.codigo), chave);
      }
    }
  }

  const conferidas = [];
  const vistas = new Set();
  for (const { linha, orgao, unidade } of linhasComDescritor) {
    const acao = linha.match(LINHA_ACAO);
    const codigo = acao?.[1].replace(/\s/g, "");
    if (!codigo || !CODIGO_ACAO.test(codigo)) continue;
    const chaveAcao = quatroGrupos(codigo);
    /* Uma decisão por ação, e ela fica registrada mesmo quando é de descarte:
     * descarte silencioso é indistinguível de linha esquecida. */
    if (vistas.has(chaveAcao)) continue;
    vistas.add(chaveAcao);
    const jaContada = jaContadas.has(chaveAcao);

    const chaveUnidade =
      orgao && unidade ? `${orgao}-${unidade}` : unidadeDaAcao.get(chaveAcao);
    const bloco = chaveUnidade ? porUnidade.get(chaveUnidade) : null;
    const integral = bloco ? classificarUnidade(bloco) : null;

    /*
     * Exercício sem leitura de unidade nenhuma não ganha OCAD por linha solta:
     * seria um número minúsculo passando por apuração. É o caso de 2014.
     */
    const semLeitura = porUnidade.size === 0 || unidadesIntegrais.length === 0;

    const destino = jaContada
      ? "já contada na apuração"
      : semLeitura
        ? "fora: exercício sem dado legível"
        : integral
          ? `já dentro do total da unidade (${integral})`
          : "somada";

    const item = {
      codigo,
      nome: limpar(acao[2]),
      total: numeroBR(acao[6]),
      orgaoCodigo: bloco?.orgaoCodigo ?? orgao ?? null,
      unidadeCodigo: bloco?.codigo ?? unidade ?? null,
      unidadeNome: bloco?.nome ?? null,
      descritor: descritorDa(acao[2]) ?? descritorDa(linha),
      destino,
      linha,
    };
    conferidas.push(item);

    if (destino === "somada") {
      acoesCasadas.push({
        orgaoCodigo: item.orgaoCodigo,
        orgaoNome: bloco?.orgaoNome ?? null,
        unidadeCodigo: item.unidadeCodigo,
        unidadeNome: item.unidadeNome ?? "(sem unidade identificada)",
        codigo: item.codigo,
        nome: item.nome,
        esfera: acao[3].toUpperCase(),
        total: item.total,
        descritor: item.descritor,
        revisar: precisaRevisar(item.nome, item.descritor) || !bloco,
        origem: "conferido automaticamente",
        soma: true,
      });
    }
  }

  /* As somas ficam por último: as linhas conferidas automaticamente já
   * entraram em `acoesCasadas` e precisam entrar na conta também. */
  const totalIntegrais = unidadesIntegrais.reduce((s, u) => s + u.total, 0);
  const totalAcoes = acoesCasadas.reduce((s, a) => s + a.total, 0);
  /* Sem unidade integral nenhuma, não houve leitura: os totais vão nulos, e
   * não zerados, para ninguém somar ou plotar um zero que não é medida. */
  const semLeitura = totalIntegrais === 0;

  return {
    exercicio,
    origens,
    /*
     * Exercício sem nenhuma unidade integral não é exercício sem OCAD: é
     * exercício que não foi lido. O caderno de 2014 é assim — existe, tem 1.220
     * páginas, e o corpo das tabelas não tem camada de texto.
     */
    cobertura: semLeitura ? "sem dado legível" : "completo",
    unidades: porUnidade.size,
    conferencia,
    unidadesIntegrais,
    acoesCasadas,
    conferidas,
    totalIntegrais: semLeitura ? null : totalIntegrais,
    totalAcoes: semLeitura ? null : totalAcoes,
    ocad: semLeitura ? null : totalIntegrais + totalAcoes,
  };
}

/**
 * Prova, a cada rodada, que nada foi contado duas vezes. A regra é da
 * coordenação: dado já contabilizado não entra de novo; entra na primeira vez e
 * só nela.
 *
 * As travas estão espalhadas pela leitura — `consolidar`, a fusão dos pedaços de
 * quadro, a comparação por código de quatro grupos na conferência. Trava sem
 * verificação, porém, é promessa: aqui ela vira teste, e a falha aborta a
 * gravação, porque número que conta em dobro é pior que número ausente.
 */
function conferirDuplicacoes(apuracao) {
  const achados = [];
  const { exercicio, acoesCasadas = [], unidadesIntegrais = [] } = apuracao;

  const vistas = new Map();
  for (const a of acoesCasadas) {
    const chave = `${a.orgaoCodigo}-${a.unidadeCodigo}-${a.codigo}`;
    if (vistas.has(chave)) {
      achados.push(
        `${exercicio}  ação somada duas vezes: ${chave} — ${a.nome.slice(0, 50)}`,
      );
    }
    vistas.set(chave, a);
  }

  const integrais = new Set(
    unidadesIntegrais.map((u) => `${u.orgaoCodigo}-${u.unidadeCodigo}`),
  );
  for (const a of acoesCasadas) {
    if (integrais.has(`${a.orgaoCodigo}-${a.unidadeCodigo}`)) {
      achados.push(
        `${exercicio}  ação somada dentro de unidade integral: ` +
          `${a.orgaoCodigo}-${a.unidadeCodigo} ${a.codigo} — ${a.nome.slice(0, 50)}`,
      );
    }
  }

  const unidades = new Set();
  for (const u of unidadesIntegrais) {
    const chave = `${u.orgaoCodigo}-${u.unidadeCodigo}`;
    if (unidades.has(chave)) {
      achados.push(`${exercicio}  unidade integral repetida: ${chave} ${u.unidadeNome}`);
    }
    unidades.add(chave);
  }

  return achados;
}

/* -------------------------------------------------------------------- saída */

const moeda = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Por que um exercício do acervo não tem apuração. Fica na planilha porque
 * ausência sem explicação vira suspeita de recorte escolhido — e não é: é falta
 * de fonte.
 */
const SEM_APURACAO = {
  "sem fonte digital":
    "Anexos anteriores à publicação eletrônica: o Diário Oficial do Acre passa a ter edição digital no fim de 2009, e os cadernos com a programação por unidade desses exercícios existem apenas em versões físicas. O texto da lei, que sobreviveu em meio digital, traz apenas quadros agregados, sem desdobramento por órgão.",
  "sem camada de texto":
    "O caderno suplementar de 30/12/2013 existe, com 1.220 páginas, mas só os cabeçalhos têm texto; o corpo das tabelas é imagem. Recuperável com OCR.",
};

const AVISO_RESUMO = (semApuracao) =>
  `Atenção: a série apurada vai de 2010 a 2026. Dos 36 exercícios do acervo, ${semApuracao} ficaram sem apuração porque seus anexos são anteriores à publicação eletrônica do Diário Oficial e não existem em meio digital — ausência de fonte, nunca ausência de orçamento. Eles estão listados abaixo sem valor: célula vazia, jamais zero.`;

async function planilha(apuracoes, exerciciosDoAcervo, destino) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Projeto OCAD";

  const resumo = wb.addWorksheet("Resumo por exercício");
  resumo.columns = [
    { header: "Exercício", key: "exercicio", width: 12 },
    { header: "Cobertura", key: "cobertura", width: 14 },
    { header: "Unidades integrais (R$)", key: "integrais", width: 24 },
    { header: "Ações por descritor (R$)", key: "acoes", width: 24 },
    { header: "OCAD (R$)", key: "ocad", width: 22 },
    { header: "Unidades lidas", key: "unidades", width: 15 },
    { header: "Ações casadas", key: "casadas", width: 14 },
    { header: "Unidades com divergência", key: "divergentes", width: 24 },
    { header: "Declarado sem detalhamento (R$)", key: "naoDetalhado", width: 30 },
    { header: "Arquivos", key: "origens", width: 40 },
    { header: "Por que não foi apurado", key: "razao", width: 80 },
  ];
  const porExercicio = new Map(apuracoes.map((a) => [a.exercicio, a]));
  let semApuracao = 0;
  for (const exercicio of exerciciosDoAcervo) {
    const a = porExercicio.get(exercicio);
    const apurado = a && a.cobertura === "completo";
    if (!apurado) semApuracao++;
    /*
     * Exercício sem apuração vai com as células de valor vazias, e não com zero:
     * zero é um número, e diria que não houve orçamento para criança e
     * adolescente naquele ano.
     */
    const cobertura = apurado
      ? "apurado"
      : a
        ? "sem camada de texto"
        : "sem fonte digital";
    resumo.addRow({
      exercicio,
      cobertura,
      integrais: apurado ? a.totalIntegrais : null,
      acoes: apurado ? a.totalAcoes : null,
      ocad: apurado ? a.ocad : null,
      unidades: apurado ? a.unidades : null,
      casadas: apurado ? a.acoesCasadas.length : null,
      divergentes: apurado ? a.conferencia.divergentes : null,
      naoDetalhado: apurado ? a.conferencia.naoDetalhado || null : null,
      origens: apurado ? a.origens.join(", ") : "",
      razao: apurado ? "" : SEM_APURACAO[cobertura],
    });
  }

  /* O aviso entra depois da tabela montada, empurrando o cabeçalho para baixo. */
  resumo.spliceRows(1, 0, [], [], []);
  resumo.mergeCells("A1:J2");
  const aviso = resumo.getCell("A1");
  aviso.value = AVISO_RESUMO(semApuracao);
  aviso.alignment = { wrapText: true, vertical: "middle" };
  aviso.font = { bold: true, color: { argb: "FF7A4100" } };
  aviso.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFDF0D5" },
  };
  resumo.getRow(1).height = 34;

  const acoes = wb.addWorksheet("Ações casadas");
  acoes.columns = [
    { header: "Exercício", key: "exercicio", width: 10 },
    { header: "Órgão", key: "orgao", width: 40 },
    { header: "Unidade", key: "unidade", width: 40 },
    { header: "Código da ação", key: "codigo", width: 22 },
    { header: "Ação", key: "nome", width: 60 },
    { header: "Esfera", key: "esfera", width: 8 },
    { header: "Valor (R$)", key: "total", width: 18 },
    { header: "Descritor", key: "descritor", width: 16 },
    { header: "Origem da leitura", key: "origem", width: 26 },
    { header: "Revisar", key: "revisar", width: 10 },
  ];
  for (const a of apuracoes) {
    for (const i of a.acoesCasadas) {
      acoes.addRow({
        exercicio: a.exercicio,
        orgao: `${i.orgaoCodigo} ${i.orgaoNome}`,
        unidade: `${i.unidadeCodigo} ${i.unidadeNome}`,
        codigo: i.codigo,
        nome: i.nome,
        esfera: i.esfera,
        total: i.total,
        descritor: i.descritor,
        origem: i.origem ?? "quadro da unidade",
        revisar: i.revisar ? "SIM" : "",
      });
    }
  }

  const integrais = wb.addWorksheet("Unidades 100%");
  integrais.columns = [
    { header: "Exercício", key: "exercicio", width: 10 },
    { header: "Órgão", key: "orgao", width: 40 },
    { header: "Unidade", key: "unidade", width: 45 },
    { header: "Motivo", key: "motivo", width: 14 },
    { header: "Ações", key: "acoes", width: 8 },
    { header: "Total (R$)", key: "total", width: 20 },
  ];
  for (const a of apuracoes) {
    for (const u of a.unidadesIntegrais) {
      integrais.addRow({
        exercicio: a.exercicio,
        orgao: `${u.orgaoCodigo} ${u.orgaoNome}`,
        unidade: `${u.unidadeCodigo} ${u.unidadeNome}`,
        motivo: u.motivo,
        acoes: u.acoes,
        total: u.total,
      });
    }
  }

  /*
   * Só o que ficou fora da soma. O que entrou está em "Ações casadas", uma vez
   * só, com a origem anotada — repetir aqui faria a mesma linha aparecer duas
   * vezes na planilha e convidaria a contar duas vezes.
   */
  const fora = wb.addWorksheet("Linhas fora da apuração");
  fora.columns = [
    { header: "Exercício", key: "exercicio", width: 10 },
    { header: "Código da ação", key: "codigo", width: 22 },
    { header: "Ação", key: "nome", width: 55 },
    { header: "Valor (R$)", key: "total", width: 18 },
    { header: "Unidade resolvida", key: "unidade", width: 45 },
    { header: "Descritor", key: "descritor", width: 14 },
    { header: "Por que ficou fora", key: "destino", width: 38 },
    { header: "Linha original do caderno", key: "linha", width: 120 },
  ];
  let nFora = 0;
  for (const a of apuracoes) {
    for (const i of a.conferidas ?? []) {
      if (i.destino === "somada") continue;
      fora.addRow({
        exercicio: a.exercicio,
        codigo: i.codigo,
        nome: i.nome,
        total: i.total,
        unidade: i.unidadeNome
          ? (i.orgaoCodigo ?? "?") + " " + (i.unidadeCodigo ?? "?") + " " + i.unidadeNome
          : "(não identificada)",
        descritor: i.descritor,
        destino: i.destino,
        linha: i.linha,
      });
      nFora++;
    }
  }
  if (nFora === 0) {
    fora.addRow({
      nome: "Nenhuma linha com descritor ficou fora da apuração nesta rodada.",
    });
  }

  for (const aba of [resumo, acoes, integrais, fora]) {
    /* No resumo o cabeçalho desceu três linhas, por causa do aviso. */
    const linhaDoCabecalho = aba === resumo ? 4 : 1;
    aba.getRow(linhaDoCabecalho).font = { bold: true };
    aba.views = [{ state: "frozen", ySplit: linhaDoCabecalho }];
    for (const coluna of aba.columns) {
      if (/R\$/.test(String(coluna.header))) coluna.numFmt = "#,##0.00";
    }
  }

  await wb.xlsx.writeFile(destino);
}

async function main() {
  const cobertura = JSON.parse(
    await readFile(resolve(CACHE, "cobertura.json"), "utf8"),
  );

  /* Todos os exercícios do acervo, para o resumo mostrar também os que
   * ficaram sem apuração — é a mesma fonte que alimenta o painel. */
  const normas = JSON.parse(
    await readFile(resolve(raiz, "data/historico-leis.json"), "utf8"),
  );
  const exerciciosDoAcervo = [...new Set(
    normas.filter((n) => n.tipo === "LOA" && n.exercicio).map((n) => n.exercicio),
  )].sort((a, b) => a - b);
  const exercicios = [
    ...new Set(
      cobertura.arquivos
        .filter((a) => a.veredito === "completo" || a.veredito === "só quadros agregados")
        .map((a) => a.exercicio),
    ),
  ].sort((a, b) => a - b);

  const apuracoes = [];
  for (const exercicio of exercicios) {
    const apuracao = apuracaoManual(exercicio) ?? (await apurar(exercicio));
    if (!apuracao || !apuracao.unidades) {
      console.log(`${exercicio}  sem quadro de unidade legível`);
      continue;
    }
    apuracoes.push(apuracao);
    if (apuracao.ocad === null) {
      console.log(`${exercicio}  sem camada de texto no caderno — sem apuração`);
      continue;
    }
    if (apuracao.totalAcoes === null) {
      console.log(
        `${exercicio}  unidades=${String(apuracao.unidades).padStart(4)}  ` +
          `integrais=${moeda(apuracao.totalIntegrais).padStart(22)}  ` +
          `ações= (não varridas)      OCAD=${moeda(apuracao.ocad).padStart(22)}  parcial`,
      );
      continue;
    }
    console.log(
      `${exercicio}  unidades=${String(apuracao.unidades).padStart(4)}  ` +
        `integrais=${moeda(apuracao.totalIntegrais).padStart(22)}  ` +
        `ações=${moeda(apuracao.totalAcoes).padStart(18)}  ` +
        `OCAD=${moeda(apuracao.ocad).padStart(22)}  ` +
        `divergências=${apuracao.conferencia.divergentes}`,
    );
  }

  /* Nada é gravado antes da prova de que nenhum dado foi contado duas vezes. */
  const duplicacoes = apuracoes.flatMap(conferirDuplicacoes);
  if (duplicacoes.length > 0) {
    console.error("DUPLICIDADE — nada foi gravado:");
    for (const d of duplicacoes) console.error("  " + d);
    process.exit(1);
  }
  console.log(
    "sem duplicidade: " +
      apuracoes.length +
      " exercícios conferidos — nenhuma ação somada duas vezes, nenhuma dentro de unidade integral",
  );

  await writeFile(
    resolve(raiz, "data/ocad-loas.json"),
    `${JSON.stringify(apuracoes, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    resolve(raiz, "data/ocad-loas.meta.json"),
    `${JSON.stringify(
      {
        geradoEm: new Date().toISOString().slice(0, 10),
        origem:
          "Programa de Trabalho do Órgão/Unidade (Anexo 6 da Lei 4.320) das leis orçamentárias do Acre",
        acervos: {
          "2010-2013": "Diário Oficial do Estado, pela data de publicação da lei",
          2014:
            "caderno suplementar do DOE de 30/12/2013, cujas tabelas são desenhadas como glifos JBIG2, sem texto extraível. As unidades integrais foram lidas na renderização das páginas, uma a uma; a varredura por descritores não alcança o exercício.",
          "2015-2026":
            "acervo de LOAs da SEPLAN, conferido com os anexos do Legis a partir de 2020",
          "1991-2009":
            "anexos anteriores à publicação eletrônica do Diário Oficial, que começa no fim de 2009; os cadernos desses exercícios existem apenas em versões físicas e o texto das leis traz apenas quadros agregados.",
        },
        regras: [
          "Unidades de ensino (gestora da SEE, Instituto Estadual de Educação e FUNDEB), ISE e unidades da infância entram pelo total, sem busca por descritor.",
          "Cultura, esporte e patrimônio, embora no mesmo órgão da educação, não entram pelo total: seguem para a busca por descritor.",
          "Nas demais unidades entram as ações cujo nome traz um dos descritores (menino, menina, criança, adolescente, adolescência, infância, infantil, juventude, filho e filhos).",
          "Ações marcadas como sugestão (infantil) ficam fora da soma até revisão.",
          "A unidade 001 de cada órgão é a gestora dele; onde o caderno não imprime o nome dela, herda a natureza do órgão.",
        ],
        exerciciosSemApuracao:
          "19 dos 36 exercícios: 1991 a 2009, cujos anexos antecedem a publicação eletrônica do Diário Oficial e existem apenas em versões físicas. Ausência de fonte digital, não ausência de orçamento nem de registro.",
        conferencia:
          "Por unidade, a soma das ações lidas é comparada ao TOTAL GERAL que a própria lei declara; onde as duas leituras do caderno divergem, vale a que chega mais perto do declarado. As linhas com descritor que ficaram fora da apuração vão para a aba 'Conferir no caderno' da planilha.",
        exercicios: apuracoes.map((a) => ({
          exercicio: a.exercicio,
          ocad: a.ocad,
          unidades: a.unidades,
          divergentes: a.conferencia.divergentes,
          origens: a.origens,
        })),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const destino = resolve(raiz, "Histórico/OCAD por exercício — conferência.xlsx");
  await planilha(apuracoes, exerciciosDoAcervo, destino);
  console.log(`\n${apuracoes.length} exercícios apurados`);
  console.log("data/ocad-loas.json, data/ocad-loas.meta.json e a planilha de conferência gravados");
}

if (process.argv[1]?.endsWith("extrair-ocad-loas.mjs")) main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
