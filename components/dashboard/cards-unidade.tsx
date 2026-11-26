"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormat, useLocale, useT } from "@/lib/i18n";
import {
  SERIES_COLORS,
  corSecretaria,
  getRotulosEstagio,
  nomeUnidade,
} from "@/lib/estagios";
import type { AgregadoUnidade } from "@/data/base-ocad";
import { cn } from "@/lib/utils";

const ESTAGIOS_EXTRA = ["ocadEmpenhado", "ocadPago"] as const;

function CardUnidade({ dados }: { dados: AgregadoUnidade }) {
  const t = useT();
  const { locale } = useLocale();
  const { formatMoeda, formatPercent } = useFormat();
  const rotulosEstagio = getRotulosEstagio(locale);
  const [expandido, setExpandido] = React.useState(false);

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
      className="gap-3 py-3.5 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/25"
      style={{
        borderTop: `3px solid ${cor}`,
        backgroundColor: `color-mix(in oklab, ${cor} 26%, var(--card))`,
      }}
    >
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
        aria-label={
          expandido
            ? t.painel.mostrarNome(dados.rotulo)
            : t.painel.mostrarValores(dados.rotulo)
        }
        className="flex w-full cursor-pointer flex-col gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <CardHeader className="w-full gap-1 px-4 py-0">
          <div className="flex items-baseline justify-between gap-2">
            <CardTitle className="truncate text-[13px] font-semibold tracking-tight text-foreground">
              {dados.rotulo}
            </CardTitle>
            <span
              title={t.painel.executadoAteAgora}
              className="shrink-0 text-xs font-semibold text-foreground tabular-nums"
            >
              {pctExec === null ? "—" : formatPercent(pctExec)}
            </span>
          </div>

          <p className="line-clamp-2 min-h-[2rem] text-xs leading-snug text-muted-foreground">
            {nome}
          </p>
        </CardHeader>

        <CardContent className="mt-auto flex w-full flex-col gap-2 px-4 py-0">
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">
                {rotulosEstagio.ocadAtualizado}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {formatMoeda(dados.ocadAtualizado)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">
                {rotulosEstagio.ocadLiquidado}
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {formatMoeda(dados.ocadLiquidado)}
              </span>
            </div>
          </div>

          <div
            aria-hidden
            className="h-1 w-full overflow-hidden rounded-full bg-foreground/10"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${larguraBarra}%`,
                backgroundColor: SERIES_COLORS.ocadLiquidado,
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground">
            <span>{t.painel.acoes(dados.acoes)}</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                expandido && "rotate-180",
              )}
            />
          </div>
        </CardContent>
      </button>

      {expandido && (
        <div className="flex flex-col gap-2.5 border-t border-foreground/10 px-4 pt-2.5 text-xs">
          <div className="flex flex-col gap-1">
            {ESTAGIOS_EXTRA.map((estagio) => (
              <div
                key={estagio}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="text-muted-foreground">
                  {rotulosEstagio[estagio]}
                </span>
                <span className="font-medium text-foreground tabular-nums">
                  {formatMoeda(dados[estagio])}
                </span>
              </div>
            ))}
          </div>

          {dados.listaAcoes.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-foreground/10 pt-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                {t.painel.acoesListaTitulo}
              </span>
              <ul className="flex max-h-56 flex-col divide-y divide-foreground/10 overflow-y-auto pr-1">
                {dados.listaAcoes.map((acao) => {
                  const pctAcao =
                    acao.ocadAtualizado > 0
                      ? acao.ocadLiquidado / acao.ocadAtualizado
                      : null;
                  return (
                    <li key={acao.id} className="py-1.5 first:pt-0 last:pb-0">
                      <p className="text-[11px] leading-snug text-foreground">
                        <span className="text-muted-foreground tabular-nums">
                          {acao.codigo}
                        </span>{" "}
                        {acao.nome}
                      </p>
                      <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
                        <span>
                          {formatMoeda(acao.ocadLiquidado)} /{" "}
                          {formatMoeda(acao.ocadAtualizado)}
                        </span>
                        <span className="shrink-0 font-medium text-foreground/80">
                          {pctAcao === null ? "—" : formatPercent(pctAcao)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Um card por unidade orçamentária, no mesmo recorte que o BI usa nos filtros —
 * um órgão aparece em mais de um card quando executa por fundos distintos.
 * Exibe de frente os valores atualizado e liquidado com barra de execução, e
 * expande ao clique para mostrar empenhado, pago e a lista de ações da unidade.
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
