/**
 * Leitura do texto das leis orçamentárias em PDF, com as duas manhas que os
 * arquivos da SEPLAN e do Diário Oficial exigem.
 *
 * 1. O modo `-table` do pdftotext, e não o `-layout`: no `-layout` os valores
 *    saem deslocados uma linha em relação à ação a que pertencem, e a soma sairia
 *    trocada sem dar sinal. O `-table` mantém cada ação e seus valores na mesma
 *    linha.
 *
 * 2. O caderno suplementar de 2014 (e outros da mesma prensa) usa fonte
 *    simbólica sem mapa para Unicode: o texto chega no uso privado, de U+F000 a
 *    U+F0FF, um a um sobre a tabela latin-1. Desfeito o deslocamento, o texto
 *    volta ao normal. Sem isso, 1.220 páginas de orçamento pareceriam imagem.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execArquivo = promisify(execFile);

const USO_PRIVADO = /[\uF000-\uF0FF]/g;

/** Devolve o caractere real quando ele veio no uso privado da fonte simbólica. */
function desfazerUsoPrivado(texto) {
  return texto.replace(USO_PRIVADO, (c) =>
    Buffer.from([c.codePointAt(0) - 0xf000]).toString("latin1"),
  );
}

/** Texto de um PDF inteiro, ou de uma faixa de páginas. */
export async function textoDoPDF(caminho, { de, ate } = {}) {
  const argumentos = ["-table", "-enc", "UTF-8"];
  if (de) argumentos.push("-f", String(de));
  if (ate) argumentos.push("-l", String(ate));
  const { stdout } = await execArquivo(
    "pdftotext",
    [...argumentos, caminho, "-"],
    { maxBuffer: 1024 * 1024 * 1024 },
  );
  return desfazerUsoPrivado(stdout);
}

/** Tira tabulações, quebras e espaços dobrados — o `-table` espalha espaços. */
export function limpar(valor) {
  return String(valor ?? "")
    .replace(/[\t\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** "1.062.040.379,36" → 1062040379.36. Vazio e traço viram zero. */
export function numeroBR(valor) {
  const limpo = String(valor ?? "")
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}
