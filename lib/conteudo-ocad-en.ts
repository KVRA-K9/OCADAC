import {
  BookOpen,
  HeartPulse,
  HandHeart,
} from "lucide-react";

import type { BaseLegalItem, EixoOcad } from "./conteudo-ocad";
import type { CONTEUDO_OCAD } from "./conteudo-ocad";

export const CONTEUDO_OCAD_EN: Record<
  keyof typeof CONTEUDO_OCAD,
  string
> = {
  definicao:
    "The OCAD framework is based on the methodology developed by the Abrinq Foundation for the Rights of Children and Adolescents, which defines the key areas, targets, and goals that must be established to improve the lives of children and adolescents and guarantee early childhood development, grounded in the precepts of the Federal Constitution of 1988 and the United Nations (UN) Convention on the Rights of the Child.",
  definicaoFonte: "State Secretariat of Planning of Acre (SEPLAN/AC)",
  definicaoDidatica:
    "The OCAD examines the public budget through the lens of children and adolescents, analyzing how much public funding is actually allocated to safeguarding their rights — and how much directly reaches front-line public service delivery.",
  baseLegal:
    "The OCAD is legally grounded in Law No. 3,762, of July 19, 2021, which authorizes the Executive Branch to include the Child and Adolescent Budget (OCAD) assessment as an Annex to the State Budget, strengthening transparency, planning, and monitoring of public policies dedicated to childhood and adolescence.",
  baseLegalDidatica:
    "With this law, the OCAD transitioned from an isolated initiative to an integral part of the State budget. Each year, the assessment is published as an annex to the Annual Budget Law (LOA), giving the monitoring framework legal standing and institutional continuity.",
};

export const EIXOS_OCAD_EN: EixoOcad[] = [
  {
    titulo: "Education",
    descricao:
      "Guaranteeing the right to learning and comprehensive development, with dedicated focus on early childhood and school retention.",
    abrange: ["Culture", "Sports", "Leisure"],
    icone: BookOpen,
    cor: "var(--chart-1)",
  },
  {
    titulo: "Health",
    descricao:
      "Comprehensive healthcare for children and adolescents from prenatal care through youth, including adequate housing and basic sanitation conditions.",
    abrange: ["Housing", "Sanitation"],
    icone: HeartPulse,
    cor: "var(--chart-2)",
  },
  {
    titulo: "Social Assistance",
    descricao:
      "Social protection and guarantee of citizenship rights, focused on vulnerable families and groups at risk.",
    abrange: ["Citizenship rights"],
    icone: HandHeart,
    cor: "var(--chart-3)",
  },
];

export const BASES_LEGAIS_EN: BaseLegalItem[] = [
  {
    titulo: "Law No. 3,762/2021",
    descricao:
      "Authorizes the Executive Branch to include the OCAD assessment as an Annex to the Budget of the State of Acre.",
    url: "https://legis.ac.gov.br/detalhar/4706",
    externo: true,
  },
  {
    titulo: "Federal Constitution of 1988",
    descricao:
      "Establishes comprehensive protection for children and adolescents in Chapter VII, Article 227 — absolute priority in public care.",
    url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
    externo: true,
  },
  {
    titulo: "UN Convention on the Rights of the Child",
    descricao:
      "International human rights treaty ratified by Brazil that defines the fundamental rights of every child and adolescent.",
    url: "https://www.unicef.org/brazil/convencao-sobre-os-direitos-da-crianca",
    externo: true,
  },
  {
    titulo: "Decree No. 8,232, of March 4, 2021",
    descricao:
      "Establishes the Child and Adolescent Budget (OCAD) Assessment Committee within the State of Acre and establishes other provisions.",
    url: "https://www.legis.ac.gov.br/detalhar/4376",
    externo: true,
  },
  {
    titulo: "Law No. 8,069, of July 13, 1990",
    descricao:
      "Enacts the Child and Adolescent Statute (ECA) and establishes other provisions. (See Law No. 14,950, of 2024; See Law No. 15,243, of 2025.)",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
    externo: true,
  },
  {
    titulo:
      "Ten-Year State Plan for the Human Rights of Children and Adolescents — Acre: 2021-2030",
    descricao:
      "State plan that guides the implementation of public policies aimed at guaranteeing the human rights of children and adolescents in Acre.",
    url: "https://seplan.ac.gov.br/wp-content/uploads/2023/02/5.-PLANO-ESTADUAL-DECENAL-DA-CRIANCA-E-ADOLESCENTE.pdf",
    externo: true,
  },
  {
    titulo: "Ten-Year State Plan for Socio-Educational Measures of Acre",
    descricao:
      "State plan that structures and guides socio-educational measures for adolescents in conflict with the law in the State of Acre.",
    url: "https://seplan.ac.gov.br/wp-content/uploads/2023/02/4.-PLANO-ESTADUAL-DECENAL-DE-ATENDIMENTO-SOCIOEDUCATIVO.pdf",
    externo: true,
  },
];
