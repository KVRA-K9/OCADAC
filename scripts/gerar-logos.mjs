/**
 * Normaliza os logotipos das secretarias para `public/logos/`.
 *
 * Os arquivos originais chegam em formatos, proporções e pesos muito
 * diferentes — de 390×390 com 5 KB a 2048×768 com 1 MB. Renderizados como
 * estão, uns aparecem grandes e outros minúsculos no mesmo card.
 *
 * O tratamento é o mesmo para todos:
 *   1. `trim` remove a moldura vazia em volta da arte, para que a margem do
 *      arquivo original não vire tamanho aparente diferente entre logotipos;
 *   2. `resize contain` encaixa tudo numa tela única, sem cortar nem distorcer;
 *   3. saída em WebP com fundo transparente.
 *
 * Com todos na mesma tela, o `object-contain` do card aplica a mesma escala a
 * todos — é o que os deixa visualmente do mesmo tamanho.
 *
 * Uso: npm run logos
 */

import { readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const DESTINO = resolve(raiz, "public/logos");

/**
 * Pastas de origem, da mais recente para a mais antiga. A primeira que tiver a
 * sigla vence — assim uma leva nova substitui a anterior sem apagar nada, e
 * quem não veio na leva nova continua com a imagem que já tinha.
 */
const ORIGENS = ["Fotografias/Secs/IA", "Fotografias/Secs"];

/** Tela comum, na proporção 4:3 das ilustrações atuais. */
const LARGURA = 480;
const ALTURA = 360;

/**
 * As ilustrações vêm com fundo branco opaco. Compor todas sobre branco — e não
 * sobre transparente — é o que evita a mistura de plaquinhas brancas com
 * logotipos recortados na mesma grade.
 */
const FUNDO = { r: 255, g: 255, b: 255, alpha: 1 };

const SIGLAS = [
  "SEE",
  "SEAD",
  "SESACRE",
  "SEASDH",
  "SEJUSP",
  "SEEL",
  "SEOP",
  "SEHURB",
  "SEMULHER",
];

/** Nomes que não são a sigla pura e precisam de tradução. */
const APELIDOS = {
  "logo-see-acre": "SEE",
  seop_ac: "SEOP",
};

const EXTENSOES = /\.(png|jpe?g|webp)$/i;

/** Varre as origens e devolve, por sigla, o primeiro arquivo encontrado. */
async function localizarOrigens() {
  const encontrados = new Map();
  for (const pasta of ORIGENS) {
    let arquivos = [];
    try {
      arquivos = await readdir(resolve(raiz, pasta));
    } catch {
      continue;
    }
    for (const arquivo of arquivos) {
      if (!EXTENSOES.test(arquivo)) continue;
      const base = arquivo.replace(EXTENSOES, "");
      const sigla = APELIDOS[base.toLowerCase()] ?? base.toUpperCase();
      if (!SIGLAS.includes(sigla) || encontrados.has(sigla)) continue;
      encontrados.set(sigla, { pasta, arquivo });
    }
  }
  return encontrados;
}

async function main() {
  await mkdir(DESTINO, { recursive: true });

  const origens = await localizarOrigens();
  const ausentes = SIGLAS.filter((s) => !origens.has(s));
  if (ausentes.length > 0) {
    throw new Error(
      `Sem imagem para: ${ausentes.join(", ")}\nProcurei em: ${ORIGENS.join(", ")}`,
    );
  }

  const resultados = [];
  for (const sigla of SIGLAS) {
    const { pasta, arquivo } = origens.get(sigla);
    const entrada = resolve(raiz, pasta, arquivo);
    const antes = await sharp(entrada).metadata();

    const buffer = await sharp(entrada)
      // Retira a moldura vazia do arquivo original; sem isso, uma margem larga
      // viraria escala menor para aquele logotipo.
      .trim()
      .resize(LARGURA, ALTURA, { fit: "contain", background: FUNDO })
      .flatten({ background: FUNDO })
      .webp({ quality: 90 })
      .toBuffer();

    await writeFile(resolve(DESTINO, `${sigla.toLowerCase()}.webp`), buffer);
    resultados.push({
      sigla,
      origem: `${pasta.replace("Fotografias/", "")}/${arquivo}`,
      de: `${antes.width}x${antes.height}`,
      kb: (buffer.length / 1024).toFixed(1),
    });
  }

  console.log(`Tela comum: ${LARGURA}x${ALTURA} (WebP, fundo branco)\n`);
  console.log(
    "sigla".padEnd(10) + "origem".padEnd(28) + "dimensões".padEnd(14) + "saída",
  );
  for (const r of resultados) {
    console.log(
      r.sigla.padEnd(10) + r.origem.padEnd(28) + r.de.padEnd(14) + `${r.kb} KB`,
    );
  }
  console.log(`\n${resultados.length} logotipos gravados em public/logos/`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
