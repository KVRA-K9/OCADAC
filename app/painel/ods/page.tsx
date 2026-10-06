"use client";

import * as React from "react";
import Image from "next/image";
import { BookOpen, HandHeart, HeartPulse, Search, Target, X } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import {
  EIXOS_ODS_OCAD,
  ODS_IMAGEM,
  getOds,
  type EixoOds,
  type IndicadorOds,
  type Ods,
  type StatusIndicador,
} from "@/lib/ods-ocad";

const EIXO_OPCOES: Array<{ valor: EixoOds; icone: typeof BookOpen }> = [
  { valor: "Educação", icone: BookOpen },
  { valor: "Saúde", icone: HeartPulse },
  { valor: "Assistência Social", icone: HandHeart },
];

const STATUS_OPCOES: StatusIndicador[] = [
  "Produzido",
  "Em análise/construção",
  "Sem dados",
];

function StatusDot({ status }: { status: StatusIndicador }) {
  const t = useT();
  const cor =
    status === "Produzido"
      ? "bg-emerald-500"
      : status === "Em análise/construção"
        ? "bg-amber-500"
        : "bg-orange-500";
  const rotulo = t.common.statusOdsRotulo(status);
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", cor)}
      title={rotulo}
      aria-label={rotulo}
    />
  );
}

function IndicadorCard({ ind, eixosFiltro }: { ind: IndicadorOds; eixosFiltro: EixoOds[] }) {
  const t = useT();
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
            {t.common.eixoRotulo(eixo)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function OdsColuna({ ods, eixosFiltro, onRemover }: { ods: Ods; eixosFiltro: EixoOds[]; onRemover?: () => void }) {
  const t = useT();
  const vazio = ods.indicadoresContemplados.length === 0;
  return (
    <div className="flex w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-400 flex-col gap-3 rounded-xl ring-1 ring-foreground/10">
      <div className="flex flex-col gap-2 rounded-t-xl bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={ODS_IMAGEM[ods.numero]}
              alt={t.ods.altOds(ods.numero)}
              width={500}
              height={350}
              unoptimized
              className="h-9 w-auto shrink-0 rounded-md object-contain"
            />
            <span className="text-sm font-semibold leading-tight">{ods.titulo}</span>
          </div>
          {onRemover && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemover}
              className="shrink-0"
              aria-label={t.ods.removerAria(ods.numero)}
            >
              <X className="size-4" />
              {t.ods.remover}
            </Button>
          )}
        </div>
        <span className="line-clamp-2 text-xs text-muted-foreground">{ods.descricaoCurta}</span>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-2 p-3 pt-0 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        {vazio && (
          <p className="col-span-full px-1 py-6 text-center text-xs text-muted-foreground">
            {t.ods.vazioOds}
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
  const { locale } = useLocale();
  const t = useT();
  const [eixosFiltro, setEixosFiltro] = React.useState<EixoOds[]>([]);
  const [statusFiltro, setStatusFiltro] = React.useState<StatusIndicador[]>([]);
  const [busca, setBusca] = React.useState("");
  const [odsSelecionados, setOdsSelecionados] = React.useState<number[]>([]);

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

  const odsLista = React.useMemo(() => getOds(locale), [locale]);

  const lista = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return odsLista.map((ods) => {
      const indicadores = ods.indicadoresContemplados.filter((ind) => {
        const eixoOk = eixosFiltro.length === 0 || eixosFiltro.some((e) => ind.eixos.includes(e));
        if (!eixoOk) return false;
        const statusOk = statusFiltro.length === 0 || statusFiltro.includes(ind.status);
        if (!statusOk) return false;
        if (!termo) return true;
        return (
          ind.codigo.toLowerCase().includes(termo) ||
          ind.descricao.toLowerCase().includes(termo) ||
          ods.titulo.toLowerCase().includes(termo)
        );
      });
      return { ...ods, indicadoresContemplados: indicadores };
    });
  }, [odsLista, eixosFiltro, statusFiltro, busca]);

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

  const odsAtuais = React.useMemo(
    () => lista.filter((o) => odsSelecionados.includes(o.numero)),
    [lista, odsSelecionados],
  );

  const toggleOds = React.useCallback((numero: number) => {
    setOdsSelecionados((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero],
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={t.ods.titulo}
        descricao={t.ods.descricao}
        className="bg-sidebar text-sidebar-foreground ring-transparent"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo={t.ods.kpiIndicadoresTitulo}
          valor={String(totalIndicadores)}
          dica={t.ods.kpiIndicadoresDica}
          icone={Target}
          className="border-transparent bg-[linear-gradient(135deg,#da1a29_0%,#e3536c_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo={t.ods.kpiOdsTitulo}
          valor={`${odsComIndicadores}/18`}
          dica={t.ods.kpiOdsDica}
          icone={BookOpen}
          className="border-transparent bg-[linear-gradient(135deg,#fcd036_0%,#f1731f_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo={t.ods.kpiEixoTitulo}
          valor={
            <div>
              {EIXO_OPCOES.map(({ valor: eixo }, i) => (
                <React.Fragment key={eixo}>
                  {i > 0 && <span aria-hidden className="text-white/40">·</span>}
                  <span>
                    <span className="text-white">{t.common.eixoRotulo(eixo)}</span>
                    <span>{contagemPorEixo[eixo]}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          }
          dica={t.ods.kpiEixoDica}
          icone={HeartPulse}
          className="border-transparent bg-[linear-gradient(135deg,#cae081_0%,#b3c8a7_55%,#a9ccb9_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
        <KpiCard
          titulo={t.ods.kpiTransversaisTitulo}
          valor={String(multiEixo)}
          dica={t.ods.kpiTransversaisDica}
          icone={HandHeart}
          className="border-transparent bg-[linear-gradient(135deg,#afab50_0%,#89373d_100%)] text-white ring-transparent [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t.ods.filtroEixo}</span>
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
              {t.ods.todos}
            </button>
            {EIXO_OPCOES.map(({ valor, icone: Icone }) => {
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
                  {t.common.eixoRotulo(valor)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t.ods.filtroStatus}</span>
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
              {t.ods.todos}
            </button>
            {STATUS_OPCOES.map((valor) => {
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
                  {t.common.statusOdsRotulo(valor)}
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
              placeholder={t.ods.buscaPlaceholder}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 xl:grid-cols-[repeat(18,minmax(0,1fr))]">
          {odsLista.map((ods, index) => {
            const selecionado = odsSelecionados.includes(ods.numero);
            return (
              <button
                key={ods.numero}
                type="button"
                onClick={() => toggleOds(ods.numero)}
                aria-label={t.ods.altOdsTitulo(ods.numero, ods.titulo)}
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
                  alt={t.ods.altOdsTitulo(ods.numero, ods.titulo)}
                  width={500}
                  height={350}
                  unoptimized
                  className="h-auto w-full object-contain"
                />
              </button>
            );
          })}
        </div>

      {odsSelecionados.length > 1 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setOdsSelecionados([])}>
            <X className="size-4" />
            {t.ods.limparSelecao(odsSelecionados.length)}
          </Button>
        </div>
      )}

      {odsAtuais.map((ods) => (
        <OdsColuna
          key={ods.numero}
          ods={ods}
          eixosFiltro={eixosFiltro}
          onRemover={() => toggleOds(ods.numero)}
        />
      ))}

      {odsSelecionados.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t.ods.dicaSelecao}
        </p>
      )}
    </div>
  );
}
