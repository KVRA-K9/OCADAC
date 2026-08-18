/**
 * Gera o acervo normativo do OCAD a partir da planilha do histórico de leis.
 *
 * Cada aba do arquivo é um tipo de norma e tem colunas próprias, mas todas
 * seguem o mesmo esqueleto: número de ordem, "Nº da Lei" e ementa. O número de
 * ordem é ordinal da planilha e não é usado — o que ancora a linha do tempo é a
 * data extraída do próprio texto da norma.
 *
 * A planilha é irregular e o grosso deste script é limpeza:
 *   - linhas em branco no meio e no fim das abas;
 *   - tabulações, quebras e espaços dobrados no começo das ementas;
 *   - dois formatos de designação, um deles com a publicação no DOE colada
 *     ("Lei nº 4.282, de 27/12/2023Publicada no DOE de 12/01/2024");
 *   - valores da LOA como texto no padrão americano (" R$ 887,547,232.87 ");
 *   - quatro exercícios em cruzeiro, marcados só no nome do órgão.
 *
 * Uso: npm run historico:leis
 */

import { stat, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const FONTE = "Histórico/HISTÓRICO DE LEIS ORÇAMENTO CRIANÇA E ADOLESCENTE.xlsx";

/**
 * Abas e o que cada uma traz além de número e ementa. `tipo` é o rótulo que vai
 * para a tela; `extras` mapeia o índice da coluna para o campo.
 */
const ABAS = [
  { aba: "Lei Ordinária", tipo: "Lei Ordinária", extras: {} },
  { aba: "Decreto", tipo: "Decreto", extras: {} },
  {
    aba: "Estrutura básica da adm",
    tipo: "Estrutura Administrativa",
    extras: { orgaos: 3 },
  },
  { aba: "PPA", tipo: "PPA", extras: { citacoes: 4 } },
  { aba: "LDO", tipo: "LDO", extras: { citacoes: 4, metas: 5 } },
  {
    aba: "LOA",
    tipo: "LOA",
    extras: { orgaosCodigos: 3, orgaos: 4, rp: 5, outrasFontes: 6, total: 7 },
  },
];

/**
 * Cortes monetários entre o cruzeiro e o real: Cr$ → CR$ (mil para um, ago/93)
 * e CR$ → R$ (2.750 para um, jul/94). Os valores da planilha estão em milhares,
 * daí o ×1.000 embutido: 1.000 ÷ 2.750.000 = 1 ÷ 2.750.
 */
const CRUZEIRO_MIL_PARA_REAL = 1 / 2750;

const MESES = {
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

/** Tira tabulações, quebras, espaços dobrados e o caractere de substituição. */
function limpar(valor) {
  return String(valor ?? "")
    .replace(/�/g, ".")
    .replace(/[\t\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const iso = (ano, mes, dia) =>
  `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

/** Aceita "27/12/2023" e "19 DE JANEIRO DE 2026", que convivem na planilha. */
function extrairData(texto) {
  const barras = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (barras) return iso(barras[3], Number(barras[2]), Number(barras[1]));

  const extenso = texto.match(/(\d{1,2})\s+DE\s+([A-ZÇÃÊÁÉÍÓÚ]+)\s+DE\s+(\d{4})/i);
  if (extenso) {
    const mes = MESES[extenso[2].toLowerCase()];
    if (mes) return iso(extenso[3], mes, Number(extenso[1]));
  }
  return null;
}

/**
 * Quebra a designação da norma em espécie, número e datas. A publicação no DOE
 * vem colada ao fim do texto em boa parte das linhas.
 */
function interpretarDesignacao(bruto) {
  const texto = limpar(bruto);
  const [norma, publicado] = texto.split(/Publicada no DOE/i);

  const numero = norma.match(/n[ºo°.]?\s*([\d.]+\d)/i)?.[1] ?? null;
  if (!numero) return null;

  const especie = limpar(norma.slice(0, norma.search(/n[ºo°.]?\s*[\d]/i)))
    .replace(/[,;]$/, "")
    .toLowerCase();

  const data = extrairData(norma);
  const ano = data
    ? Number(data.slice(0, 4))
    : Number(norma.match(/(\d{4})\s*$/)?.[1] ?? 0) || null;

  return {
    // "LEI COMPLEMENTAR" e "lei complementar" convivem na fonte.
    especie: especie
      ? especie.replace(/\b\p{L}/gu, (c) => c.toUpperCase())
      : "Lei",
    numero,
    data,
    ano,
    publicacao: publicado ? extrairData(publicado) : null,
  };
}

/** Números da LOA: " R$ 887,547,232.87 " e " -   " no lugar de zero. */
function numeroLOA(valor) {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "number") return valor;
  const limpo = String(valor)
    .replace(/R\$/gi, "")
    .replace(/[\s ]/g, "")
    .replace(/,/g, "");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

function extrairExercicio(ementa) {
  const exercicio = ementa.match(
    /exerc[ií]cio(?:\s+financeiro)?\s+de\s+(\d{4})/i,
  );
  if (exercicio) return Number(exercicio[1]);
  const ano = ementa.match(/para\s+o\s+ano\s+de\s+(\d{4})/i);
  return ano ? Number(ano[1]) : null;
}

function extrairQuadrienio(ementa) {
  const m = ementa.match(/quadri[êe]nio\s+(?:de\s+)?(\d{4})\s*[-–—]\s*(\d{4})/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * Índice dos hiperlinks de uma coluna: `sheet_to_json` devolve só os valores das
 * células, e o endereço mora em `celula.l.Target`. A chave é a linha da planilha,
 * base zero.
 */
function mapearLinks(planilha, coluna = 1) {
  const links = new Map();
  for (const ref of Object.keys(planilha)) {
    if (ref[0] === "!") continue;
    const celula = planilha[ref];
    if (!celula.l?.Target) continue;
    const { c, r } = XLSX.utils.decode_cell(ref);
    if (c === coluna) links.set(r, { url: String(celula.l.Target).trim(), texto: limpar(celula.v) });
  }
  return links;
}

/** Metas e prioridades vêm num bloco só, uma por linha. */
function extrairMetas(bruto) {
  return String(bruto ?? "")
    .split(/[\r\n]+/)
    .map((l) => l.replace(/�/g, ".").replace(/^[\s_]+/, "").trim())
    .filter((l) => l.length > 1);
}

async function main() {
  const caminho = resolve(raiz, FONTE);
  const wb = XLSX.readFile(caminho);
  const info = await stat(caminho);

  const normas = [];
  let atualizadoEm = null;

  for (const { aba, tipo, extras } of ABAS) {
    const planilha = wb.Sheets[aba];
    if (!planilha) throw new Error(`Aba ausente na planilha: ${aba}`);
    const linhas = XLSX.utils.sheet_to_json(planilha, {
      header: 1,
      raw: false,
      defval: "",
    });

    /*
     * As abas não começam todas na mesma linha — "Lei Ordinária" vai de A1 e as
     * demais de A2 —, e `sheet_to_json` numera a partir do início da faixa. Sem
     * somar a origem, o link de uma norma cairia na norma vizinha.
     */
    const origem = XLSX.utils.decode_range(planilha["!ref"]).s.r;
    const links = mapearLinks(planilha);

    for (const [i, linha] of linhas.entries()) {
      // "Atualizado em:" aparece uma vez por aba, sempre com a mesma data.
      if (limpar(linha[0]).startsWith("Atualizado em")) {
        atualizadoEm = atualizadoEm ?? limpar(linha[1]);
      }

      const designacao = interpretarDesignacao(linha[1]);
      const ementa = limpar(linha[2]);
      // Sem número de norma não há o que registrar: são as linhas de cabeçalho,
      // as vazias do meio das abas e a folga no fim de cada uma.
      if (!designacao || !designacao.ano || !ementa) continue;

      /*
       * Confere o alinhamento em vez de confiar nele: o texto da célula linkada
       * é a própria designação. Um deslocamento aqui espalharia link errado por
       * 146 normas sem fazer barulho.
       */
      const link = links.get(origem + i) ?? null;
      if (link && link.texto !== limpar(linha[1])) {
        throw new Error(
          `Link fora de lugar na aba ${aba}, linha ${origem + i + 1}: ` +
            `a célula linkada diz "${link.texto}" e a linha lida diz "${limpar(linha[1])}"`,
        );
      }

      const norma = {
        id: `${tipo}-${normas.length}`,
        tipo,
        especie: designacao.especie,
        numero: designacao.numero,
        ementa,
        ano: designacao.ano,
        data: designacao.data,
        publicacao: designacao.publicacao,
        /* Texto integral no Legis do Acre, como a planilha o registra. */
        link: link?.url ?? null,
        exercicio: extrairExercicio(ementa),
        quadrienio: extrairQuadrienio(ementa),
        orgaos: extras.orgaos ? limpar(linha[extras.orgaos]) || null : null,
        citacoes: extras.citacoes
          ? limpar(linha[extras.citacoes]).replace(/_+$/, "") || null
          : null,
        metas: extras.metas ? extrairMetas(linha[extras.metas]) : [],
        loa: null,
      };

      if (tipo === "LOA") {
        const nome = limpar(linha[extras.orgaos]);
        const emCruzeiro = /cr\$/i.test(nome);
        const fator = emCruzeiro ? CRUZEIRO_MIL_PARA_REAL : 1;
        const total = numeroLOA(linha[extras.total]);
        norma.loa = {
          rp: numeroLOA(linha[extras.rp]) * fator,
          outrasFontes: numeroLOA(linha[extras.outrasFontes]) * fator,
          total: total * fator,
          moedaOriginal: emCruzeiro ? "Cr$" : "R$",
          totalOriginal: total,
          codigos: limpar(linha[extras.orgaosCodigos]) || null,
        };
      }

      normas.push(norma);
    }
  }

  /*
   * A mesma norma pode estar em mais de uma aba da planilha: a Lei 1.011/1991,
   * que cria o CEDCA, é ao mesmo tempo lei ordinária e lei de estrutura
   * administrativa. No painel ela precisa contar uma vez só — dado já
   * contabilizado não entra de novo.
   *
   * O link é a identidade: mesma página no Legis, mesma norma. Fica o registro
   * mais completo, e as demais abas em que ela aparece ficam anotadas em
   * `abas`, para a informação de origem não se perder no caminho.
   */
  const preenchidos = (n) =>
    [n.orgaos, n.citacoes, n.link, n.exercicio, n.quadrienio, n.loa].filter(
      (v) => v !== null && v !== undefined,
    ).length + n.metas.length;

  const porLink = new Map();
  const repetidas = [];
  for (const n of normas) {
    const chave = n.link ?? `sem-link-${n.id}`;
    const anterior = porLink.get(chave);
    if (!anterior) {
      porLink.set(chave, { ...n, abas: [n.tipo] });
      continue;
    }
    repetidas.push(`${n.especie} ${n.numero}/${n.ano} (${anterior.tipo} e ${n.tipo})`);
    if (preenchidos(n) > preenchidos(anterior)) {
      porLink.set(chave, { ...n, abas: [...anterior.abas, n.tipo] });
    } else {
      anterior.abas.push(n.tipo);
    }
  }
  const unicas = [...porLink.values()];

  /*
   * Número repetido entre normas de links diferentes é outra coisa: são normas
   * distintas que a planilha registrou com o mesmo número. Não se juntam — o que
   * se faz é registrar a inconsistência da fonte.
   */
  const porNumero = new Map();
  const numerosEmConflito = [];
  for (const n of unicas) {
    const chave = `${n.especie} ${n.numero}/${n.ano}`;
    if (porNumero.has(chave)) numerosEmConflito.push(chave);
    else porNumero.set(chave, n);
  }

  unicas.sort((a, b) => b.ano - a.ano || a.tipo.localeCompare(b.tipo, "pt-BR"));
  normas.length = 0;
  normas.push(...unicas);

  if (repetidas.length > 0) {
    console.log(`  ${repetidas.length} norma(s) em mais de uma aba, contada(s) uma vez:`);
    for (const r of repetidas) console.log(`    ${r}`);
  }
  if (numerosEmConflito.length > 0) {
    console.log(`  ${numerosEmConflito.length} número(s) repetido(s) entre normas distintas:`);
    for (const c of numerosEmConflito) console.log(`    ${c}`);
  }


  const porTipo = {};
  for (const n of normas) porTipo[n.tipo] = (porTipo[n.tipo] ?? 0) + 1;

  const meta = {
    arquivoFonte: FONTE.split("/").pop(),
    origem: "Histórico de leis do Orçamento Criança e Adolescente — SEPLAN/AC",
    dataArquivo: info.mtime.toISOString().slice(0, 10),
    atualizadoEm,
    geradoEm: new Date().toISOString().slice(0, 10),
    normas: normas.length,
    porTipo,
    /*
     * Duas inconsistências da fonte, registradas em vez de corrigidas: mexer no
     * número sem confirmação com a SEPLAN seria inventar dado.
     */
    observacoes: [
      "O exercício de 1991 (Cr$ 4.518.657 mil) é menor que o de 1992 em plena hiperinflação, o que não fecha com a série.",
      "A lei do exercício de 1994 é de dezembro de 1993, quando já vigorava o cruzeiro real; a planilha rotula os quatro primeiros exercícios como Cr$ mil.",
      "A conversão de cruzeiro para real é nominal, pelos cortes monetários, sem correção pela inflação.",
      ...(repetidas.length > 0
        ? [
            `${repetidas.length} norma(s) aparecem em mais de uma aba da planilha e foram contadas uma única vez: ${repetidas.join("; ")}.`,
          ]
        : []),
      ...(numerosEmConflito.length > 0
        ? [
            `${numerosEmConflito.length} número(s) de lei aparecem em normas distintas, com links e ementas diferentes — inconsistência da fonte, mantida como está: ${numerosEmConflito.join("; ")}.`,
          ]
        : []),
    ],
  };

  await writeFile(
    resolve(raiz, "data/historico-leis.json"),
    `${JSON.stringify(normas, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    resolve(raiz, "data/historico-leis.meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf8",
  );

  console.log(`${normas.length} normas gravadas em data/historico-leis.json`);
  for (const [tipo, n] of Object.entries(porTipo)) console.log(`  ${tipo}: ${n}`);

  const semLink = normas.filter((n) => !n.link).length;
  console.log(
    semLink === 0
      ? "  todas com link para o texto da norma"
      : `  ${semLink} sem link para o texto da norma`,
  );
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
