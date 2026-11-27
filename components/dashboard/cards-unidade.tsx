"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormat, useLocale, useT } from "@/lib/i18n";
import {
  ESTAGIOS_SECRETARIA,
  SERIES_COLORS,
  corSecretaria,
  getRotulosEstagio,
  nomeUnidade,
} from "@/lib/estagios";
import type { AgregadoUnidade } from "@/data/base-ocad";
import { cn } from "@/lib/utils";

const DURACAO_DIGITACAO_MS = 850;

function TextoDigitado({
  texto,
  tempo,
  inicioMs,
  duracaoMs,
  inline = false,
  className,
}: {
  texto: string;
  tempo: number;
  inicioMs: number;
  duracaoMs: number;
  inline?: boolean;
  className?: string;
}) {
  const progresso = Math.min(Math.max((tempo - inicioMs) / duracaoMs, 0), 1);
  const visivel = texto.slice(0, Math.floor(progresso * texto.length));
  const digitando = progresso > 0 && progresso < 1;

  return (
    <span
      className={cn("relative", inline ? "inline-block" : "block", className)}
    >
      <span aria-hidden className="invisible">
        {texto}
      </span>
      <span className={cn("absolute inset-0", inline && "whitespace-nowrap")}>
        {visivel}
        {digitando && (
          <span
            aria-hidden
            className="ml-px inline-block h-[0.9em] w-[1.5px] translate-y-[0.1em] bg-foreground/70"
          />
        )}
      </span>
    </span>
  );
}

