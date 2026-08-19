"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip as ChartTooltipHost,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownUp,
  ArrowLeft,
  CalendarRange,
  Info,
  Landmark,
  Scale,
  Search,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ListaNormas, SeletorAbas } from "@/components/dashboard/acervo-normas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCruzeiroMil,
  formatMoeda,
  formatMoedaCompacta,
} from "@/lib/format";
import { CORES_NORMA, DESCRICOES_NORMA, ICONES_NORMA } from "@/lib/normas";
import {
  anosNormas,
  exerciciosEmCruzeiro,
  metaLeis,
  normaPorExercicio,
  normas,
  serieLOAReal,
  type PontoLOA,
  type TipoNorma,
} from "@/data/historico-leis";
import {
  ocadPorExercicio,
  razaoSemApuracao,
} from "@/data/ocad-loas";

/**
 * Cores da série, em pastel, definidas em `globals.css` com valor próprio para
 * cada tema — no escuro o pastel precisa de menos luz para não estourar. A
 * legenda e as barras leem daqui, então nunca saem de sincronia.
 */
const COR_APURADO = "var(--ocad-apurado)";
const COR_SEM_APURACAO = "var(--ocad-sem-apuracao)";

/**
 * O gráfico traz duas medidas diferentes no mesmo eixo, e por isso o tooltip não
 * pode somar tudo num "Total" só: a dotação dos órgãos e o OCAD apurado respondem
 * a perguntas distintas. Cada uma aparece com o seu subtotal, e o exercício sem
 * apuração diz por que não tem a segunda.
 */
