"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoeda } from "@/lib/format";
import {
  ESTAGIOS_SECRETARIA,
  ROTULOS_ESTAGIO,
  SERIES_COLORS,
  corSecretaria,
  nomeUnidade,
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
  // O card abre pelo nome: a identidade vem primeiro e os valores aparecem ao
  // clicar.
  const [mostrandoValores, setMostrandoValores] = React.useState(false);
  // Tom da secretaria: unidades do mesmo órgão se reconhecem pela cor.
  const cor = corSecretaria(dados.secretaria);
  // Unidade principal do órgão não tem nome na planilha: mostra o da secretaria.
  const nome = nomeUnidade(dados.unidade, dados.secretaria);

  // Sempre no verso: gira meia volta para ficar legível com o card virado.
  const faceValores = (
    <Card
      className="h-full gap-3 overflow-hidden"
      style={{
        ...FACE,
        transform: "rotateY(180deg)",
        // Mesma tarja da frente, para as duas faces se lerem como um card só.
        borderTop: `3px solid ${cor}`,
      }}
      aria-hidden={!mostrandoValores}
    >
      <CardHeader className="gap-0.5">
        <CardTitle className="text-base">{dados.rotulo}</CardTitle>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {nome}
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

  return (
    <div className="relative h-full" style={{ perspective: 1200 }}>
      <button
        type="button"
        onClick={() => setMostrandoValores((v) => !v)}
        aria-pressed={mostrandoValores}
        aria-label={
          mostrandoValores
            ? `Mostrar o nome de ${dados.rotulo}`
            : `Mostrar os valores de ${dados.rotulo}`
        }
        className="relative grid h-full w-full cursor-pointer rounded-xl text-left transition-transform duration-500 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: mostrandoValores ? "rotateY(180deg)" : undefined,
        }}
      >
        <Card
          className="h-full min-h-36 gap-3 overflow-hidden"
          style={{
            ...FACE,
            // Tom da secretaria diluído no fundo do card: forte o bastante para
            // separar um órgão do outro, fraco o bastante para o texto seguir
            // legível nos dois temas.
            background: `color-mix(in oklab, ${cor} 18%, var(--card))`,
            borderTop: `3px solid ${cor}`,
          }}
          aria-hidden={mostrandoValores}
        >
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center">
            <span className="text-lg font-semibold tracking-tight text-balance">
              {dados.rotulo}
            </span>
            <span className="line-clamp-3 text-xs leading-snug text-balance text-muted-foreground">
              {nome}
            </span>
          </CardContent>
        </Card>

        {faceValores}
      </button>
    </div>
  );
}

/**
 * Um card por unidade orçamentária, no mesmo recorte que o BI usa nos filtros —
 * um órgão aparece em mais de um card quando executa por fundos distintos.
 * Cada card abre pelo nome, no tom da secretaria, e vira ao clique para
 * mostrar os valores.
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
