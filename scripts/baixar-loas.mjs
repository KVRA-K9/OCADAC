/**
 * Etapa 0 do OCAD por exercício: garimpa o texto das leis orçamentárias.
 *
 * O que a apuração precisa é da programação por unidade orçamentária — a lista
 * de ações com nome e valor. Ela não está no corpo da lei, que só traz quadros
 * agregados por órgão e por função; está nos anexos. E os anexos estão espalhados
 * por três acervos, cada um com um alcance:
 *
 *   - Legis do Acre  → anexos das LOAs de 2020 a 2026 (as demais não têm);
 *   - SEPLAN         → LOAs de 2015 a 2026, nas edições do Diário Oficial;
 *   - Diário Oficial → busca por data, com acervo que começa no fim de 2009.
 *
 * A data de publicação no DOE de cada LOA já está em `data/historico-leis.json`,
 * e é ela que abre a porta do terceiro acervo.
 *
 * O script baixa para `.cache/loas/` (fora do versionamento), nunca rebaixa o
 * que já está lá e mede a camada de texto de cada PDF com `pdftotext`. Não há
 * OCR nesta máquina: PDF sem texto é lacuna declarada, não trabalho extra.
 *
 * Uso: node scripts/baixar-loas.mjs
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execArquivo = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const CACHE = resolve(raiz, ".cache/loas");

const SEPLAN_INDICE =
  "https://seplan.ac.gov.br/planejamento-governamental/lei-orcamentaria-anual-loa/";
const DOE = "https://diario.ac.gov.br/";

/** Código de ação no padrão função.subfunção.programa.ação.subtítulo. */
const CODIGO_ACAO = /\b\d{2}\.\d{3}\.\d{4}\.\d{4}\.\d{4}\b/;
const DESCRITORES =
  /menin[oa]s?|crian[çc]as?|adolesc[êe]nci?a?s?|inf[âa]ncia|juventude|filhos?/i;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function existe(caminho) {
  try {
    return (await stat(caminho)).size > 0;
  } catch {
    return false;
  }
}

/**
 * Busca com paciência: os três acervos são lentos e caem por tempo esgotado com
 * alguma frequência, e desistir na primeira tentativa deixaria buraco no
 * relatório por motivo de rede, não de acervo.
 */
async function buscar(url, opcoes = {}, tentativas = 3) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      const resposta = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(opcoes.timeout ?? 180_000),
        ...opcoes,
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return resposta;
    } catch (erro) {
      if (i === tentativas) throw erro;
      await espera(2000 * i);
    }
  }
}

/**
 * O Legis serve a cadeia de certificados incompleta e o `fetch` do Node recusa
 * ("unable to verify the first certificate"), enquanto o curl, com o próprio
 * pacote de raízes, passa. Em vez de desligar a verificação de TLS, delega-se a
 * ele — mesma segurança, sem exceção aberta no código.
 */
async function buscarComCurl(url) {
  const { stdout } = await execArquivo(
    "curl",
    ["-sSL", "--max-time", "300", url],
    { maxBuffer: 256 * 1024 * 1024, encoding: "buffer" },
  );
  return stdout;
}

async function baixar(url, destino, opcoes = {}) {
  if (await existe(destino)) return { baixado: false, destino };
  await mkdir(dirname(destino), { recursive: true });
  let dados;
  try {
    dados = Buffer.from(await (await buscar(url, opcoes)).arrayBuffer());
  } catch (erro) {
    if (!/certificate|fetch failed/i.test(String(erro.message ?? erro))) throw erro;
    dados = await buscarComCurl(url);
  }
  await writeFile(destino, dados);
  return { baixado: true, destino, bytes: dados.length };
}

/* ------------------------------------------------------------------ acervos */

/** Anexos da página da norma no Legis: `anexos/<id>/<hash>_<n>.pdf`. */
async function anexosDoLegis(link) {
  const url = link.replace(/^http:/, "https:");
  let html;
  try {
    html = await (await buscar(url)).text();
  } catch {
    html = (await buscarComCurl(url)).toString("utf8");
  }
  const achados = html.match(/anexos\/\d+\/[a-f0-9]+_\d+\.pdf/g) ?? [];
  return [...new Set(achados)].map((a) => `https://legis.ac.gov.br/${a}`);
}

