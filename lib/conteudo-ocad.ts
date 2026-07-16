import {
  BookOpen,
  HeartPulse,
  HandHeart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CONTEUDO_OCAD = {
  definicao:
    "A estrutura do OCAD é baseada na metodologia aplicada pela Fundação Abrinq pelos Direitos da Criança e do Adolescente, que define as principais áreas, metas e objetivos que devem ser estabelecidos para melhorar a vida das crianças e adolescentes, a fim de garantir o desenvolvimento na infância, com base nos preceitos da Constituição Federal de 1988 e na Convenção Internacional dos Direitos da Criança da Organização das Nações Unidas (ONU).",
  definicaoFonte: "Secretaria de Estado de Planejamento do Acre (Seplan/AC)",
  definicaoDidatica:
    "O OCAD é uma forma de olhar o orçamento público sob a ótica da criança e do adolescente, averiguando quanto do dinheiro do Estado está efetivamente sendo destinado a garantir direitos — e quanto está chegando ao fim da cadeia, na ponta do atendimento.",
  baseLegal:
    "O OCAD encontra respaldo legal na Lei nº 3.762, de 19 de julho de 2021, que autoriza o Poder Executivo a incluir a apuração do Orçamento Criança e Adolescente (OCAD) como Anexo ao Orçamento do Estado, fortalecendo a transparência, o planejamento e o monitoramento das políticas públicas voltadas à infância e à adolescência.",
  baseLegalDidatica:
    "Com a lei, o OCAD deixou de ser uma iniciativa isolada e passou a integrar formalmente o orçamento do Estado. A cada ano, a apuração é publicada como anexo da Lei Orçamentária Anual (LOA), o que dá Existência jurídica e continuidade ao monitoramento.",
} as const;

export interface EixoOcad {
  titulo: string;
  descricao: string;
  abrange: string[];
  icone: LucideIcon;
  cor: string;
}

export const EIXOS_OCAD: EixoOcad[] = [
  {
    titulo: "Educação",
    descricao:
      "Garantia do direito à aprendizagem e ao desenvolvimento integral, com atenção à primeira infância e à permanência na escola.",
    abrange: ["Cultura", "Desporto", "Lazer"],
    icone: BookOpen,
    cor: "var(--chart-1)",
  },
  {
    titulo: "Saúde",
    descricao:
      "Atenção integral à saúde da criança e do adolescente, da gestação à juventude, incluindo condições dignas de moradia e saneamento.",
    abrange: ["Habitação", "Saneamento"],
    icone: HeartPulse,
    cor: "var(--chart-2)",
  },
  {
    titulo: "Assistência Social",
    descricao:
      "Proteção social e garantia dos direitos da cidadania, com foco nas famílias e nos grupos em situação de vulnerabilidade.",
    abrange: ["Direitos da cidadania"],
    icone: HandHeart,
    cor: "var(--chart-3)",
  },
];

export interface BaseLegalItem {
  titulo: string;
  descricao: string;
  url?: string;
  externo: boolean;
}

export const BASES_LEGAIS: BaseLegalItem[] = [
  {
    titulo: "Lei nº 3.762/2021",
    descricao:
      "Autoriza o Poder Executivo a incluir a apuração do OCAD como Anexo ao Orçamento do Estado do Acre.",
    url: "https://legis.ac.gov.br/detalhar/4706",
    externo: true,
  },
  {
    titulo: "Constituição Federal de 1988",
    descricao:
      "Estabelece a proteção integral à criança e ao adolescente no capítulo VII, Art. 227 — absoluta prioridade no atendimento.",
    url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
    externo: true,
  },
  {
    titulo: "Convenção ONU dos Direitos da Criança",
    descricao:
      "Tratado internacional ratificado pelo Brasil que define os direitos fundamentais de toda criança e adolescente.",
    url: "https://www.unicef.org/brazil/convencao-sobre-os-direitos-da-crianca",
    externo: true,
  },
  {
    titulo: "Decreto nº 8.232, de 04 de março de 2021",
    descricao:
      "Institui o Comitê de Apuração do Orçamento Criança e Adolescente — OCAD no âmbito do Estado do Acre e dá outras providências.",
    url: "https://www.legis.ac.gov.br/detalhar/4376",
    externo: true,
  },
  {
    titulo: "Lei nº 8.069, de 13 de julho de 1990",
    descricao:
      "Dispõe sobre o Estatuto da Criança e do Adolescente e dá outras providências. (Vide Lei nº 14.950, de 2024; Vide Lei nº 15.243, de 2025.)",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm",
    externo: true,
  },
  {
    titulo: "Plano Estadual Decenal dos Direitos Humanos de Crianças e Adolescentes — Acre: 2021-2030",
    descricao:
      "Plano estadual que orienta a implementação de políticas públicas voltadas à garantia dos direitos humanos de crianças e adolescentes no Acre.",
    url: "https://seplan.ac.gov.br/wp-content/uploads/2023/02/5.-PLANO-ESTADUAL-DECENAL-DA-CRIANCA-E-ADOLESCENTE.pdf",
    externo: true,
  },
  {
    titulo: "Plano Estadual Decenal de Atendimento Socioeducativo do Acre",
    descricao:
      "Plano estadual que estrutura e orienta o atendimento socioeducativo a adolescentes em conflito com a lei no âmbito do Acre.",
    url: "https://seplan.ac.gov.br/wp-content/uploads/2023/02/4.-PLANO-ESTADUAL-DECENAL-DE-ATENDIMENTO-SOCIOEDUCATIVO.pdf",
    externo: true,
  },
];
