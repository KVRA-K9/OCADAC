/**
 * Texto sem acento e em minúsculas, para busca.
 *
 * Os nomes das fontes vêm em caixa alta e acentuados na planilha ("OPERAÇÕES DE
 * CRÉDITO"). Sem normalizar, quem digita "credito" não acha nada — e ninguém
 * digita acento numa caixa de busca.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
