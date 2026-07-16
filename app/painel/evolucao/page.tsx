"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as ChartTooltipHost,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMoeda, formatMoedaCompacta } from "@/lib/format";
import { serieHistoricaCompleta } from "@/data/historico";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      {label !== undefined && (
        <p className="mb-1 font-medium text-foreground">{String(label)}</p>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatMoeda(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedidorLiquidado({
  pct,
  pctClamped,
}: {
  pct: number;
  pctClamped: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const radius = size.width / 2;

  return (
    <div ref={containerRef} className="relative aspect-[2/1] w-full max-w-[640px]">
      {size.width > 0 && (
        <RadialBarChart
          width={size.width}
          height={size.height}
          data={[{ value: pctClamped }]}
          cx={radius}
          cy={size.height}
          innerRadius={radius * 0.7}
          outerRadius={radius}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={0}
            fill="var(--chart-5)"
            background={{ fill: "var(--chart-2)", opacity: 0.32 }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadialBarChart>
      )}
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

const METRICAS: Array<{
  key: "inicial" | "atual" | "empenhado" | "liquidado" | "pago";
  rotulo: string;
  cor: string;
}> = [
  { key: "inicial", rotulo: "Inicial (pond.)", cor: "var(--chart-1)" },
  { key: "atual", rotulo: "Atual (pond.)", cor: "var(--chart-2)" },
  { key: "empenhado", rotulo: "Empenhado", cor: "var(--chart-3)" },
  { key: "liquidado", rotulo: "Liquidado", cor: "var(--chart-5)" },
  { key: "pago", rotulo: "Pago", cor: "var(--chart-4)" },
];

export default function EvolucaoPage() {
  const serie = serieHistoricaCompleta;

  const primeiro = serie[0];
  const ultimo = serie[serie.length - 1];
  const variacaoLiquidado =
    primeiro && ultimo && primeiro.liquidado > 0
      ? ((ultimo.liquidado - primeiro.liquidado) / primeiro.liquidado) * 100
      : null;

  const gaugesLiquidado = React.useMemo(
    () =>
      serie.map((s) => {
        const pct = s.atual > 0 ? (s.liquidado / s.atual) * 100 : 0;
        return {
          ano: s.ano,
          acumulado: s.acumulado,
          atual: s.atual,
          liquidado: s.liquidado,
          pct,
          pctClamped: Math.min(Math.max(pct, 0), 100),
        };
      }),
    [serie],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Evolução Temporal"
        descricao="Comparativo ponderado do Orçamento Criança e Adolescente (OCAD) no Estado do Acre. Valores de Orçamento Inicial e Atual ponderados por tipo (Exclusivo ×1,0 / Não exclusivo ×0,36). Empenhado, Liquidado e Pago já apresentam a ponderação nas planilhas originais. O ano de 2026 refere-se ao acumulado até junho."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Orçamento Inicial e Atual (ponderado) — por ano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="ano"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickFormatter={(v) => formatMoedaCompacta(v)}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                  width={72}
                />
                <ChartTooltipHost
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                <Bar
                  dataKey="inicial"
                  name="Orçamento Inicial (pond.)"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                  isAnimationActive
                  animationDuration={900}
                />
                <Bar
                  dataKey="atual"
                  name="Orçamento Atual (pond.)"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={80}
                  isAnimationActive
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Valor Liquidado (ponderado) — por ano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gaugesLiquidado.map((g) => (
              <div key={g.ano} className="flex flex-col items-center gap-0.5">
                <span className="relative flex items-center justify-center text-2xl font-bold tracking-tight text-foreground">
                  {g.ano}
                  {g.acumulado && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="absolute -right-6 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/30 text-xs font-bold text-muted-foreground hover:bg-muted-foreground/50"
                        >
                          i
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Acumulado até 06/2026</TooltipContent>
                    </Tooltip>
                  )}
                </span>
                <MedidorLiquidado pct={g.pct} pctClamped={g.pctClamped} />
                <span className="-mt-3 max-w-[220px] text-center text-xs text-muted-foreground">
                  {formatMoedaCompacta(g.liquidado)} liquidado ·{" "}
                  <span style={{ color: "var(--chart-2)" }}>
                    Meta: {formatMoedaCompacta(g.atual)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">Valores anuais (ponderados)</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {serie.map((p) => (
                  <div
                    key={p.ano}
                    className="flex flex-col gap-2 rounded-lg bg-muted/40 p-4"
                    style={{ minWidth: "240px" }}
                  >
                    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      {p.ano}
                      {p.acumulado && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex size-4 items-center justify-center rounded-full bg-muted-foreground/30 text-[10px] font-bold text-muted-foreground hover:bg-muted-foreground/50"
                            >
                              i
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Acumulado até 06/2026</TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {METRICAS.map((m) => (
                        <div key={m.key} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                              className="size-2 rounded-sm"
                              style={{ background: m.cor }}
                            />
                            {m.rotulo}
                          </span>
                          <span className="text-xs font-semibold tabular-nums">
                            {formatMoeda(p[m.key])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        <Card className="relative w-48 overflow-hidden border-primary/30 bg-primary text-primary-foreground ring-primary/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Variação {primeiro.ano}–{ultimo.ano}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col justify-center">
            <span
              className={`text-3xl font-bold tabular-nums ${
                variacaoLiquidado !== null && variacaoLiquidado >= 0
                  ? "text-[#2f9e44]"
                  : "text-[#e9776f]"
              }`}
            >
              {variacaoLiquidado !== null
                ? `${variacaoLiquidado >= 0 ? "+" : ""}${variacaoLiquidado.toFixed(1)}%`
                : "—"}
            </span>
            <p className="mt-1 text-xs text-primary-foreground/70">
              {variacaoLiquidado !== null && variacaoLiquidado >= 0
                ? "Aumento"
                : "Redução"}{" "}
              no valor liquidado entre {primeiro.ano} e {ultimo.ano}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