/** Índice de LOAs da SEPLAN: um PDF por exercício, com o ano no nome. */
async function indiceDaSeplan() {
  const html = await (await buscar(SEPLAN_INDICE)).text();
  const porExercicio = new Map();
  for (const href of html.match(/https?:\/\/[^"' ]+?\.pdf/gi) ?? []) {
    const nome = href.split("/").pop();
    if (!/loa/i.test(nome)) continue;
    const ano = nome.match(/(20\d{2})/)?.[1];
    if (ano) porExercicio.set(Number(ano), href.replace(/&amp;/g, "&"));
  }
  return porExercicio;
}

/**
 * Edições do DOE de uma data. A resposta traz sempre o link da edição corrente
 * no cabeçalho da página; ele é descontado comparando com a busca de uma data
 * sem edição, senão toda data pareceria ter arquivo.
 */
async function edicoesDoDOE(dataISO, ruido) {
  const resposta = await buscar(DOE, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `data=${dataISO}`,
    timeout: 60_000,
  });
  const html = await resposta.text();
  const links = new Set(
    (html.match(/download\.php\?arquivo=[A-Za-z0-9+/=]+/g) ?? []).map(
      (l) => `${DOE}${l}`,
    ),
  );
  for (const r of ruido) links.delete(r);
  return [...links];
}

/* ------------------------------------------------------------------ medição */

/**
 * Mede o que o PDF tem de aproveitável: páginas, caracteres de texto, linhas de
 * ação e ocorrências dos descritores. É o que separa "orçamento completo" de
 * "só o corpo da lei" e de "imagem digitalizada".
 */
async function medir(caminho) {
  try {
    const { stdout } = await execArquivo(
      "pdftotext",
      ["-layout", "-enc", "UTF-8", caminho, "-"],
      { maxBuffer: 512 * 1024 * 1024 },
    );
    const paginas = (stdout.match(/\f/g) ?? []).length + 1;
    const linhas = stdout.split(/\r?\n/);
    const acoes = linhas.filter((l) => CODIGO_ACAO.test(l)).length;
    const descritores = linhas.filter((l) => DESCRITORES.test(l)).length;
    const caracteres = stdout.replace(/\s/g, "").length;
    return {
      paginas,
      caracteres,
      porPagina: Math.round(caracteres / paginas),
      acoes,
      descritores,
      veredito:
        caracteres / paginas < 200
          ? "imagem"
          : acoes > 100
            ? "completo"
            : "só quadros agregados",
    };
  } catch (erro) {
    return { erro: String(erro.message ?? erro), veredito: "ilegível" };
  }
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  const normas = JSON.parse(
    await readFile(resolve(raiz, "data/historico-leis.json"), "utf8"),
  );
  const loas = normas
    .filter((n) => n.tipo === "LOA")
    .sort((a, b) => a.exercicio - b.exercicio);

  const seplan = await indiceDaSeplan();
  console.log(`SEPLAN: ${seplan.size} exercícios no índice\n`);

  /* Link da edição corrente, que aparece em qualquer resposta do DOE. */
  const ruidoDOE = await edicoesDoDOE("1900-01-01", []);

  const arquivos = [];

  for (const loa of loas) {
    const ex = loa.exercicio;
    const alvos = [];

    if (seplan.has(ex)) alvos.push({ origem: "seplan", url: seplan.get(ex) });

    /*
     * O Legis é a segunda opinião de 2020 em diante: a SEPLAN já cobre esses
     * exercícios, e o anexo do Legis serve para conferir. Se o acervo cair, o
     * exercício não se perde — segue com a fonte da SEPLAN.
     */
    if (ex >= 2020) {
      try {
        for (const url of await anexosDoLegis(loa.link)) {
          alvos.push({ origem: "legis", url });
        }
      } catch (erro) {
        console.log(`${ex}  legis indisponível: ${erro.message}`);
      }
    }

    /*
     * O DOE só entra onde os outros dois não alcançam. A data de publicação é a
     * chave; onde ela falta, a data da própria lei serve de segunda tentativa,
     * porque a publicação costuma sair poucos dias depois.
     */
    if (!seplan.has(ex) && ex < 2020) {
      for (const data of [loa.publicacao, loa.data].filter(Boolean)) {
        const edicoes = await edicoesDoDOE(data, ruidoDOE);
        for (const [i, url] of edicoes.entries()) {
          alvos.push({ origem: `doe:${data}`, url, indice: i });
        }
        if (edicoes.length > 0) break;
      }
    }

    if (alvos.length === 0) {
      console.log(`${ex}  — nada encontrado`);
      arquivos.push({ exercicio: ex, origem: null, veredito: "não encontrado" });
      continue;
    }

    for (const [i, alvo] of alvos.entries()) {
      const destino = resolve(
        CACHE,
        String(ex),
        `${alvo.origem.replace(/[:]/g, "-")}-${i}.pdf`,
      );
      try {
        const { baixado } = await baixar(alvo.url, destino);
        const bytes = (await stat(destino)).size;
        const medida = await medir(destino);
        console.log(
          `${ex}  ${alvo.origem.padEnd(16)} ${mb(bytes).padStart(8)}  ` +
            `${String(medida.paginas ?? "-").padStart(5)}p  ` +
            `ações=${String(medida.acoes ?? 0).padStart(5)}  ` +
            `descritores=${String(medida.descritores ?? 0).padStart(4)}  ` +
            `${medida.veredito}${baixado ? "" : "  (cache)"}`,
        );
        arquivos.push({
          exercicio: ex,
          origem: alvo.origem,
          url: alvo.url,
          arquivo: destino.replace(`${raiz}\\`, "").replace(`${raiz}/`, ""),
          bytes,
          ...medida,
        });
      } catch (erro) {
        console.log(`${ex}  ${alvo.origem.padEnd(16)} falhou: ${erro.message}`);
        arquivos.push({
          exercicio: ex,
          origem: alvo.origem,
          url: alvo.url,
          veredito: "falhou",
          erro: String(erro.message ?? erro),
        });
      }
    }
  }

  /* Um veredito por exercício: vale o melhor arquivo que ele tiver. */
  const ordem = ["completo", "só quadros agregados", "imagem", "ilegível", "falhou", "não encontrado"];
  const porExercicio = {};
  for (const a of arquivos) {
    const atual = porExercicio[a.exercicio];
    if (!atual || ordem.indexOf(a.veredito) < ordem.indexOf(atual.veredito)) {
      porExercicio[a.exercicio] = a;
    }
  }

  await mkdir(CACHE, { recursive: true });
  await writeFile(
    resolve(CACHE, "cobertura.json"),
    `${JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), arquivos, porExercicio }, null, 2)}\n`,
    "utf8",
  );

  console.log("\n— cobertura por exercício —");
  const contagem = {};
  for (const [ex, a] of Object.entries(porExercicio)) {
    contagem[a.veredito] = (contagem[a.veredito] ?? 0) + 1;
    console.log(`${ex}  ${a.veredito}${a.origem ? `  (${a.origem})` : ""}`);
  }
  console.log("\n", contagem);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
