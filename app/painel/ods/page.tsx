"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, BookOpen, HandHeart, HeartPulse, Search, Target } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  EIXOS_ODS_OCAD,
  ODS_IMAGEM,
  ODS_LISTA,
  type EixoOds,
  type IndicadorOds,
  type Ods,
  type StatusIndicador,
  filtraIndicadores,
} from "@/lib/ods-ocad";

const EIXO_OPCOES: Array<{ valor: EixoOds; rotulo: string; icone: typeof BookOpen }> = [
  { valor: "Educação", rotulo: "Educação", icone: BookOpen },
  { valor: "Saúde", rotulo: "Saúde", icone: HeartPulse },
  { valor: "Assistência Social", rotulo: "Assistência Social", icone: HandHeart },
];

const STATUS_ROTULO: Record<StatusIndicador, string> = {
  "Produzido": "Produzido",
  "Em análise/construção": "Em construção",
  "Sem dados": "Sem dados",
};

const STATUS_OPCOES: Array<{ valor: StatusIndicador; rotulo: string }> = [
  { valor: "Produzido", rotulo: "Produzido" },
  { valor: "Em análise/construção", rotulo: "Em construção" },
  { valor: "Sem dados", rotulo: "Sem dados" },
];

function StatusDot({ status }: { status: StatusIndicador }) {
  const cor =
    status === "Produzido"
      ? "bg-emerald-500"
      : status === "Em análise/construção"
        ? "bg-amber-500"
        : "bg-orange-500";
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", cor)}
      title={STATUS_ROTULO[status]}
      aria-label={STATUS_ROTULO[status]}
    />
  );
}

