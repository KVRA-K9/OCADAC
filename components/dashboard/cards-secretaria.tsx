"use client";

import * as React from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoeda } from "@/lib/format";
import {
  ESTAGIOS_SECRETARIA,
  ROTULOS_ESTAGIO,
  SERIES_COLORS,
  logoOrgao,
  siglaOrgao,
} from "@/lib/estagios";
import type { AgregadoOrgao } from "@/data/base-ocad";

const FACE: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  // Empilha as duas faces na mesma célula do grid. Diferente de position
  // absolute, isso deixa o card crescer conforme o conteúdo e continuar se
  // esticando junto com os vizinhos da linha — o dimensionamento que ele tinha
  // antes de virar flashcard.
  gridArea: "1 / 1",
};

function CardOrgao({ dados }: { dados: AgregadoOrgao }) {
  // O card abre pelo logotipo: a identidade da secretaria vem primeiro e os
  // valores aparecem ao clicar.
  const [mostrandoValores, setMostrandoValores] = React.useState(false);
  const logo = logoOrgao(dados.orgao);
  const sigla = siglaOrgao(dados.orgao);

  // `girada` só é verdadeira quando esta face fica no verso do cartão.
  const faceValores = (girada: boolean) => (
    <Card
      className="h-full gap-3 overflow-hidden"
      style={girada ? { ...FACE, transform: "rotateY(180deg)" } : FACE}
      aria-hidden={girada && !mostrandoValores}
    >
      <CardHeader className="gap-0.5">
        <CardTitle className="text-base">{sigla}</CardTitle>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {dados.orgao}
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
            ? `Mostrar o logotipo de ${sigla}`
            : `Mostrar os valores de ${sigla}`
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
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-3">
            {/* A caixa tem a mesma proporção da tela gerada por `npm run
                logos`, então a imagem a preenche por inteiro e o fundo branco
                das ilustrações vira uma plaquinha de cantos arredondados, igual
                em todos os cards. */}
            <div className="relative aspect-[4/3] h-28 overflow-hidden rounded-lg">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <span className="text-center text-xs leading-snug text-muted-foreground">
              {dados.orgao}
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
 * Um card por secretaria com os estágios da despesa. Substitui o gráfico de
 * barras por órgão: os mesmos valores que antes só apareciam no tooltip ficam
 * visíveis de imediato. Onde há logotipo, o card vira ao ser clicado.
 */
export function CardsSecretaria({ data }: { data: AgregadoOrgao[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma secretaria corresponde aos filtros selecionados.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((d) => (
        <CardOrgao key={d.orgao} dados={d} />
      ))}
    </div>
  );
}