function CardUnidade({ dados }: { dados: AgregadoUnidade }) {
  const t = useT();
  const { locale } = useLocale();
  const { formatMoeda, formatPercent } = useFormat();
  const rotulosEstagio = getRotulosEstagio(locale);
  const [expandido, setExpandido] = React.useState(false);
  const [tempo, setTempo] = React.useState(0);

  React.useEffect(() => {
    if (!expandido) return;

    const reduzido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let rafId = 0;
    let inicio: number | null = null;

    const passo = (agora: number) => {
      if (reduzido) {
        setTempo(DURACAO_DIGITACAO_MS);
        return;
      }
      if (inicio === null) inicio = agora;
      const decorrido = Math.min(agora - inicio, DURACAO_DIGITACAO_MS);
      setTempo(decorrido);
      if (decorrido < DURACAO_DIGITACAO_MS) {
        rafId = requestAnimationFrame(passo);
      }
    };

    rafId = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(rafId);
  }, [expandido]);

  const cor = corSecretaria(dados.secretaria);
  const nome = nomeUnidade(dados.unidade, dados.secretaria);
  const pctExec =
    dados.ocadAtualizado > 0
      ? dados.ocadLiquidado / dados.ocadAtualizado
      : null;
  const larguraBarra =
    pctExec !== null ? Math.min(Math.max(pctExec * 100, 0), 100) : 0;

  return (
    <Card
      className="gap-0 py-0 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/25"
      style={{
        backgroundColor: `color-mix(in oklab, ${cor} 26%, var(--card))`,
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (!expandido) setTempo(0);
          setExpandido((v) => !v);
        }}
        aria-expanded={expandido}
        aria-label={
          expandido
            ? t.painel.mostrarNome(dados.rotulo)
            : t.painel.mostrarValores(dados.rotulo)
        }
        className="flex w-full cursor-pointer flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div
          className="flex w-full items-baseline justify-between gap-2 border-b border-foreground/10 px-4 py-2.5"
          style={{
            backgroundColor: `color-mix(in oklab, ${cor} 72%, var(--card))`,
          }}
        >
          <CardTitle className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            {dados.rotulo}
          </CardTitle>
          <span
            title={t.painel.executadoAteAgora}
            className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-foreground tabular-nums"
          >
            {pctExec === null ? "—" : formatPercent(pctExec)}
            <ChevronDown
              className={cn(
                "size-3.5 text-foreground/75 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                expandido && "rotate-180",
              )}
            />
          </span>
        </div>

        <CardHeader className="w-full gap-1 px-4 py-2.5">
          <p className="min-h-[2rem] text-xs leading-snug text-muted-foreground">
            {nome}
          </p>
        </CardHeader>
      </button>

      <div
        aria-hidden={!expandido}
        className={cn(
          "grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          expandido
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="flex flex-col gap-2.5 border-t border-foreground/10 px-4 pt-3 pb-3.5 text-xs">
            <div className="flex flex-col gap-1">
              {ESTAGIOS_SECRETARIA.map((estagio, idx) => (
                <div
                  key={estagio}
                  className={cn(
                    "flex items-baseline justify-between gap-2 transition-all duration-300 ease-out motion-reduce:transition-none",
                    expandido
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0",
                  )}
                  style={{
                    transitionDelay: expandido ? `${idx * 40}ms` : "0ms",
                  }}
                >
                  <TextoDigitado
                    inline
                    texto={rotulosEstagio[estagio]}
                    tempo={tempo}
                    inicioMs={40 + idx * 50}
                    duracaoMs={180}
                    className="text-muted-foreground"
                  />
                  <TextoDigitado
                    inline
                    texto={formatMoeda(dados[estagio])}
                    tempo={tempo}
                    inicioMs={60 + idx * 50}
                    duracaoMs={190}
                    className={cn(
                      "text-foreground tabular-nums",
                      estagio === "ocadLiquidado"
                        ? "font-semibold"
                        : "font-medium",
                    )}
                  />
                </div>
              ))}
            </div>

            <div
              aria-hidden
              className="h-1 w-full overflow-hidden rounded-full bg-foreground/10"
            >
              <div
                className="h-full rounded-full transition-[width] delay-150 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{
                  width: expandido ? `${larguraBarra}%` : "0%",
                  backgroundColor: SERIES_COLORS.ocadLiquidado,
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5 border-t border-foreground/10 pt-2">
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-medium text-muted-foreground">
                <TextoDigitado
                  inline
                  texto={t.painel.acoesListaTitulo}
                  tempo={tempo}
                  inicioMs={240}
                  duracaoMs={140}
                />
                <TextoDigitado
                  inline
                  texto={t.painel.acoes(dados.acoes)}
                  tempo={tempo}
                  inicioMs={260}
                  duracaoMs={150}
                  className="tabular-nums"
                />
              </div>

              {dados.listaAcoes.length > 0 && (
                <ul className="flex max-h-56 flex-col divide-y divide-foreground/10 overflow-y-auto pr-1">
                  {dados.listaAcoes.map((acao, idx) => {
                    const pctAcao =
                      acao.ocadAtualizado > 0
                        ? acao.ocadLiquidado / acao.ocadAtualizado
                        : null;
                    const idxEscalonado = Math.min(idx, 5);
                    const inicioItem = 290 + idxEscalonado * 55;
                    const tituloAcao = `${acao.codigo} ${acao.nome}`;
                    const valoresAcao = `${formatMoeda(acao.ocadLiquidado)} / ${formatMoeda(acao.ocadAtualizado)}`;
                    const pctTexto =
                      pctAcao === null ? "—" : formatPercent(pctAcao);

                    return (
                      <li
                        key={acao.id}
                        className={cn(
                          "py-1.5 transition-all duration-300 ease-out first:pt-0 last:pb-0 motion-reduce:transition-none",
                          expandido
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-1 opacity-0",
                        )}
                        style={{
                          transitionDelay: expandido
                            ? `${180 + idxEscalonado * 40}ms`
                            : "0ms",
                        }}
                      >
                        <p className="text-[11px] leading-snug text-foreground">
                          <TextoDigitado
                            texto={tituloAcao}
                            tempo={tempo}
                            inicioMs={inicioItem}
                            duracaoMs={250}
                          />
                        </p>
                        <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
                          <TextoDigitado
                            inline
                            texto={valoresAcao}
                            tempo={tempo}
                            inicioMs={inicioItem + 40}
                            duracaoMs={200}
                          />
                          <TextoDigitado
                            inline
                            texto={pctTexto}
                            tempo={tempo}
                            inicioMs={inicioItem + 70}
                            duracaoMs={140}
                            className="shrink-0 font-medium text-foreground/80"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

/**
 * Um card por unidade orçamentária, no mesmo recorte que o BI usa nos filtros —
 * um órgão aparece em mais de um card quando executa por fundos distintos.
 * Exibe apenas unidade, percentual de execução e nome completo quando recolhido,
 * e abre ao clique para mostrar todos os estágios, barra de progresso e ações.
 */
export function CardsUnidade({ data }: { data: AgregadoUnidade[] }) {
  const t = useT();

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {t.painel.nenhumaUnidade}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((d) => (
        <CardUnidade key={d.chave} dados={d} />
      ))}
    </div>
  );
}
