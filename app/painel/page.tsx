"use client";

import * as React from "react";
import { Banknote, CheckCircle2, FileText, Info, Wallet } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FiltersForm } from "@/components/dashboard/filters-form";
import {
  BudgetBarChart,
  BudgetPieChart,
  AcoesClassificacaoDonut,
  BudgetStackedBar,
  ExecucaoClassificacaoBar,
} from "@/components/dashboard/dynamic-charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMoeda, formatPercent } from "@/lib/format";
import type { FiltrosOrcamento } from "@/lib/types";
import {
  OPCAO_TODOS,
  agregarPorFuncao,
  agregarPorOrgao,
  compararCategorias,
  contarAcoesPorSecretaria,
  filtrarOrcamento,
  orcamentoData,
  somaValores,
} from "@/data/placeholder";

export default function VisaoGeralPage() {
  const [filtros, setFiltros] = React.useState<FiltrosOrcamento>({
    ano: OPCAO_TODOS,
    funcao: [],
    categoriaEconomica: OPCAO_TODOS,
    secretaria: [],
  });

  const onApply = React.useCallback((f: FiltrosOrcamento) => setFiltros(f), []);

  const filtrados = React.useMemo(
    () => filtrarOrcamento(orcamentoData, filtros),
    [filtros],
  );

  const totais = React.useMemo(() => somaValores(filtrados), [filtrados]);
  const porOrgao = React.useMemo(
    () => agregarPorOrgao(filtrados),
    [filtrados],
  );
  const porFuncao = React.useMemo(
    () => agregarPorFuncao(filtrados),
    [filtrados],
  );
  const porAcaoSecretaria = React.useMemo(
    () => contarAcoesPorSecretaria(filtrados),
    [filtrados],
  );
  const comparacao = React.useMemo(
    () => compararCategorias(filtrados),
    [filtrados],
  );

  const ratio = (v: number) =>
    totais.previsto > 0 ? formatPercent(v / totais.previsto) : "—";

  const semDados = filtrados.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Visão Geral"
        descricao="Síntese do orçamento previsto, empenhado, liquidado e pago para a Criança e o Adolescente no Estado do Acre."
      />

      <FiltersForm onApply={onApply} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Orçamento Inicial"
          valor={semDados ? "—" : formatMoeda(totais.previsto)}
          dica={semDados ? "Sem dados" : `${filtrados.length} ações`}
          icone={Wallet}
        />
        <KpiCard
          titulo="Orçamento Atualizado"
          valor={semDados ? "—" : formatMoeda(totais.empenhado)}
          dica={`${ratio(totais.empenhado)} do planejado`}
          icone={FileText}
        />
        <KpiCard
          titulo="Liquidado"
          valor={semDados ? "—" : formatMoeda(totais.liquidado)}
          dica={`${ratio(totais.liquidado)} do planejado`}
          icone={CheckCircle2}
        />
        <KpiCard
          titulo="Disponível"
          valor={semDados ? "—" : formatMoeda(totais.pago)}
          dica={`${ratio(totais.pago)} do planejado (execução)`}
          icone={Banknote}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
          <CardHeader>
            <CardTitle className="text-base">Orçamento Atualizado x Liquidado por órgão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[640px] w-full overflow-y-auto">
              <div style={{ height: `${Math.max(560, porOrgao.length * 70)}px` }} className="w-full">
                <BudgetBarChart data={porOrgao} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Eixo Temático</CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Informação sobre o gráfico"
                    >
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px]">
                    Valores baseados no Orçamento Inicial previsto para o
                    exercício, distribuídos pelos eixos temáticos.
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center">
              <div className="h-[300px] w-full">
                <BudgetPieChart data={porFuncao} />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-1 flex-col transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
            <CardHeader>
              <CardTitle className="text-base">
                Composição do Orçamento Criança e Adolescente - OCAD
              </CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Informação sobre o gráfico"
                    >
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px]">
                    Clique em uma fatia do gráfico para visualizar a quantidade
                    de ações por secretaria.
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-1 min-h-0 items-center justify-center">
              <div className="h-full w-full">
                <AcoesClassificacaoDonut data={porAcaoSecretaria} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
        <CardHeader>
          <CardTitle className="text-base">
            Exclusivo x Não Exclusivo por eixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <BudgetStackedBar data={comparacao} />
          </div>
        </CardContent>
      </Card>

      <Card className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
        <CardHeader>
          <CardTitle className="text-base">
            Execução por eixo × classificação
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Informação sobre o gráfico"
                >
                  <Info className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px]">
                Clique em uma barra para ver o detalhamento das ações que
                compõem aquele intervalo de valor liquidado, dentro do
                eixo correspondente.
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ExecucaoClassificacaoBar data={filtrados} />
        </CardContent>
      </Card>
    </div>
  );
}
