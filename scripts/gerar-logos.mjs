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
 *   3. saída em WebP sobre fundo branco, que é o das ilustrações recebidas.
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

/**
 * Tela comum. A proporção acompanha a da caixa do card, para que a plaquinha
 * de todos os logotipos a preencha por inteiro — é isso que faz os cards
 * parecerem padronizados.
 */
const LARGURA = 720;
const ALTURA = 280;

/** Área segura dentro da tela, como fração dela. */
const MARGEM_X = 0.92;
const MARGEM_Y = 0.88;

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

/**
 * Logotipos de unidade, para quando o fundo tem arte própria em vez de herdar
 * a da secretaria. A chave vira o nome do arquivo: `717-212.webp` para a
 * unidade `717/212`.
 */
const LOGOS_UNIDADE = {
  "717-212": "ieptec_logo_transparente",
  "719-213": "ise_logo_linha_unica_transparente",
  "721-302": "FUNDHACRE",
};

const EXTENSOES = /\.(png|jpe?g|webp|svg)$/i;

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

/**
 * Recorta a imagem na caixa da arte, ignorando o espaço vazio em volta.
 *
 * O `trim` do sharp não serve aqui: ele só corta quando encontra uma borda
 * uniforme nos quatro lados, e nestes logotipos a arte encosta nas laterais —
 * então ele devolvia a imagem intacta, com faixas vazias em cima e embaixo que
 * depois viravam escala menor no card.
 */
async function recortarNaArte(caminho) {
  const { data, info } = await sharp(caminho)
    .flatten({ background: FUNDO })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let maxX = -1;
  let minY = info.height;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      // Tolerância alta o bastante para ignorar o ruído do branco de fundo
      // (245–255) sem descartar tons claros da própria arte.
      if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return { left: 0, top: 0, width: info.width, height: info.height };

  // Uma folga pequena evita que a arte fique colada na borda do card.
  const folga = Math.round(Math.max(info.width, info.height) * 0.02);
  const left = Math.max(0, minX - folga);
  const top = Math.max(0, minY - folga);
  return {
    left,
    top,
    width: Math.min(info.width - left, maxX - minX + 1 + folga * 2),
    height: Math.min(info.height - top, maxY - minY + 1 + folga * 2),
  };
}

/** Acha o arquivo de um nome-base, na ordem das pastas de origem. */
async function localizarPorNome(nomeBase) {
  for (const pasta of ORIGENS) {
    let arquivos = [];
    try {
      arquivos = await readdir(resolve(raiz, pasta));
    } catch {
      continue;
    }
    const arquivo = arquivos.find(
      (a) => EXTENSOES.test(a) && a.replace(EXTENSOES, "") === nomeBase,
    );
    if (arquivo) return { pasta, arquivo };
  }
  return null;
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

  // Um alvo por arquivo de saída: as secretarias e, depois, as unidades com
  // arte própria.
  const alvos = SIGLAS.map((sigla) => ({
    saida: sigla.toLowerCase(),
    rotulo: sigla,
    ...origens.get(sigla),
  }));

  for (const [chave, nomeBase] of Object.entries(LOGOS_UNIDADE)) {
    const achado = await localizarPorNome(nomeBase);
    if (!achado) {
      throw new Error(
        `Sem imagem para a unidade ${chave} (${nomeBase})\nProcurei em: ${ORIGENS.join(", ")}`,
      );
    }
    alvos.push({ saida: chave, rotulo: chave, ...achado });
  }

  // Primeira passada: recortar a arte de cada logotipo e medir sua proporção.
  const medidos = [];
  for (const alvo of alvos) {
    const entrada = resolve(raiz, alvo.pasta, alvo.arquivo);
    const corte = await recortarNaArte(entrada);
    medidos.push({ ...alvo, entrada, corte, ratio: corte.width / corte.height });
  }

  /*
   * Área comum da arte, e não caixa comum.
   *
   * Encaixar cada arte na mesma caixa deixa uma tarja larga com o texto muito
   * menor que o de uma ilustração quadrada, porque a largura se esgota antes
   * da altura. Igualando a ÁREA que a arte ocupa, todas ficam com o mesmo peso
   * visual — a tarja fica comprida e baixa, a ilustração curta e alta, mas
   * ambas com a mesma quantidade de tinta.
   *
   * O teto é o da arte mais alongada, que é quem primeiro encosta na margem.
   */
  const limiteX = LARGURA * MARGEM_X;
  const limiteY = ALTURA * MARGEM_Y;
  const areaComum = Math.min(
    ...medidos.map((m) =>
      Math.min((limiteX * limiteX) / m.ratio, limiteY * limiteY * m.ratio),
    ),
  );

  const resultados = [];
  for (const { saida, rotulo, pasta, arquivo, entrada, corte, ratio } of medidos) {
    const antes = await sharp(entrada).metadata();

    const alvoAltura = Math.round(Math.sqrt(areaComum / ratio));
    const alvoLargura = Math.round(alvoAltura * ratio);

    const arte = await sharp(entrada)
      .flatten({ background: FUNDO })
      .extract(corte)
      .resize(alvoLargura, alvoAltura, { fit: "fill" })
      .toBuffer({ resolveWithObject: true });

    // Centralizada na tela comum: todas as saídas ficam do mesmo tamanho.
    const sobra = {
      left: Math.floor((LARGURA - arte.info.width) / 2),
      top: Math.floor((ALTURA - arte.info.height) / 2),
    };
    const buffer = await sharp(arte.data)
      .extend({
        left: sobra.left,
        right: LARGURA - arte.info.width - sobra.left,
        top: sobra.top,
        bottom: ALTURA - arte.info.height - sobra.top,
        background: FUNDO,
      })
      .webp({ quality: 90 })
      .toBuffer();

    await writeFile(resolve(DESTINO, `${saida}.webp`), buffer);
    resultados.push({
      sigla: rotulo,
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