function TooltipLOA({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: PontoLOA }[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const exercicio = Number(label);
  const apuracao = ocadPorExercicio.get(exercicio);
  const ponto = payload[0]?.payload;

  return (
    <div className="max-w-[20rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      <p className="mb-1.5 font-medium text-foreground">Exercício {label}</p>

      {apuracao ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-sm"
              style={{ background: COR_APURADO }}
            />
            <span className="font-medium text-foreground tabular-nums">
              OCAD apurado: {formatMoeda(apuracao.ocad ?? 0)}
            </span>
          </div>
          {apuracao.totalAcoes === null ? (
            <p className="leading-relaxed text-muted-foreground">
              Só as unidades de ensino, do ISE e da infância, lidas página a
              página: o caderno de 2014 desenha as tabelas como imagem, e a
              varredura por descritores não alcança esse exercício. O valor é um
              piso — nos anos vizinhos essa parcela fica abaixo de 1,5%.
            </p>
          ) : (
            <>
              <p className="leading-relaxed text-muted-foreground tabular-nums">
                {formatMoeda(apuracao.totalIntegrais ?? 0)} nas unidades de
                ensino, do ISE e da infância, somadas inteiras;{" "}
                {formatMoeda(apuracao.totalAcoes ?? 0)} em{" "}
                {apuracao.acoesCasadas}{" "}
                {apuracao.acoesCasadas === 1 ? "ação" : "ações"} com os
                descritores.
              </p>
              {apuracao.naoDetalhado > 0 && (
                /* O caderno de alguns exercícios imprime ações só com o nome,
                 * sem valor. Calar isso faria a soma parecer completa. */
                <p className="mt-1 border-t pt-1 leading-relaxed text-muted-foreground">
                  O caderno deste exercício imprime parte das ações sem valor:{" "}
                  <span className="tabular-nums">
                    {formatMoeda(apuracao.naoDetalhado)}
                  </span>{" "}
                  do que as unidades declaram não é detalhado por nenhuma linha
                  publicada, e por isso não pôde passar pelos descritores.
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 rounded-sm"
              style={{ background: COR_SEM_APURACAO }}
            />
            <span className="font-medium text-foreground tabular-nums">
              Dotação Total dos Órgãos: {formatMoeda(ponto?.total ?? 0)}
            </span>
          </div>
          <p className="text-muted-foreground tabular-nums">
            {formatMoeda(ponto?.rp ?? 0)} próprios · {" "}
            {formatMoeda(ponto?.outrasFontes ?? 0)} outras fontes
          </p>
          <p className="mt-0.5 border-t pt-1 leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Sem curadoria.</span>{" "}
            {razaoSemApuracao()}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * A série do gráfico é o OCAD apurado no texto de cada lei. Nos exercícios cujos
 * anexos antecedem a publicação eletrônica, a barra mostra a dotação dos órgãos
 * da planilha — número de outra origem, e por isso de outra cor.
 */
const serieComApuracao = serieLOAReal.map((p) => {
  const apurado = ocadPorExercicio.get(p.exercicio)?.ocad ?? null;
  return {
    ...p,
    apurado,
    valor: apurado ?? p.total,
  };
});

const semApuracao = (exercicio: number) => !ocadPorExercicio.has(exercicio);

const ORDENS = {
  recentes: "Mais recentes",
  antigas: "Mais antigas",
  numero: "Número da norma",
} as const;

type Ordem = keyof typeof ORDENS;

const TODOS = "todos";

/*
 * Interruptor do bloco "Antes do real": o gráfico dos exercícios em cruzeiro
 * está pronto e preservado abaixo, apenas fora do ar por ora. Basta trocar para
 * `true` para ele voltar ao painel exatamente como estava.
 */
const MOSTRAR_EXERCICIOS_EM_CRUZEIRO = false;

/*
 * O recorte da pandemia no gráfico da LOA. Vai até 2024 porque o que se quer
 * marcar é o efeito orçamentário, que sobrevive ao fim da emergência: no Brasil
 * a ESPIN foi encerrada em maio de 2022 e a emergência internacional em maio de
 * 2023 — o aviso diz as duas datas, para o círculo não passar por marco oficial.
 */
const PANDEMIA_INICIO = 2020;
const PANDEMIA_FIM = 2024;
const PANDEMIA_TEXTO =
  "Emergência declarada em março de 2020, encerrada no Brasil em maio de 2022 (Portaria GM/MS nº 913/2022) e pela OMS em maio de 2023. O recorte vai até 2024 pelos efeitos orçamentários.";
const PANDEMIA_TITULO = `Pandemia de COVID-19 — exercícios de ${PANDEMIA_INICIO} a ${PANDEMIA_FIM}`;

/** Espaço reservado acima da moldura para o rótulo "COVID-19". */
const PANDEMIA_FOLGA_TOPO = 18;
/** Quanto a moldura desce abaixo do eixo, para envolver os rótulos de ano. */
const PANDEMIA_ALCANCE_ABAIXO = 44;

/*
 * A moldura é justa ao período: ocupa a largura da faixa de 2020 a 2024 menos
 * uma folga de 2px, então não encosta nas colunas vizinhas e, sendo retângulo,
 * também não corta nenhuma barra de dentro.
 */
function geometriaPandemia(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const topo = y + PANDEMIA_FOLGA_TOPO;
  const base = y + height + PANDEMIA_ALCANCE_ABAIXO;
  return {
    x: x + 2,
    y: topo,
    width: Math.max(0, width - 4),
    height: Math.max(0, base - topo),
    rx: 16,
    ry: 16,
    meio: x + width / 2,
    topo,
  };
}

/**
 * A marca do período de pandemia, em duas camadas: a mancha vai atrás das
 * barras e o contorno por cima delas. Nenhuma das duas recebe ponteiro — as
 * barras de dentro seguem inteiras para o tooltip da série e para o clique que
 * leva à lei —, e a explicação fica no aviso fixo abaixo do gráfico.
 */
function MarcaPandemia({
  x,
  y,
  width,
  height,
  camada,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  camada: "mancha" | "contorno";
}) {
  if (x == null || y == null || width == null || height == null) return null;

  const { meio, topo, ...moldura } = geometriaPandemia(x, y, width, height);

  return (
    <g role="img" style={{ pointerEvents: "none" }}>
      <title>{`${PANDEMIA_TITULO}. ${PANDEMIA_TEXTO}`}</title>
      {camada === "mancha" ? (
        <rect {...moldura} fill="var(--destructive)" fillOpacity={0.07} />
      ) : (
        <>
          <rect
            {...moldura}
            fill="none"
            stroke="var(--destructive)"
            strokeOpacity={0.75}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text
            x={meio}
            y={topo - 7}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fill="var(--destructive)"
          >
            COVID-19
          </text>
        </>
      )}
    </g>
  );
}

/*
 * Os quatro exercícios anteriores ao real, em barras próprias. Não é gráfico do
 * recharts de propósito: entre R$ 382 (1992) e R$ 3,6 milhões (1994) há quatro
 * ordens de grandeza, e em escala linear três das quatro barras não existiriam.
 * A escala aqui é logarítmica — de R$ 100 a R$ 10 milhões —, e cada linha traz o
 * número escrito, para ninguém precisar estimar grandeza no olho.
 */
const LOG_MIN = 2; // 10² = R$ 100
const LOG_MAX = 7; // 10⁷ = R$ 10 milhões

function BarrasCruzeiro({
  pontos,
  opacidade,
  onEscolher,
}: {
  pontos: PontoLOA[];
  opacidade: (exercicio: number) => number;
  onEscolher: (exercicio: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {pontos.map((p) => {
        const largura = Math.max(
          4,
          ((Math.log10(Math.max(p.total, 1)) - LOG_MIN) / (LOG_MAX - LOG_MIN)) *
            100,
        );
        return (
          <li key={p.exercicio}>
            <button
              type="button"
              onClick={() => onEscolher(p.exercicio)}
              style={{ opacity: opacidade(p.exercicio) }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-opacity hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none"
            >
              <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">
                {p.exercicio}
              </span>
              {/* Trilho de largura fixa: a barra é uma fração dele, e o valor
               * fica em coluna própria, sem ser empurrado para fora. */}
              <span
                aria-hidden
                className="h-5 min-w-0 flex-1 rounded-sm bg-muted/60"
              >
                <span
                  className="block h-full rounded-sm"
                  style={{
                    width: `${largura}%`,
                    background: "var(--chart-3)",
                  }}
                />
              </span>
              <span className="w-28 shrink-0 text-right text-sm font-medium tabular-nums">
                {formatMoeda(p.total)}
              </span>
              <span className="hidden w-48 shrink-0 text-right text-xs text-muted-foreground tabular-nums lg:block">
                {formatCruzeiroMil(p.totalOriginal)} na lei
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function HistoricoPage() {
  /* A aba da planilha em exibição — uma por vez, como na página de ODS. */
  const [aba, setAba] = React.useState<TipoNorma | null>(null);
  const [busca, setBusca] = React.useState("");
  /* Década, no formato "1990"; `TODOS` quando o filtro está solto. */
  const [decada, setDecada] = React.useState<string>(TODOS);
  const [ordem, setOrdem] = React.useState<Ordem>("recentes");
  /* Norma escolhida por um clique numa barra do gráfico. */
  const [foco, setFoco] = React.useState<{
    normaId: string;
    exercicio: number;
  } | null>(null);
  /*
   * Só o clique numa barra destaca — passar o mouse pela lista não mexe em nada,
   * para a tela não piscar enquanto se lê.
   */
  const opacidadeBarra = (exercicio: number) =>
    foco === null || foco.exercicio === exercicio ? 1 : 0.3;

  /* Todas as normas da aba, antes de busca e período: é o universo do filtro. */
  const daAba = React.useMemo(
    () => (aba ? normas.filter((n) => n.tipo === aba) : []),
    [aba],
  );

  /* As décadas que a aba realmente cobre — nada de oferecer filtro vazio. */
  const decadas = React.useMemo(() => {
    const conta = new Map<number, number>();
    for (const n of daAba) {
      const d = Math.floor(n.ano / 10) * 10;
      conta.set(d, (conta.get(d) ?? 0) + 1);
    }
    return [...conta.entries()].sort((a, b) => b[0] - a[0]);
  }, [daAba]);

  const filtradas = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = daAba.filter((n) => {
      if (decada !== TODOS && Math.floor(n.ano / 10) * 10 !== Number(decada))
        return false;
      if (termo.length === 0) return true;
      return (
        n.ementa.toLowerCase().includes(termo) ||
        n.numero.toLowerCase().includes(termo) ||
        String(n.ano).includes(termo) ||
        (n.orgaos?.toLowerCase().includes(termo) ?? false) ||
        n.metas.some((m) => m.toLowerCase().includes(termo))
      );
    });

    /*
     * O número da norma é texto com pontos ("4.282"): ordenar por ele exige
     * comparar como número, senão "1.043" cai depois de "999".
     */
    const soNumero = (n: (typeof lista)[number]) =>
      Number(n.numero.replace(/\D/g, "")) || 0;

    return [...lista].sort((a, b) => {
      if (ordem === "numero") return soNumero(b) - soNumero(a);
      return ordem === "antigas" ? a.ano - b.ano : b.ano - a.ano;
    });
  }, [daAba, busca, decada, ordem]);

  /* O que encolhe a lista — é o que justifica o "de N" no contador. */
  const filtroAtivo = busca.trim().length > 0 || decada !== TODOS;
  /* A ordenação não filtra nada, mas também volta ao padrão no botão. */
  const temQueLimpar = filtroAtivo || ordem !== "recentes";

  /* Trocar de aba começa do zero: os filtros eram da aba anterior. */
  const escolherAba = (proxima: TipoNorma | null) => {
    setFoco(null);
    setBusca("");
    setDecada(TODOS);
    setOrdem("recentes");
    setAba(proxima);
  };

  const buscar = (termo: string) => {
    setFoco(null);
    setBusca(termo);
  };

  const limparFiltros = () => {
    setFoco(null);
    setBusca("");
    setDecada(TODOS);
    setOrdem("recentes");
  };

  /*
   * Clique numa barra: leva à lei orçamentária daquele exercício. Como a LOA do
   * exercício X é de X−1, a lei costuma trazer outro ano no cabeçalho.
   */
  const irParaExercicio = (rotulo: string | number | undefined) => {
    const exercicio = Number(rotulo);
    const normaId = normaPorExercicio.get(exercicio);
    if (!normaId) return;
    /* Clicar de novo no mesmo exercício desfaz o destaque. */
    if (foco?.exercicio === exercicio) {
      setFoco(null);
      return;
    }
    /* Se os filtros escondem o destino, não adianta rolar até ele. */
    if (!filtradas.some((n) => n.id === normaId)) limparFiltros();
    setFoco({ normaId, exercicio });
  };

  const primeiroExercicio = serieLOAReal[0]?.exercicio;
  const ultimo = serieLOAReal[serieLOAReal.length - 1];

  const IconeAba = aba ? ICONES_NORMA[aba] : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Histórico"
        descricao="O acervo normativo do OCAD no Acre e o orçamento apurado em cada lei orçamentária."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          titulo="Normas mapeadas"
          valor={metaLeis.normas}
          dica={`${metaLeis.porTipo["Lei Ordinária"]} leis, ${metaLeis.porTipo["Decreto"]} decretos, ${metaLeis.porTipo["Estrutura Administrativa"]} de estrutura`}
          icone={Scale}
        />
        <KpiCard
          titulo="Período coberto"
          valor={`${anosNormas[anosNormas.length - 1]}–${anosNormas[0]}`}
          dica={`${anosNormas[0] - anosNormas[anosNormas.length - 1]} anos de normas sobre criança e adolescente`}
          icone={CalendarRange}
        />
        <KpiCard
          titulo="Leis orçamentárias"
          valor={metaLeis.porTipo["LOA"] + metaLeis.porTipo["LDO"]}
          dica={`${metaLeis.porTipo["LOA"]} LOAs e ${metaLeis.porTipo["LDO"]} LDOs`}
          icone={Landmark}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Acervo normativo
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha um tipo de norma para ver a lista.
          </p>
        </div>

        <SeletorAbas selecionada={aba} onSelecionar={escolherAba} />
      </div>

      {aba && (
        <div className="flex animate-in flex-col gap-4 rounded-xl ring-1 ring-foreground/10 duration-300 fade-in-0 slide-in-from-bottom-4">
          <div
            className="flex flex-col gap-1 rounded-t-xl p-3"
            style={{
              background: `color-mix(in oklab, ${CORES_NORMA[aba]} 20%, var(--card))`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {IconeAba && <IconeAba aria-hidden className="size-5" />}
                <h3 className="text-base font-semibold">{aba}</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {metaLeis.porTipo[aba]} na planilha
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => escolherAba(null)}
                className="shrink-0"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {DESCRICOES_NORMA[aba]}
            </p>
          </div>

          <div className="flex flex-col gap-4 px-3 pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => buscar(e.target.value)}
                  placeholder="Buscar por número, ementa, órgão ou meta — por exemplo, OCAD"
                  aria-label={`Buscar em ${aba}`}
                  className="pl-9"
                />
                {busca.length > 0 && (
                  <button
                    type="button"
                    onClick={() => buscar("")}
                    aria-label="Limpar busca"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <Select value={decada} onValueChange={setDecada}>
                <SelectTrigger
                  aria-label="Filtrar por década"
                  className="h-9 w-full sm:w-[11rem]"
                >
                  <CalendarRange className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>
                    Todas as décadas ({daAba.length})
                  </SelectItem>
                  {decadas.map(([d, quantas]) => (
                    <SelectItem key={d} value={String(d)}>
                      Anos {d} ({quantas})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={ordem}
                onValueChange={(v) => setOrdem(v as Ordem)}
              >
                <SelectTrigger
                  aria-label="Ordenar"
                  className="h-9 w-full sm:w-[12rem]"
                >
                  <ArrowDownUp className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDENS).map(([valor, rotulo]) => (
                    <SelectItem key={valor} value={valor}>
                      {rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fixo, e não só quando há filtro: some ao ser usado é o tipo de
               * botão que a pessoa procura e não acha. Desabilitado já diz que
               * não há o que limpar. */}
              <Button
                variant="outline"
                onClick={limparFiltros}
                disabled={!temQueLimpar}
                className="h-9 w-full shrink-0 sm:w-auto"
              >
                <X className="size-4" />
                Limpar filtros
              </Button>
            </div>

            <p className="text-sm text-muted-foreground tabular-nums">
              {filtradas.length} {filtradas.length === 1 ? "norma" : "normas"}
              {filtroAtivo && ` de ${daAba.length}`}
            </p>

            {aba === "LOA" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    OCAD por exercício ({primeiroExercicio}
                    –{ultimo?.exercicio})
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        accessibilityLayer
                        data={serieComApuracao}
                        margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                        onClick={(estado) => irParaExercicio(estado?.activeLabel)}
                        className="cursor-pointer"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="exercicio"
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={48}
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
                          content={<TooltipLOA />}
                          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                        />
                        {/* Anotação, não série: fica fora da legenda e do
                          * tooltip da LOA, e não entra no empilhamento. São
                          * duas camadas porque as barras ficam no meio delas —
                          * a mancha em zIndex 100, atrás das barras (300), e o
                          * contorno em 350, à frente delas e atrás do eixo
                          * (500), para os rótulos de ano ficarem por cima. */}
                        <ReferenceArea
                          x1={PANDEMIA_INICIO}
                          x2={PANDEMIA_FIM}
                          shape={(props) => (
                            <MarcaPandemia {...props} camada="mancha" />
                          )}
                        />
                        <ReferenceArea
                          x1={PANDEMIA_INICIO}
                          x2={PANDEMIA_FIM}
                          zIndex={350}
                          shape={(props) => (
                            <MarcaPandemia {...props} camada="contorno" />
                          )}
                        />
                        {/* Uma barra por exercício: azul onde a apuração
                          * alcançou o texto da lei, cinza onde só existe a
                          * dotação dos órgãos da planilha. */}
                        <Bar
                          dataKey="valor"
                          name="OCAD por exercício"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive
                          animationDuration={900}
                        >
                          {serieComApuracao.map((p) => (
                            <Cell
                              key={p.exercicio}
                              fill={
                                semApuracao(p.exercicio)
                                  ? COR_SEM_APURACAO
                                  : COR_APURADO
                              }
                              fillOpacity={opacidadeBarra(p.exercicio)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* A legenda do recharts nomeia séries, não cores por
                    * barra: a distinção do exercício sem apuração precisa de
                    * linha própria, senão o cinza no gráfico fica sem tradução. */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="size-2.5 rounded-sm"
                        style={{ background: COR_APURADO }}
                      />
                      Com curadoria — OCAD apurado na lei
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="size-2.5 rounded-sm"
                        style={{ background: COR_SEM_APURACAO }}
                      />
                      Sem curadoria — dotação dos órgãos
                    </span>
                    <span className="tabular-nums">
                      {ocadPorExercicio.size} de {serieComApuracao.length}{" "}
                      exercícios apurados
                    </span>
                  </div>

                  {/* O informe fica à vista, sem depender do mouse: no celular
                    * não haveria hover, e a marca no gráfico precisa de legenda
                    * de qualquer jeito. A elipse ao lado do texto é a mesma do
                    * gráfico, para ninguém precisar adivinhar a ligação. */}
                  <div
                    className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
                    style={{
                      background:
                        "color-mix(in oklab, var(--destructive) 8%, var(--card))",
                    }}
                  >
                    <Info
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: "var(--destructive)" }}
                    />
                    <p className="leading-relaxed">
                      <span className="sr-only">Informação: </span>
                      {/* A mesma moldura do gráfico, inline antes do título: é
                        * o que liga o aviso à marca sem precisar de explicação. */}
                      <svg
                        aria-hidden
                        width="18"
                        height="12"
                        viewBox="0 0 18 12"
                        className="mr-1 inline-block align-middle"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="16"
                          height="10"
                          rx="3"
                          ry="3"
                          fill="none"
                          stroke="var(--destructive)"
                          strokeOpacity={0.75}
                          strokeWidth={1.5}
                          strokeDasharray="4 3"
                        />
                      </svg>
                      <span className="font-medium text-foreground">
                        {PANDEMIA_TITULO}.
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {PANDEMIA_TEXTO}
                      </span>
                    </p>
                  </div>
                  {/* Nota de leitura: só o ícone e o texto. O realce fica com o
                    * aviso da pandemia, que é alerta; isto aqui é rodapé. */}
                  <div className="flex items-start gap-2 px-1 py-1 text-xs leading-relaxed text-muted-foreground">
                    <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p>
                        <span className="sr-only">Informação: </span>
                        Cada barra é o OCAD apurado na lei do exercício: as
                        unidades de ensino, do ISE e da infância somadas inteiras,
                        mais as ações cujo nome traz um dos descritores (menino,
                        menina, criança, adolescente, adolescência, infância,
                        infantil, juventude, filho e filhos). O período de 1995 a
                        2009 ainda não passou por curadoria — seus anexos são
                        anteriores à publicação eletrônica do Diário Oficial e
                        existem apenas em versões físicas. Nele a barra traz a
                        dotação total dos órgãos.
                      </p>
                      <p>
                        Clique numa barra para ir à lei do exercício — sancionada
                        no ano anterior, ela traz outra data no cabeçalho. Valores
                        nominais, sem correção pela inflação.
                      </p>
                    </div>
                  </div>

                  {/*
                   * Os quatro primeiros exercícios ficam em gráfico próprio:
                   * convertidos, somem rentes ao eixo da série principal; em
                   * cruzeiro nominal, esmagariam a série. Com escala só deles,
                   * o valor em real fica legível e comparável entre os quatro.
                   */}
                  {MOSTRAR_EXERCICIOS_EM_CRUZEIRO && (
                    <div className="mt-2 flex flex-col gap-2 border-t pt-4">
                      <h4 className="text-sm font-semibold">
                        Antes do real — exercícios de{" "}
                        {exerciciosEmCruzeiro[0]?.exercicio} a{" "}
                        {
                          exerciciosEmCruzeiro[exerciciosEmCruzeiro.length - 1]
                            ?.exercicio
                        }
                        , convertidos para real
                      </h4>
                      <BarrasCruzeiro
                        pontos={exerciciosEmCruzeiro}
                        opacidade={opacidadeBarra}
                        onEscolher={irParaExercicio}
                      />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Exercícios fixados em cruzeiro, convertidos para real
                        pelos cortes monetários (Cr$ → CR$ → R$) e sem correção
                        pela inflação — por isso ficam em escala própria, e não
                        na do gráfico acima, onde sumiriam rentes ao eixo. A
                        escala é logarítmica: cada dobro de comprimento vale dez
                        vezes mais, o único jeito de as quatro barras caberem
                        juntas. O salto de{" "}
                        {
                          exerciciosEmCruzeiro[exerciciosEmCruzeiro.length - 1]
                            ?.exercicio
                        }{" "}
                        é a hiperinflação, não crescimento da política. Clique
                        numa barra para ir até a lei correspondente.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <ListaNormas normas={filtradas} normaFoco={foco?.normaId ?? null} />
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Fonte: <span className="font-medium">{metaLeis.arquivoFonte}</span> —{" "}
        {metaLeis.origem}. Arquivo de {metaLeis.dataArquivo}
        {metaLeis.atualizadoEm
          ? `, atualizado na origem em ${metaLeis.atualizadoEm}`
          : ""}
        , com {metaLeis.normas} normas. {metaLeis.observacoes.join(" ")}
      </p>
    </div>
  );
}
