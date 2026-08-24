/**
 * Créditos da equipe do OCAD.
 *
 * Ficam num módulo só porque aparecem em dois lugares que não se enxergam — o
 * rodapé da página inicial e o fim do PDF exportado. Duas listas paralelas
 * acabariam divergindo na primeira mudança de equipe.
 */

export interface Integrante {
  nome: string;
  cargo: string;
}

export const COORDENADOR: Integrante = {
  nome: "Denyscley Oliveira Bandeira",
  cargo: "Gestor de Políticas Públicas",
};

export const EQUIPE_TECNICA: Integrante[] = [
  { nome: "Ícaro Lebre Gundim", cargo: "Economista" },
  { nome: "Luísa Nascimento Ribeiro", cargo: "Economista" },
  { nome: "Roseneide Sena", cargo: "Especialista Executiva Administradora" },
  { nome: "Vinícius Carneiro de Farias", cargo: "Economista" },
];

const comCargo = (p: Integrante) => `${p.nome} (${p.cargo})`;

/** Os créditos em uma linha só, como saem no rodapé do site e no PDF. */
export const CREDITOS_EQUIPE =
  `Coordenador: ${comCargo(COORDENADOR)}; ` +
  `Equipe Técnica: ${EQUIPE_TECNICA.map(comCargo).join(", ")}.`;
