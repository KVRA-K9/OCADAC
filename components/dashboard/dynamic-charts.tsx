"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Carregando = () => <Skeleton className="h-full w-full" />;

export const BudgetBarChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BudgetBarChart),
  { ssr: false, loading: Carregando },
);

export const BudgetPieChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BudgetPieChart),
  { ssr: false, loading: Carregando },
);

export const BudgetLineChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BudgetLineChart),
  { ssr: false, loading: Carregando },
);

export const BudgetStackedBar = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BudgetStackedBar),
  { ssr: false, loading: Carregando },
);

export const ExecucaoClassificacaoBar = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.ExecucaoClassificacaoBar),
  { ssr: false, loading: Carregando },
);

export const AcoesClassificacaoBar = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.AcoesClassificacaoBar),
  { ssr: false, loading: Carregando },
);

export const AcoesClassificacaoDonut = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.AcoesClassificacaoDonut),
  { ssr: false, loading: Carregando },
);

export const BudgetTopLiquidado = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BudgetTopLiquidado),
  { ssr: false, loading: Carregando },
);
