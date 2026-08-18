/**
 * Procura um descritor da metodologia no texto integral das normas do acervo.
 *
 * As 146 normas da planilha de histórico têm link para o Legis do Acre, e é lá
 * que está o texto completo — a planilha guarda só a ementa. Quando a lista de
 * descritores muda, é esta varredura que diz o que o acervo tem a mais.
 *
 * O HTML de cada norma fica em `.cache/normas/`, fora do versionamento: assim a
 * busca por outra palavra não repete o download de 145 páginas.
 *
 * Uso: node scripts/buscar-descritor.mjs [descritor]   (padrão: infantil)
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { limpar } from "./texto-loa.mjs";

const execArquivo = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const CACHE = resolve(raiz, ".cache/normas");

/** Os padrões são os mesmos de `scripts/extrair-ocad-loas.mjs`. */
const PADROES = {
  infantil: /\binfanti[la]s?\b/g,
  menino: /\bmenin[oa]s?\b/g,
  crianca: /\bcrianc[ao]s?\b/g,
  adolescente: /\badolescent[ei]s?\b|\badolescencias?\b/g,
  infancia: /\binfancias?\b/g,
  juventude: /\bjuventudes?\b/g,
  filho: /\bfilh[oa]s?\b/g,
};

const semAcento = (t) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * O Legis serve a cadeia de certificados incompleta e o `fetch` do Node recusa;
 * o curl, com o próprio pacote de raízes, passa. Mesma solução de
 * `scripts/baixar-loas.mjs`, pelo mesmo motivo.
 */
async function baixarHTML(url, tentativas = 3) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (erro) {
      if (/certificate|fetch failed/i.test(String(erro.message ?? erro))) {
        const { stdout } = await execArquivo(
          "curl",
          ["-sSL", "--max-time", "90", url],
          { maxBuffer: 64 * 1024 * 1024 },
        );
        return stdout;
      }
      if (i === tentativas) throw erro;
      await espera(1500 * i);
    }
  }
}

/** Só o texto: fora script, estilo, marcação e entidades. */
function textoDoHTML(html) {
  return limpar(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&[a-z]+;/gi, " "),
  );
}

async function textoDaNorma(norma) {
  const arquivo = resolve(CACHE, `${norma.id.replace(/[^\w-]/g, "_")}.html`);
  try {
    return textoDoHTML(await readFile(arquivo, "utf8"));
  } catch {
    const html = await baixarHTML(norma.link.replace(/^http:/, "https:"));
    await mkdir(CACHE, { recursive: true });
    await writeFile(arquivo, html, "utf8");
    return textoDoHTML(html);
  }
}

/** Trechos em volta de cada acerto — é o que permite julgar a menção. */
function trechos(texto, padrao, volta = 120) {
  const alvo = semAcento(texto);
  const achados = [];
  padrao.lastIndex = 0;
  let m;
  while ((m = padrao.exec(alvo)) !== null) {
    const ini = Math.max(0, m.index - volta);
    const fim = Math.min(texto.length, m.index + m[0].length + volta);
    achados.push({
      palavra: texto.slice(m.index, m.index + m[0].length),
      trecho: `…${limpar(texto.slice(ini, fim))}…`,
    });
    if (achados.length > 40) break;
  }
  return achados;
}

async function main() {
  const descritor = (process.argv[2] ?? "infantil").toLowerCase();
  const padrao = PADROES[semAcento(descritor)];
  if (!padrao) {
    console.error(`Descritor sem padrão: ${descritor}`);
    console.error(`Conhecidos: ${Object.keys(PADROES).join(", ")}`);
    process.exit(1);
  }

  const normas = JSON.parse(
    await readFile(resolve(raiz, "data/historico-leis.json"), "utf8"),
  );
  const comLink = normas.filter((n) => n.link);

  const acertos = [];
  const falhas = [];
  let lidas = 0;

  for (const norma of comLink) {
    let texto;
    try {
      texto = await textoDaNorma(norma);
      lidas++;
    } catch (erro) {
      falhas.push({ id: norma.id, link: norma.link, erro: String(erro.message ?? erro) });
      continue;
    }

    const achados = trechos(texto, padrao);
    if (achados.length === 0) continue;

    acertos.push({
      id: norma.id,
      tipo: norma.tipo,
      especie: norma.especie,
      numero: norma.numero,
      ano: norma.ano,
      exercicio: norma.exercicio,
      ementa: norma.ementa,
      link: norma.link,
      naEmenta: padrao.test(semAcento(norma.ementa)),
      ocorrencias: achados.length,
      trechos: achados.slice(0, 5),
    });
  }

  acertos.sort((a, b) => b.ano - a.ano);

  const porTipo = {};
  for (const a of acertos) porTipo[a.tipo] = (porTipo[a.tipo] ?? 0) + 1;

  await writeFile(
    resolve(raiz, `data/normas-${semAcento(descritor)}.json`),
    `${JSON.stringify(
      {
        descritor,
        padrao: String(padrao),
        geradoEm: new Date().toISOString().slice(0, 10),
        normasLidas: lidas,
        normasComOTermo: acertos.length,
        porTipo,
        falhas,
        normas: acertos,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`"${descritor}" — ${lidas} normas lidas, ${acertos.length} com o termo`);
  console.log(porTipo);
  if (falhas.length > 0) console.log(`falhas de leitura: ${falhas.length}`);
  for (const a of acertos) {
    console.log(
      `\n${a.tipo} · ${a.especie} ${a.numero}/${a.ano}${a.exercicio ? ` (exercício ${a.exercicio})` : ""}` +
        `  ${a.ocorrencias}x${a.naEmenta ? " — também na ementa" : ""}`,
    );
    console.log(`  ${a.trechos[0].trecho.slice(0, 220)}`);
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
