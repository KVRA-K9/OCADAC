"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
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
import { formatMoeda, formatMoedaCompacta } from "@/lib/format";
import { serieExecucao } from "@/data/historico";
import { META_ROCA } from "@/data/roca";

const ESTAGIOS = [
  { key: "ocadInicial", rotulo: "OCAD Inicial", cor: "var(--chart-1)" },
  { key: "ocadAtualizado", rotulo: "OCAD Atualizado", cor: "var(--chart-2)" },
  { key: "ocadEmpenhado", rotulo: "OCAD Empenhado", cor: "var(--chart-3)" },
  { key: "ocadLiquidado", rotulo: "OCAD Liquidado", cor: "var(--chart-5)" },
  { key: "ocadPago", rotulo: "OCAD Pago", cor: "var(--chart-4)" },
] as const;

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

export default function EvolucaoPage() {
  const primeiro = serieExecucao[0];
  const ultimo = serieExecucao[serieExecucao.length - 1];
  const variacaoPlanejado =
    primeiro && ultimo && primeiro.ocadInicial > 0
      ? ((ultimo.ocadInicial - primeiro.ocadInicial) / primeiro.ocadInicial) * 100
      : null;

  const medidores = React.useMemo(
    () =>
      serieExecucao.map((p) => {
        const pct =
          p.ocadAtualizado > 0 ? (p.ocadLiquidado / p.ocadAtualizado) * 100 : 0;
        return {
          ...p,
          pct,
          pctClamped: Math.min(Math.max(pct, 0), 100),
        };
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Evolução Temporal"
        descricao="Comparativo ponderado do OCAD por exercício. Cada ano identifica a planilha de origem e sua data de corte; onde a fonte não publica um estágio da despesa, ele aparece como não publicado em vez de zero."
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">
              OCAD Inicial e Atualizado (ponderados) — por exercício
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serieExecucao}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
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
                    dataKey="ocadInicial"
                    name="OCAD Inicial"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={80}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Bar
                    dataKey="ocadAtualizado"
                    name="OCAD Atualizado"
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

        <Card className="relative w-full overflow-hidden border-primary/30 bg-primary text-primary-foreground ring-primary/30 lg:w-52">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Variação {primeiro?.ano}–{ultimo?.ano}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col justify-center">
            <span
              className={`text-3xl font-bold tabular-nums ${
                variacaoPlanejado !== null && variacaoPlanejado >= 0
                  ? "text-[#2f9e44]"
                  : "text-[#e9776f]"
              }`}
            >
              {variacaoPlanejado !== null
                ? `${variacaoPlanejado >= 0 ? "+" : ""}${variacaoPlanejado.toFixed(1)}%`
                : "—"}
            </span>
            <p className="mt-1 text-xs text-primary-foreground/70">
              {variacaoPlanejado !== null && variacaoPlanejado >= 0
                ? "Aumento"
                : "Redução"}{" "}
              no OCAD Inicial entre {primeiro?.ano} e {ultimo?.ano}
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="flex flex-col gap-2 pt-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Execução orçamentária
        </h2>
        <p className="text-sm text-muted-foreground">
          Ações não exclusivas entram a{" "}
          {(META_ROCA.ponderador * 100).toLocaleString("pt-BR")}% e exclusivas,
          integralmente. Só os exercícios vindos das planilhas OCAD publicam
          empenhado e pago; o painel de orçamentos temáticos divulga apenas o
          liquidado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Liquidado sobre o orçamento atualizado — por exercício
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {medidores.map((g) => (
              <div key={g.ano} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {g.ano}
                </span>
                <MedidorLiquidado pct={g.pct} pctClamped={g.pctClamped} />
                <span className="-mt-3 max-w-[280px] text-center text-xs text-muted-foreground">
                  {formatMoedaCompacta(g.ocadLiquidado)} liquidado ·{" "}
                  <span style={{ color: "var(--chart-2)" }}>
                    atualizado: {formatMoedaCompacta(g.ocadAtualizado)}
                  </span>
                </span>
                <span className="text-center text-[11px] text-muted-foreground/80">
                  {g.fonte} · corte {g.dataCorte}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Estágios da despesa por exercício (ponderados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {serieExecucao.map((p) => (
              <div
                key={p.ano}
                className="flex flex-col gap-2 rounded-lg bg-muted/40 p-4"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {p.ano}
                </span>
                <div className="flex flex-col gap-1.5">
                  {ESTAGIOS.map((m) => {
                    const valor = p[m.key];
                    return (
                      <div
                        key={m.key}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="size-2 rounded-sm"
                            style={{ background: m.cor }}
                          />
                          {m.rotulo}
                        </span>
                        <span className="text-xs font-semibold tabular-nums">
                          {valor === null ? (
                            <span
                              className="font-normal text-muted-foreground"
                              title="Estágio não publicado pela fonte deste exercício"
                            >
                              não publicado
                            </span>
                          ) : (
                            formatMoeda(valor)
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[11px] text-muted-foreground/80">
                  {p.fonte} · corte {p.dataCorte}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
