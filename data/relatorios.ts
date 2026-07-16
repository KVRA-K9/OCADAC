export interface RelatorioOcad {
  ano: number;
  titulo: string;
  url: string;
}

const BASE = "https://seplan.ac.gov.br/wp-content/uploads";

export const relatoriosOcad: RelatorioOcad[] = [
  {
    ano: 2026,
    titulo: "Relatório OCAD 2026",
    url: `${BASE}/2026/05/ROCA-2026-FINAL.pdf`,
  },
  {
    ano: 2025,
    titulo: "Relatório OCAD 2025",
    url: `${BASE}/2026/05/ROCA-2025-FINAL.pdf`,
  },
  {
    ano: 2024,
    titulo: "Relatório OCAD 2024",
    url: `${BASE}/2024/12/RELATORIO-OCAD-2024.pdf`,
  },
  {
    ano: 2023,
    titulo: "Relatório OCAD 2023",
    url: `${BASE}/2024/12/RELATORIO-OCAD-2023.pdf`,
  },
  {
    ano: 2022,
    titulo: "Relatório OCAD 2022",
    url: `${BASE}/2024/12/RELATORIO-OCAD-2022.pdf`,
  },
];

export const URL_LEI_OCAD = "https://legis.ac.gov.br/detalhar/4706";
export const URL_SEPLAN_OCAD =
  "https://seplan.ac.gov.br/planejamento-governamental/orcamentos-tematicos/orcamento-crianca-e-adolescente-ocad/";