function IndicadorCard({ ind, eixosFiltro }: { ind: IndicadorOds; eixosFiltro: EixoOds[] }) {
  const eixosVisiveis =
    eixosFiltro.length === 0 ? ind.eixos : ind.eixos.filter((e) => eixosFiltro.includes(e));
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-2.5 ring-1 ring-foreground/5">
      <div className="flex items-start gap-1.5">
        <StatusDot status={ind.status} />
        <span className="text-xs font-semibold tabular-nums">{ind.codigo}</span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">{ind.descricao}</p>
      <div className="flex flex-wrap gap-1">
        {eixosVisiveis.map((eixo) => (
          <Badge
            key={eixo}
            variant="secondary"
            className="text-white"
            style={{ backgroundColor: EIXOS_ODS_OCAD[eixo] }}
          >
            {eixo}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function OdsColuna({ ods, eixosFiltro, onVoltar }: { ods: Ods; eixosFiltro: EixoOds[]; onVoltar?: () => void }) {
  const vazio = ods.indicadoresContemplados.length === 0;
  return (
    <div className="flex w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-400 flex-col gap-3 rounded-xl ring-1 ring-foreground/10">
      <div className="flex flex-col gap-2 rounded-t-xl bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={ODS_IMAGEM[ods.numero]}
              alt={`ODS ${ods.numero}`}
              width={500}
              height={350}
              unoptimized
              className="h-9 w-auto shrink-0 rounded-md object-contain"
            />
            <span className="text-sm font-semibold leading-tight">{ods.titulo}</span>
          </div>
          {onVoltar && (
            <Button variant="ghost" size="sm" onClick={onVoltar} className="shrink-0">
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          )}
        </div>
        <span className="line-clamp-2 text-xs text-muted-foreground">{ods.descricaoCurta}</span>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-2 p-3 pt-0 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        {vazio && (
          <p className="col-span-full px-1 py-6 text-center text-xs text-muted-foreground">
            Nenhum indicador contemplado neste ODS pelo escopo do OCAD.
          </p>
        )}
        {ods.indicadoresContemplados.map((ind) => (
          <IndicadorCard key={ind.codigo} ind={ind} eixosFiltro={eixosFiltro} />
        ))}
      </div>
    </div>
  );
}

export default function OdsPage() {
  const [eixosFiltro, setEixosFiltro] = React.useState<EixoOds[]>([]);
  const [statusFiltro, setStatusFiltro] = React.useState<StatusIndicador[]>([]);
  const [busca, setBusca] = React.useState("");
  const [odsSelecionado, setOdsSelecionado] = React.useState<number | null>(null);

  const toggleEixo = React.useCallback((valor: EixoOds) => {
    setEixosFiltro((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor],
    );
  }, []);

  const toggleStatus = React.useCallback((valor: StatusIndicador) => {
    setStatusFiltro((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor],
    );
  }, []);

  const lista = React.useMemo(
    () => filtraIndicadores({ eixos: eixosFiltro, status: statusFiltro, busca }),
    [eixosFiltro, statusFiltro, busca],
  );

  const totalIndicadores = React.useMemo(
    () => lista.reduce((acc, o) => acc + o.indicadoresContemplados.length, 0),
    [lista],
  );
  const odsComIndicadores = React.useMemo(
    () => lista.filter((o) => o.indicadoresContemplados.length > 0).length,
    [lista],
  );
  const contagemPorEixo = React.useMemo(() => {
    const contagem: Record<EixoOds, number> = {
      "Educação": 0,
      "Saúde": 0,
      "Assistência Social": 0,
    };
    for (const ods of lista) {
      for (const ind of ods.indicadoresContemplados) {
        for (const eixo of ind.eixos) {
          contagem[eixo]++;
        }
      }
    }
    return contagem;
  }, [lista]);
  const multiEixo = React.useMemo(
    () =>
      lista.reduce(
        (acc, o) =>
          acc +
          o.indicadoresContemplados.filter((i) => i.eixos.length > 1).length,
        0,
      ),
    [lista],
  );

  const odsAtual = React.useMemo(
    () => lista.find((o) => o.numero === odsSelecionado) ?? null,
    [lista, odsSelecionado],
  );

  const toggleOds = React.useCallback((numero: number) => {
    setOdsSelecionado((prev) => (prev === numero ? null : numero));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Objetivos de Desenvolvimento Sustentável — ODS"
        descricao="Indicadores dos 18 ODS contemplados pelos eixos do Orçamento Criança e Adolescente (OCAD): Educação, Saúde e Assistência Social."
        className="bg-sidebar text-sidebar-foreground ring-transparent"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Indicadores contemplados"
          valor={String(totalIndicadores)}
          dica="Total de indicadores nos 18 ODS"
          icone={Target}
          className="border-transparent bg-[linear-gradient(135deg,#da1a29_0%,#e3536c_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo="ODS contemplados"
          valor={`${odsComIndicadores}/18`}
          dica="ODS com ao menos um indicador contemplado pelo OCAD"
          icone={BookOpen}
          className="border-transparent bg-[linear-gradient(135deg,#fcd036_0%,#f1731f_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo="Contemplação por eixo"
          valor={
            <div>
              {EIXO_OPCOES.map(({ valor: eixo, rotulo }, i) => (
                <React.Fragment key={eixo}>
                  {i > 0 && <span aria-hidden className="text-white/40">·</span>}
                  <span>
                    <span className="text-white">{rotulo}</span>
                    <span>{contagemPorEixo[eixo]}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          }
          dica="Indicadores contemplados por eixo"
          icone={HeartPulse}
          className="border-transparent bg-[linear-gradient(135deg,#cae081_0%,#b3c8a7_55%,#a9ccb9_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo="Indicadores transversais"
          valor={String(multiEixo)}
          dica="Indicadores contemplados por mais de um eixo"
          icone={HandHeart}
          className="border-transparent bg-[linear-gradient(135deg,#afab50_0%,#89373d_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Eixo:</span>
            <button
              type="button"
              onClick={() => setEixosFiltro([])}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                eixosFiltro.length === 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              Todos
            </button>
            {EIXO_OPCOES.map(({ valor, rotulo, icone: Icone }) => {
              const ativo = eixosFiltro.includes(valor);
              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => toggleEixo(valor)}
                  aria-pressed={ativo}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    ativo
                      ? "border-transparent text-white"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                  style={
                    ativo
                      ? { backgroundColor: EIXOS_ODS_OCAD[valor] }
                      : undefined
                  }
                >
                  <Icone className="size-3" />
                  {rotulo}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <button
              type="button"
              onClick={() => setStatusFiltro([])}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFiltro.length === 0
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              Todos
            </button>
            {STATUS_OPCOES.map(({ valor, rotulo }) => {
              const ativo = statusFiltro.includes(valor);
              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => toggleStatus(valor)}
                  aria-pressed={ativo}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    ativo
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <StatusDot status={valor} />
                  {rotulo}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código, descrição ou ODS..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 xl:grid-cols-[repeat(18,minmax(0,1fr))]">
          {ODS_LISTA.map((ods, index) => {
            const selecionado = odsSelecionado === ods.numero;
            return (
              <button
                key={ods.numero}
                type="button"
                onClick={() => toggleOds(ods.numero)}
                aria-label={`ODS ${ods.numero} — ${ods.titulo}`}
                aria-pressed={selecionado}
                style={{ animationDelay: `${index * 40}ms`, animationFillMode: "backwards" }}
                className={cn(
                  "relative overflow-hidden rounded-lg bg-muted/30 ring-2 transition-all duration-200 animate-in fade-in-0 zoom-in-95 duration-300",
                  selecionado
                    ? "ring-primary scale-105"
                    : "ring-transparent hover:ring-foreground/20 hover:scale-105",
                )}
              >
                <Image
                  src={ODS_IMAGEM[ods.numero]}
                  alt={`ODS ${ods.numero} — ${ods.titulo}`}
                  width={500}
                  height={350}
                  unoptimized
                  className="h-auto w-full object-contain"
                />
              </button>
            );
          })}
        </div>

      {odsAtual && <OdsColuna ods={odsAtual} eixosFiltro={eixosFiltro} onVoltar={() => setOdsSelecionado(null)} />}

      {!odsSelecionado && (
        <p className="text-center text-sm text-muted-foreground">
          Clique em um ODS acima para visualizar seus indicadores contemplados.
        </p>
      )}
    </div>
  );
}