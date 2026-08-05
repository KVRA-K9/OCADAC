"use client";

import * as React from "react";
import {
  Banknote,
  CheckCircle2,
  FileSignature,
  FileText,
  Info,
  PiggyBank,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CardsUnidade } from "@/components/dashboard/cards-unidade";
import { FiltersForm } from "@/components/dashboard/filters-form";
import {
  BudgetPieChart,
  AcoesClassificacaoDonut,
  BudgetStackedBar,
  CadeiaExecucaoChart,
  ExecucaoClassificacaoBar,
} from "@/components/dashboard/dynamic-charts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatMoeda,
  formatPercent,
  formatVariacao,
  formatVariacaoMoeda,
} from "@/lib/format";
import type { FiltrosOrcamento } from "@/lib/types";
import {
  OPCAO_TODOS,
  agregarPorFuncao,
  agregarPorUnidade,
  compararCategorias,
  contarAcoesPorSecretaria,
  filtrarOrcamento,
  orcamentoData,
  somaValores,
} from "@/data/base-ocad";

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
  const porUnidade = React.useMemo(
    () => agregarPorUnidade(filtrados),
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

  const semDados = filtrados.length === 0;

  /**
   * Quanto o orçamento atualizado se afastou do inicial — créditos adicionais
   * menos anulações. Um percentual "do inicial" esconderia o sentido do
   * movimento; a variação mostra se a dotação cresceu ou encolheu.
   */
  const variacaoAtualizado =
    totais.ocadInicial > 0
      ? (totais.ocadAtualizado - totais.ocadInicial) / totais.ocadInicial
      : null;
  const deltaAtualizado = totais.ocadAtualizado - totais.ocadInicial;

  /**
   * Percentual sobre o orçamento atualizado. Os estágios da despesa se medem
   * contra a dotação vigente, não contra a inicial — e cada card diz qual base
   * usou, para que nenhum percentual fique ambíguo.
   */
  const doAtualizado = (v: number) =>
    totais.ocadAtualizado > 0 ? formatPercent(v / totais.ocadAtualizado) : "—";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Visão Geral"
        descricao="Orçamento e execução da despesa para a Criança e o Adolescente no Estado do Acre, do valor inicial ao efetivamente pago."
      />

      <FiltersForm onApply={onApply} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          titulo="Orçamento Inicial"
          valor={semDados ? "—" : formatMoeda(totais.ocadInicial)}
          dica={semDados ? "Sem dados" : `${filtrados.length} ações`}
          icone={Wallet}
        />
        <KpiCard
          titulo="Orçamento Atualizado"
          valor={semDados ? "—" : formatMoeda(totais.ocadAtualizado)}
          dica={
            variacaoAtualizado === null
              ? "—"
              : `${formatVariacao(variacaoAtualizado)} sobre o inicial · ${formatVariacaoMoeda(deltaAtualizado)}`
          }
          icone={FileText}
        />
        <KpiCard
          titulo="Empenhado"
          valor={semDados ? "—" : formatMoeda(totais.ocadEmpenhado)}
          dica={`${doAtualizado(totais.ocadEmpenhado)} do atualizado`}
          icone={FileSignature}
        />
        <KpiCard
          titulo="Liquidado"
          valor={semDados ? "—" : formatMoeda(totais.ocadLiquidado)}
          dica={`${doAtualizado(totais.ocadLiquidado)} do atualizado`}
          icone={CheckCircle2}
        />
        <KpiCard
          titulo="Pago"
          valor={semDados ? "—" : formatMoeda(totais.ocadPago)}
          dica={`${doAtualizado(totais.ocadPago)} do atualizado`}
          icone={Banknote}
        />
        <KpiCard
          titulo="Disponível"
          valor={semDados ? "—" : formatMoeda(totais.ocadDisponivel)}
          dica={`${doAtualizado(totais.ocadDisponivel)} do atualizado — ainda não liquidado`}
          icone={PiggyBank}
        />
      </div>

      <Card className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
        <CardHeader>
          <CardTitle className="text-base">
            Cadeia de execução da despesa
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
              <TooltipContent className="max-w-[280px]">
                Do orçamento inicial ao valor efetivamente pago. Os percentuais
                são calculados sobre o orçamento atualizado.
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <CadeiaExecucaoChart totais={totais} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
          <CardHeader>
            <CardTitle className="text-base">
              Distribuição por Eixo Temático
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
                  Clique em uma fatia do gráfico para visualizar a quantidade de
                  ações por secretaria.
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
                compõem aquele intervalo de valor liquidado, dentro do eixo
                correspondente.
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ExecucaoClassificacaoBar data={filtrados} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Execução por unidade orçamentária
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Informação sobre os cards de unidade"
              >
                <Info className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              Mesmo recorte usado nos filtros do BI: um órgão aparece em mais de
              um card quando executa por fundos distintos. Clique sobre o card
              para obter as informações de orçamento e execução.
            </TooltipContent>
          </Tooltip>
        </div>
        <CardsUnidade data={porUnidade} />
      </div>
    </div>
  );
}
