/**
 * Cor de cada tipo de norma na linha do tempo.
 *
 * São os mesmos seis tokens de `--chart-*` que os gráficos e os cards usam —
 * seis tipos, seis tokens, nenhuma cor nova entrando no sistema. Fica separado
 * de `lib/estagios.ts` porque nada aqui tem a ver com estágio da despesa.
 */

import {
  Building2,
  Landmark,
  ListChecks,
  Map,
  Scale,
  Stamp,
  type LucideIcon,
} from "lucide-react";

import type { TipoNorma } from "@/data/historico-leis";

export const CORES_NORMA: Record<TipoNorma, string> = {
  "Lei Ordinária": "var(--chart-5)",
  Decreto: "var(--chart-6)",
  "Estrutura Administrativa": "var(--chart-3)",
  PPA: "var(--chart-4)",
  /* O único que não entra cru: `--chart-1` é o mais claro dos seis
   * (oklch L 0.89) e, lavado no `--card`, o botão e os cartões da LDO ficavam
   * quase brancos. Aqui ele desce um degrau de luminosidade e mantém croma e
   * matiz — continua sendo a cor do token, só que mais firme, e acompanha
   * qualquer mudança futura em `--chart-1`. */
  LDO: "oklch(from var(--chart-1) calc(l - 0.08) c h)",
  LOA: "var(--chart-2)",
};

/** Ícone de cada tipo, para os nós do caminho e as fichas das normas. */
export const ICONES_NORMA: Record<TipoNorma, LucideIcon> = {
  "Lei Ordinária": Scale,
  Decreto: Stamp,
  "Estrutura Administrativa": Building2,
  PPA: Map,
  LDO: ListChecks,
  LOA: Landmark,
};

/** Uma linha sobre o que cada tipo é, para a legenda dos filtros. */
export const DESCRICOES_NORMA: Record<TipoNorma, string> = {
  "Lei Ordinária": "Leis com dispositivos para criança e adolescente.",
  Decreto: "Decretos do Executivo, inclusive os do comitê do OCAD.",
  "Estrutura Administrativa":
    "Leis que criaram ou alteraram os órgãos da política.",
  PPA: "Planos plurianuais e suas citações a criança e adolescente.",
  LDO: "Diretrizes orçamentárias, com metas e prioridades do exercício.",
  LOA: "Leis orçamentárias anuais e o OCAD apurado em cada uma.",
};
