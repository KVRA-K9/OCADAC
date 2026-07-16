"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoeda, formatMoedaCompacta } from "@/lib/format";
import type {
  AgregadoFuncao,
  AgregadoOrgao,
  ContagemAcoesSecretaria,
  PontoComparacao,
  PontoSerie,
} from "@/data/placeholder";
import type { CategoriaEconomica, OrcamentoItem } from "@/lib/types";

const SERIES_COLORS: Record<string, string> = {
  previsto: "var(--chart-1)",
  empenhado: "var(--chart-2)",
  liquidado: "var(--chart-3)",
  pago: "var(--chart-5)",
};

const EIXO_COLORS: Record<string, string> = {
  "Educação": "#f7bb75",
  "Saúde": "#d15c57",
  "Assistência Social": "#92bf9f",
  "Outras": "var(--muted-foreground)",
};

const ROTULOS_ESTAGIO: Record<string, string> = {
  previsto: "Planejado Inicial",
  empenhado: "Orçamento Atualizado",
  liquidado: "Liquidado",
  pago: "Disponível",
};

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
  format = formatMoeda,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  format?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const nomeCompleto =
    payload[0]?.payload?.orgao ? String(payload[0].payload.orgao) : undefined;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      {nomeCompleto ? (
        <p className="mb-1 max-w-[280px] font-medium text-foreground">{nomeCompleto}</p>
      ) : label !== undefined ? (
        <p className="mb-1 font-medium text-foreground">{String(label)}</p>
      ) : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground tabular-nums">
              {format(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AxisFormat(value: number): string {
  return formatMoedaCompacta(value);
}

/* ---------------------------- Barra por órgão ----------------------------- */

const SIGLAS_ORGAOS: Record<string, string> = {
  "SECRETARIA DE ESTADO DE ADMINISTRAÇÃO - SEAD": "SEAD",
  "SECRETARIA DE ESTADO DA EDUCAÇÃO, CULTURA E ESPORTES - SEE": "SEE",
  "SECRETARIA DE ESTADO DE ASSISTÊNCIA SOCIAL E DIREITOS HUMANOS - SEASDH": "SEASDH",
  "SECRETARIA DE ESTADO DE SAÚDE - SESACRE": "SESACRE",
  "SECRETARIA DE ESTADO DA JUSTIÇA E SEGURANÇA PÚBLICA - SEJUSP": "SEJUSP",
  "SECRETARIA DE ESTADO DA MULHER - SEMULHER": "SEMULHER",
  "SECRETARIA DE ESTADO DE OBRAS PÚBLICAS - SEOP": "SEOP",
  "SECRETARIA EXTRAORDINÁRIA DE ESPOR- TE E LAZER - SEEL": "SEEL",
  "SECRETARIA DE ESTADO DE HABITAÇÃO E URBANISMO - SEHURB": "SEHURB",
};

export function BudgetBarChart({ data }: { data: AgregadoOrgao[] }) {
  const dados = data.map((d) => ({
    ...d,
    orgaoCurto: SIGLAS_ORGAOS[d.orgao] ?? d.orgao,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        barCategoryGap="22%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          tickFormatter={AxisFormat}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="category"
          dataKey="orgaoCurto"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="var(--muted-foreground)"
          width={120}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Bar dataKey="empenhado" name="Orçamento Atualizado" fill={SERIES_COLORS.empenhado} radius={[0, 4, 4, 0]} maxBarSize={34} isAnimationActive animationDuration={900} />
        <Bar dataKey="liquidado" name="Liquidado" fill="#a3c4c2" radius={[0, 4, 4, 0]} maxBarSize={34} isAnimationActive animationDuration={900} animationBegin={150} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ Donut por função --------------------------- */

interface FatiaFuncao {
  funcao: string;
  previsto: number;
}

export function BudgetPieChart({ data }: { data: AgregadoFuncao[] }) {
  const ordenado = [...data].sort((a, b) => b.previsto - a.previsto);
  const topo = ordenado.slice(0, 5);
  const outras = ordenado.slice(5);
  const fatias: FatiaFuncao[] = topo.map((d) => ({
    funcao: d.funcao,
    previsto: d.previsto,
  }));
  if (outras.length > 0) {
    fatias.push({
      funcao: "Outras",
      previsto: outras.reduce((acc, d) => acc + d.previsto, 0),
    });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={fatias}
          dataKey="previsto"
          nameKey="funcao"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          stroke="var(--background)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
        >
          {fatias.map((d, i) => (
            <Cell
              key={i}
              fill={EIXO_COLORS[d.funcao] ?? "var(--muted-foreground)"}
            />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* --------------------------- Linha - série histórica ----------------------- */

export function BudgetLineChart({ data }: { data: PontoSerie[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="ano"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickFormatter={AxisFormat}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
          width={72}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        {(["previsto", "empenhado", "liquidado", "pago"] as const).map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={ROTULOS_ESTAGIO[key]}
            stroke={SERIES_COLORS[key]}
            strokeWidth={2}
            dot={{ r: 3, fill: SERIES_COLORS[key] }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={900}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* --------------------- Barras empilhadas - comparação ---------------------- */

export function BudgetStackedBar({ data }: { data: PontoComparacao[] }) {
  const dados = data.map((d) => ({
    ...d,
    funcaoCurta: d.funcao.length > 22 ? d.funcao.slice(0, 20) + "…" : d.funcao,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          tickFormatter={AxisFormat}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="category"
          dataKey="funcaoCurta"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="var(--muted-foreground)"
          width={140}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Bar dataKey="Exclusivo" name="Exclusivo" stackId="a" fill="#e3d49c" maxBarSize={28} isAnimationActive animationDuration={900} />
        <Bar dataKey="Não Exclusivo" name="Não Exclusivo" stackId="a" fill="#766862" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive animationDuration={900} animationBegin={150} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------- Histogramas — execução por eixo x classificação (faixas de valor liquidado) -------- */

const EIXO_ORDEM = ["Educação", "Saúde", "Assistência Social"];

const HIST_BINS = [
  { max: 10_000, label: "< 10 mil" },
  { max: 100_000, label: "10k – 100k" },
  { max: 1_000_000, label: "100k – 1 mi" },
  { max: 10_000_000, label: "1 – 10 mi" },
  { max: 100_000_000, label: "10 – 100 mi" },
  { max: Infinity, label: "100 mi +" },
] as const;

function binIndex(valor: number): number {
  for (let i = 0; i < HIST_BINS.length; i++) {
    if (valor < HIST_BINS[i].max) return i;
  }
  return HIST_BINS.length - 1;
}

interface BinDado {
  bin: string;
  intervalo: string;
  Exclusivo: number;
  "Não Exclusivo": number;
  ExclusivoValor: number;
  "Não Exclusivo Valor": number;
}

function histogramaEixo(itens: OrcamentoItem[]): BinDado[] {
  const bins: BinDado[] = HIST_BINS.map((b) => ({
    bin: b.label,
    intervalo: b.label,
    Exclusivo: 0,
    "Não Exclusivo": 0,
    ExclusivoValor: 0,
    "Não Exclusivo Valor": 0,
  }));
  itens.forEach((i) => {
    const idx = binIndex(i.valores.liquidado);
    if (i.categoriaEconomica === "Exclusivo") {
      bins[idx].Exclusivo++;
      bins[idx].ExclusivoValor += i.valores.liquidado;
    } else {
      bins[idx]["Não Exclusivo"]++;
      bins[idx]["Não Exclusivo Valor"] += i.valores.liquidado;
    }
  });
  return bins;
}

function HistogramaTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = (payload[0]?.payload ?? {}) as Record<string, number>;
  const total = p.Exclusivo + p["Não Exclusivo"];
  const totalExec =
    p.ExclusivoValor + p["Não Exclusivo Valor"];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      {label !== undefined && (
        <p className="mb-1 font-medium text-foreground">Faixa: {String(label)}</p>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: "var(--chart-1)" }}
          />
          <span className="text-muted-foreground">Exclusivo:</span>
          <span className="font-medium text-foreground tabular-nums">
            {p.Exclusivo} ações
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: "var(--chart-3)" }}
          />
          <span className="text-muted-foreground">Não Exclusivo:</span>
          <span className="font-medium text-foreground tabular-nums">
            {p["Não Exclusivo"]} ações
          </span>
        </div>
        <div className="mt-1 border-t pt-1 text-muted-foreground">
          Total na faixa: <span className="font-medium text-foreground tabular-nums">{total}</span> ações
          {totalExec > 0 && (
            <>
              {" · "}liquidado:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatMoeda(totalExec)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type SelecionadoHistograma = {
  binIndex: number;
  x: number;
  y: number;
} | null;

const CLASSIFICACAO_HIST_COLORS: Record<CategoriaEconomica, string> = {
  Exclusivo: "#e3d49c",
  "Não Exclusivo": "#766862",
};

function HistogramaEixo({
  itens,
  eixo,
}: {
  itens: OrcamentoItem[];
  eixo: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const balloonRef = React.useRef<HTMLDivElement>(null);
  const [selecionado, setSelecionado] = React.useState<SelecionadoHistograma>(null);

  const dados = React.useMemo(() => histogramaEixo(itens), [itens]);

  React.useEffect(() => {
    if (!selecionado) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        balloonRef.current?.contains(target)
      ) {
        return;
      }
      setSelecionado(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelecionado(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selecionado]);

  const handleClick = (
    binIdx: number,
    e: React.MouseEvent<SVGGraphicsElement>,
  ) => {
    e.stopPropagation();
    setSelecionado({ binIndex: binIdx, x: e.clientX, y: e.clientY });
  };

  const detalhe = selecionado
    ? itens
        .filter(
          (i) => binIndex(i.valores.liquidado) === selecionado.binIndex,
        )
        .map((i) => ({
          acao: i.acao,
          liquidado: i.valores.liquidado,
          categoriaEconomica: i.categoriaEconomica,
          orgao: i.orgao,
          orgaoCurto: SIGLAS_ORGAOS[i.orgao] ?? i.orgao,
        }))
        .sort((a, b) => b.liquidado - a.liquidado)
    : [];
  const totalLiquidadoFaixa = detalhe.reduce((acc, d) => acc + d.liquidado, 0);

  const BALLOON_W = 320;
  const BALLOON_H = 440;
  const MARGIN = 8;

  const pos = selecionado
    ? (() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = selecionado.x - BALLOON_W / 2;
        const placeBelow = selecionado.y - BALLOON_H - MARGIN < 0;
        let top = placeBelow
          ? selecionado.y + MARGIN
          : selecionado.y - BALLOON_H - MARGIN;
        if (left < MARGIN) left = MARGIN;
        if (left + BALLOON_W > vw - MARGIN) left = vw - BALLOON_W - MARGIN;
        if (top + BALLOON_H > vh - MARGIN) top = vh - BALLOON_H - MARGIN;
        if (top < MARGIN) top = MARGIN;
        return { left, top };
      })()
    : null;

  const faixaLabel = selecionado ? HIST_BINS[selecionado.binIndex].label : "";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onClick={() => setSelecionado(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="8%"
          className="cursor-pointer"
          onClick={(state, e) => {
            if (!state || state.activeTooltipIndex == null) return;
            handleClick(
              Number(state.activeTooltipIndex),
              e as unknown as React.MouseEvent<SVGGraphicsElement>,
            );
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="bin"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="var(--muted-foreground)"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={48}
          />
          <YAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="var(--muted-foreground)"
            width={36}
          />
          <Tooltip
            content={<HistogramaTooltip />}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          />
          <Bar
            dataKey="Exclusivo"
            name="Exclusivo"
            stackId="a"
            maxBarSize={8}
            background={{ fill: "transparent" }}
            isAnimationActive
            animationDuration={700}
          >
            {dados.map((d, i) => (
              <Cell
                key={`exc-${d.bin}`}
                fill={CLASSIFICACAO_HIST_COLORS.Exclusivo}
                opacity={selecionado && selecionado.binIndex !== i ? 0.35 : 1}
              />
            ))}
          </Bar>
          <Bar
            dataKey="Não Exclusivo"
            name="Não Exclusivo"
            stackId="a"
            radius={[4, 4, 0, 0]}
            maxBarSize={8}
            background={{ fill: "transparent" }}
            isAnimationActive
            animationDuration={700}
            animationBegin={100}
          >
            {dados.map((d, i) => (
              <Cell
                key={`nao-${d.bin}`}
                fill={CLASSIFICACAO_HIST_COLORS["Não Exclusivo"]}
                opacity={selecionado && selecionado.binIndex !== i ? 0.35 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selecionado &&
        pos &&
        createPortal(
          <div
            ref={balloonRef}
            role="dialog"
            aria-label={`Ações da faixa ${faixaLabel} em ${eixo}`}
            className="fixed z-50 flex w-80 max-h-[440px] flex-col rounded-lg border bg-popover p-3 text-xs shadow-md ring-1 ring-foreground/10"
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium text-foreground">{eixo}</span>
              <span className="text-muted-foreground">· {faixaLabel}</span>
              <button
                type="button"
                onClick={() => setSelecionado(null)}
                className="ml-auto rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="mb-2 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-2 rounded-sm"
                  style={{ background: CLASSIFICACAO_HIST_COLORS.Exclusivo }}
                />
                Exclusivo
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-2 rounded-sm"
                  style={{ background: CLASSIFICACAO_HIST_COLORS["Não Exclusivo"] }}
                />
                Não Exclusivo
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto pr-1">
              {detalhe.length === 0 ? (
                <p className="text-muted-foreground">Sem ações nesta faixa.</p>
              ) : (
                detalhe.map((d) => (
                  <div
                    key={`${d.acao}-${d.orgao}-${d.categoriaEconomica}`}
                    className="flex items-start justify-between gap-2 border-b border-border/40 pb-1 last:border-b-0"
                  >
                    <div className="min-w-0 flex flex-col">
                      <span className="flex items-start gap-1.5 font-medium text-foreground leading-tight">
                        <span
                          className="mt-0.5 size-2 shrink-0 rounded-sm"
                          style={{
                            background: CLASSIFICACAO_HIST_COLORS[d.categoriaEconomica],
                          }}
                        />
                        <span className="break-words">{d.acao}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground break-words leading-tight pl-3.5">
                        {d.orgaoCurto}
                      </span>
                    </div>
                    <span className="whitespace-nowrap font-medium text-foreground tabular-nums">
                      {formatMoeda(d.liquidado)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 border-t pt-1 text-muted-foreground">
              Total liquidado:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatMoeda(totalLiquidadoFaixa)}
              </span>
              {" · "}
              <span className="font-medium text-foreground tabular-nums">{detalhe.length}</span>{" "}
              ações
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function ExecucaoClassificacaoBar({
  data,
}: {
  data: OrcamentoItem[];
}) {
  const porEixo = React.useMemo(() => {
    const grupos: Record<string, OrcamentoItem[]> = {};
    EIXO_ORDEM.forEach((eixo) => {
      grupos[eixo] = data.filter((i) => i.funcao === eixo);
    });
    return EIXO_ORDEM.filter((eixo) => grupos[eixo].length > 0).map(
      (eixo) => ({ eixo, itens: grupos[eixo] }),
    );
  }, [data]);

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
      {porEixo.map(({ eixo, itens }) => (
        <div key={eixo} className="flex flex-col gap-2">
          <p className="text-center text-sm font-medium text-foreground">
            {eixo}
          </p>
          <div className="h-[260px] w-full">
            <HistogramaEixo itens={itens} eixo={eixo} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------- Barras agrupadas - ações por secretaria/classificação --------- */

export function AcoesClassificacaoBar({
  data,
}: {
  data: ContagemAcoesSecretaria[];
}) {
  const dados = data.map((d) => ({
    ...d,
    orgaoCurto: SIGLAS_ORGAOS[d.orgao] ?? d.orgao,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="orgaoCurto"
          tickLine={false}
          axisLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={56}
          fontSize={10}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          content={<ChartTooltip format={(v) => String(v)} />}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Bar dataKey="Exclusivo" name="Exclusivo" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive animationDuration={900} />
        <Bar dataKey="Não Exclusivo" name="Não Exclusivo" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive animationDuration={900} animationBegin={150} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ----------- Rosca - ações por classificação (Exclusivo vs Não Exclusivo) ----- */

const CLASSIFICACAO_DONUT_COLORS: Record<string, string> = {
  Exclusivo: "#e3d49c",
  "Não Exclusivo": "#766862",
};

export function AcoesClassificacaoDonut({
  data,
}: {
  data: ContagemAcoesSecretaria[];
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const balloonRef = React.useRef<HTMLDivElement>(null);
  const [selecionada, setSelecionada] = React.useState<{
    classificacao: string;
    x: number;
    y: number;
  } | null>(null);

  React.useEffect(() => {
    if (!selecionada) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        balloonRef.current?.contains(target)
      ) {
        return;
      }
      setSelecionada(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelecionada(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selecionada]);

  const totalExclusivo = data.reduce((acc, d) => acc + d.Exclusivo, 0);
  const totalNaoExclusivo = data.reduce((acc, d) => acc + d["Não Exclusivo"], 0);
  const fatias = [
    { classificacao: "Exclusivo", count: totalExclusivo },
    { classificacao: "Não Exclusivo", count: totalNaoExclusivo },
  ].filter((d) => d.count > 0);

  const handleClick = (
    payload: { classificacao?: string; name?: string },
    _index: number,
    e: React.MouseEvent<SVGGraphicsElement>,
  ) => {
    e.stopPropagation();
    const classificacao = String(payload?.classificacao ?? payload?.name ?? "");
    setSelecionada({
      classificacao,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const detalhe = selecionada
    ? data
        .map((d) => ({
          sigla: SIGLAS_ORGAOS[d.orgao] ?? d.orgao,
          orgao: d.orgao,
          count:
            selecionada.classificacao === "Exclusivo"
              ? d.Exclusivo
              : d["Não Exclusivo"],
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];
  const totalDetalhe = detalhe.reduce((acc, d) => acc + d.count, 0);

  const BALLOON_W = 256;
  const BALLOON_H = 260;
  const MARGIN = 8;

  const pos = selecionada
    ? (() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = selecionada.x - BALLOON_W / 2;
        const placeBelow = selecionada.y - BALLOON_H - MARGIN < 0;
        let top = placeBelow
          ? selecionada.y + MARGIN
          : selecionada.y - BALLOON_H - MARGIN;
        if (left < MARGIN) left = MARGIN;
        if (left + BALLOON_W > vw - MARGIN) left = vw - BALLOON_W - MARGIN;
        if (top + BALLOON_H > vh - MARGIN) top = vh - BALLOON_H - MARGIN;
        if (top < MARGIN) top = MARGIN;
        return { left, top };
      })()
    : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onClick={() => setSelecionada(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip format={(v) => `${v} ações`} />} />
          <Pie
            data={fatias}
            dataKey="count"
            nameKey="classificacao"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--background)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
            onClick={handleClick}
          >
            {fatias.map((d, i) => (
              <Cell
                key={i}
                fill={CLASSIFICACAO_DONUT_COLORS[d.classificacao] ?? "var(--muted-foreground)"}
                style={{ cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {selecionada &&
        pos &&
        createPortal(
          <div
            ref={balloonRef}
            role="dialog"
            aria-label={`Ações ${selecionada.classificacao} por secretaria`}
            className="fixed z-50 flex w-64 max-h-[260px] flex-col rounded-lg border bg-popover p-3 text-xs shadow-md ring-1 ring-foreground/10"
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="size-2.5 rounded-sm"
                style={{
                  background:
                    CLASSIFICACAO_DONUT_COLORS[selecionada.classificacao] ??
                    "var(--muted-foreground)",
                }}
              />
              <span className="font-medium text-foreground">
                {selecionada.classificacao}
              </span>
              <span className="text-muted-foreground">· {totalDetalhe} ações</span>
              <button
                type="button"
                onClick={() => setSelecionada(null)}
                className="ml-auto rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto pr-1">
              {detalhe.length === 0 ? (
                <p className="text-muted-foreground">Sem ações nesta categoria.</p>
              ) : (
                detalhe.map((d) => (
                  <div
                    key={d.orgao}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <div className="min-w-0 flex flex-col">
                      <span className="font-medium text-foreground truncate">
                        {d.sigla}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {d.orgao}
                      </span>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">
                      {d.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* --------- Top secretarias por valor liquidado (barras horizontais) ------- */

export function BudgetTopLiquidado({ data }: { data: AgregadoOrgao[] }) {
  const dados = data.map((d) => ({
    ...d,
    orgaoCurto: SIGLAS_ORGAOS[d.orgao] ?? d.orgao,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        barCategoryGap="22%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          tickFormatter={AxisFormat}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="category"
          dataKey="orgaoCurto"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="var(--muted-foreground)"
          width={120}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Legend
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Bar
          dataKey="liquidado"
          name="Liquidado"
          fill={SERIES_COLORS.liquidado}
          radius={[0, 4, 4, 0]}
          maxBarSize={34}
          isAnimationActive
          animationDuration={900}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
