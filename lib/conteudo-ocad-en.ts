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
    "The OCAD structure is based on the methodology applied by the Abrinq Foundation for the Rights of Children and Adolescents, which defines the main areas, goals and objectives that must be established to improve the lives of children and adolescents, in order to guarantee development in childhood, based on the precepts of the Federal Constitution of 1988 and on the United Nations (UN) International Convention on the Rights of the Child.",
  definicaoFonte: "State Secretariat of Planning of Acre (Seplan/AC)",
  definicaoDidatica:
    "The OCAD is a way of looking at the public budget through the lens of children and adolescents, examining how much of the State's money is actually being allocated to guaranteeing rights — and how much is reaching the end of the chain, at the front line of service delivery.",
  baseLegal:
    "The OCAD is legally grounded in Law No. 3,762, of July 19, 2021, which authorizes the Executive Branch to include the Child and Adolescent Budget (OCAD) assessment as an Annex to the State Budget, strengthening transparency, planning and monitoring of public policies aimed at childhood and adolescence.",
  baseLegalDidatica:
    "With the law, the OCAD ceased to be an isolated initiative and formally became part of the State budget. Every year, the assessment is published as an annex to the Annual Budget Law (LOA), which gives the monitoring legal existence and continuity.",
};

export const EIXOS_OCAD_EN: EixoOcad[] = [
  {
    titulo: "Education",
    descricao:
      "Guarantee of the right to learning and comprehensive development, with attention to early childhood and to staying in school.",
    abrange: ["Culture", "Sports", "Leisure"],
    icone: BookOpen,
    cor: "var(--chart-1)",
  },
  {
    titulo: "Health",
    descricao:
      "Comprehensive health care for children and adolescents, from pregnancy to youth, including dignified housing and sanitation conditions.",
    abrange: ["Housing", "Sanitation"],
    icone: HeartPulse,
    cor: "var(--chart-2)",
  },
  {
    titulo: "Social Assistance",
    descricao:
      "Social protection and guarantee of citizenship rights, focused on families and on groups in situations of vulnerability.",
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
      "Establishes comprehensive protection for children and adolescents in Chapter VII, Article 227 — absolute priority in their care.",
    url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
    externo: true,
  },
  {
    titulo: "UN Convention on the Rights of the Child",
    descricao:
      "International treaty ratified by Brazil that defines the fundamental rights of every child and adolescent.",
    url: "https://www.unicef.org/brazil/convencao-sobre-os-direitos-da-crianca",
    externo: true,
  },
  {
    titulo: "Decree No. 8,232, of March 4, 2021",
    descricao:
      "Establishes the Child and Adolescent Budget (OCAD) Assessment Committee within the scope of the State of Acre and makes other provisions.",
    url: "https://www.legis.ac.gov.br/detalhar/4376",
    externo: true,
  },
  {
    titulo: "Law No. 8,069, of July 13, 1990",
    descricao:
      "Provides for the Child and Adolescent Statute (ECA) and makes other provisions. (See Law No. 14,950, of 2024; See Law No. 15,243, of 2025.)",
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
    titulo: "Ten-Year State Plan for Socio-Educational Care of Acre",
    descricao:
      "State plan that structures and guides socio-educational care for adolescents in conflict with the law in the State of Acre.",
    url: "https://seplan.ac.gov.br/wp-content/uploads/2023/02/4.-PLANO-ESTADUAL-DECENAL-DE-ATENDIMENTO-SOCIOEDUCATIVO.pdf",
    externo: true,
  },
];
