"use client";

import * as React from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoeda } from "@/lib/format";
import {
  ESTAGIOS_SECRETARIA,
  ROTULOS_ESTAGIO,
  SERIES_COLORS,
  logoUnidade,
} from "@/lib/estagios";
import type { AgregadoUnidade } from "@/data/base-ocad";

const FACE: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  // Empilha as duas faces na mesma célula do grid. Diferente de position
  // absolute, isso deixa o card crescer conforme o conteúdo e continuar se
  // esticando junto com os vizinhos da linha.
  gridArea: "1 / 1",
};

function CardUnidade({ dados }: { dados: AgregadoUnidade }) {
  // O card abre pelo logotipo: a identidade vem primeiro e os valores aparecem
  // ao clicar.
  const [mostrandoValores, setMostrandoValores] = React.useState(false);
  // Arte própria da unidade quando existir; senão, a da secretaria.
  const logo = logoUnidade(dados.chave, dados.secretaria);

  // `girada` só é verdadeira quando esta face fica no verso do cartão.
  const faceValores = (girada: boolean) => (
    <Card
      className="h-full gap-3 overflow-hidden"
      style={girada ? { ...FACE, transform: "rotateY(180deg)" } : FACE}
      aria-hidden={girada && !mostrandoValores}
    >
      <CardHeader className="gap-0.5">
        <CardTitle className="text-base">{dados.rotulo}</CardTitle>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {dados.unidade}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {ESTAGIOS_SECRETARIA.map((estagio) => (
          <div key={estagio} className="flex items-baseline justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: SERIES_COLORS[estagio] }}
              />
              {ROTULOS_ESTAGIO[estagio]}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatMoeda(dados[estagio])}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Sem logotipo não há o que mostrar de início: o card não vira e já abre
  // pelos valores, em vez de exibir um verso vazio.
  if (!logo) {
    return <div className="grid h-full">{faceValores(false)}</div>;
  }

  return (
    <div className="relative h-full" style={{ perspective: 1200 }}>
      <button
        type="button"
        onClick={() => setMostrandoValores((v) => !v)}
        aria-pressed={mostrandoValores}
        aria-label={
          mostrandoValores
            ? `Mostrar o logotipo de ${dados.rotulo}`
            : `Mostrar os valores de ${dados.rotulo}`
        }
        className="relative grid h-full w-full cursor-pointer rounded-xl text-left transition-transform duration-500 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: mostrandoValores ? "rotateY(180deg)" : undefined,
        }}
      >
        <Card
          className="h-full gap-3 overflow-hidden bg-card"
          style={FACE}
          aria-hidden={mostrandoValores}
        >
          {/* Sem recuo lateral: as tarjas tipográficas são limitadas pela
              largura, não pela altura, então os 16px de cada lado do
              CardContent saíam direto do tamanho do logotipo. O rótulo mantém
              o recuo por conta própria. */}
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-3 px-0">
            <div className="relative h-28 w-full">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(max-width: 640px) 95vw, (max-width: 1280px) 32vw, 24vw"
                className="object-contain"
              />
            </div>
            <span className="px-4 text-center text-sm font-medium">
              {dados.rotulo}
            </span>
          </CardContent>
        </Card>

        {/* Valores no verso: giram meia volta para ficarem legíveis quando o
            card estiver virado. */}
        {faceValores(true)}
      </button>
    </div>
  );
}

/**
 * Um card por unidade orçamentária, no mesmo recorte que o BI usa nos filtros —
 * um órgão aparece em mais de um card quando executa por fundos distintos.
 * Cada card abre pelo logotipo e vira ao clique para mostrar os valores.
 */
export function CardsUnidade({ data }: { data: AgregadoUnidade[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma unidade corresponde aos filtros selecionados.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((d) => (
        <CardUnidade key={d.chave} dados={d} />
      ))}
    </div>
  );
}
