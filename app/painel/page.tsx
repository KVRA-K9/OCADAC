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
import { useFormat, useT } from "@/lib/i18n";
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
  const t = useT();
  const {
    formatMoeda,
    formatPercent,
    formatVariacao,
    formatVariacaoMoeda,
  } = useFormat();

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
        titulo={t.painel.titulo}
        descricao={t.painel.descricao}
      />

      <FiltersForm onApply={onApply} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          titulo={t.painel.orcamentoInicial}
          valor={semDados ? "—" : formatMoeda(totais.ocadInicial)}
          dica={semDados ? t.common.semDados : t.painel.acoes(filtrados.length)}
          icone={Wallet}
        />
        <KpiCard
          titulo={t.painel.orcamentoAtualizado}
          valor={semDados ? "—" : formatMoeda(totais.ocadAtualizado)}
          dica={
            variacaoAtualizado === null
              ? "—"
              : t.painel.variacaoSobreInicial(
                  formatVariacao(variacaoAtualizado),
                  formatVariacaoMoeda(deltaAtualizado),
                )
          }
          icone={FileText}
        />
        <KpiCard
          titulo={t.painel.empenhado}
          valor={semDados ? "—" : formatMoeda(totais.ocadEmpenhado)}
          dica={t.painel.pctDoAtualizado(doAtualizado(totais.ocadEmpenhado))}
          icone={FileSignature}
        />
        <KpiCard
          titulo={t.painel.liquidado}
          valor={semDados ? "—" : formatMoeda(totais.ocadLiquidado)}
          dica={t.painel.pctDoAtualizado(doAtualizado(totais.ocadLiquidado))}
          icone={CheckCircle2}
        />
        <KpiCard
          titulo={t.painel.pago}
          valor={semDados ? "—" : formatMoeda(totais.ocadPago)}
          dica={t.painel.pctDoAtualizado(doAtualizado(totais.ocadPago))}
          icone={Banknote}
        />
        <KpiCard
          titulo={t.painel.disponivel}
          valor={semDados ? "—" : formatMoeda(totais.ocadDisponivel)}
          dica={t.painel.pctDoAtualizadoNaoLiquidado(
            doAtualizado(totais.ocadDisponivel),
          )}
          icone={PiggyBank}
        />
      </div>

      <Card className="transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
        <CardHeader>
          <CardTitle className="text-base">
            {t.painel.cadeiaExecucaoTitulo}
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t.painel.infoGrafico}
                >
                  <Info className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                {t.painel.cadeiaExecucaoDica}
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
              {t.painel.distribuicaoEixoTitulo}
            </CardTitle>
            <CardAction>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t.painel.infoGrafico}
                  >
                    <Info className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px]">
                  {t.painel.distribuicaoEixoDica}
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
              {t.painel.composicaoOcadTitulo}
            </CardTitle>
            <CardAction>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t.painel.infoGrafico}
                  >
                    <Info className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px]">
                  {t.painel.composicaoOcadDica}
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
            {t.painel.exclusivoPorEixoTitulo}
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
            {t.painel.execucaoEixoTitulo}
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={t.painel.infoGrafico}
                >
                  <Info className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px]">
                {t.painel.execucaoEixoDica}
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
            {t.painel.execucaoUnidadeTitulo}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t.painel.infoCardsUnidade}
              >
                <Info className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              {t.painel.execucaoUnidadeDica}
            </TooltipContent>
          </Tooltip>
        </div>
        <CardsUnidade data={porUnidade} />
      </div>
    </div>
  );
}
