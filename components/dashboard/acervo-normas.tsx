"use client";

import * as React from "react";
import { ChevronRight, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCruzeiroMil, formatMoeda } from "@/lib/format";
import { CORES_NORMA, ICONES_NORMA } from "@/lib/normas";
import {
  TIPOS_NORMA,
  metaLeis,
  type Norma,
  type TipoNorma,
} from "@/data/historico-leis";

const dataBR = (iso: string) => iso.split("-").reverse().join("/");

function Detalhe({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {rotulo}
      </span>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ValoresLOA({ norma }: { norma: Norma }) {
  const loa = norma.loa;
  if (!loa) return null;

  /*
   * Antes do real, o valor que vale é o que a lei fixou, em cruzeiro. A
   * conversão pelos cortes monetários vira nota de rodapé: sozinha, ela diz que
   * o exercício de 1991 foram R$ 1.643, o que não significa nada. Nesses quatro
   * exercícios não há divisão por fonte — outras fontes são zero em todos.
   */
  if (loa.moedaOriginal === "Cr$") {
    return (
      <Detalhe rotulo="Dotação na lei">
        <div className="flex flex-col gap-0.5">
          <span className="tabular-nums">
            Total fixado na lei:{" "}
            <strong>{formatCruzeiroMil(loa.totalOriginal)}</strong>
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            Equivale a {formatMoeda(loa.total)} pelos cortes monetários (Cr$ →
            CR$ → R$), sem correção pela inflação.
          </span>
        </div>
      </Detalhe>
    );
  }

  return (
    <Detalhe rotulo="Dotação na lei">
      <div className="flex flex-col gap-0.5 tabular-nums">
        <span>
          Recursos próprios: <strong>{formatMoeda(loa.rp)}</strong>
        </span>
        <span>
          Outras fontes: <strong>{formatMoeda(loa.outrasFontes)}</strong>
        </span>
        <span>
          Total: <strong>{formatMoeda(loa.total)}</strong>
        </span>
      </div>
    </Detalhe>
  );
}

function CartaoNorma({
  norma,
  destacado = false,
}: {
  norma: Norma;
  /** Alvo de um clique no gráfico: abre sozinho e ganha anel. */
  destacado?: boolean;
}) {
  const [aberto, setAberto] = React.useState(false);

  /* Ajuste durante a renderização: virou alvo do gráfico, abre; deixou de ser,
   * fecha — o segundo clique na barra desfaz o destaque e o cartão que ele abriu
   * na mesma tacada. Entre um e outro, o clique no cabeçalho manda. */
  const [eraDestacado, setEraDestacado] = React.useState(destacado);
  if (destacado !== eraDestacado) {
    setEraDestacado(destacado);
    setAberto(destacado);
  }

  const cor = CORES_NORMA[norma.tipo];

  return (
    <div
      data-norma-id={norma.id}
      /*
       * Sem contorno, o cartão precisa de fundo próprio para existir: no tema
       * claro `--card` e `--background` são o mesmo branco, e um cartão branco
       * sobre página branca some. O fundo é a cor do tipo da norma lavada no
       * `--card`, a mesma receita do botão da aba em `SeletorAbas` — a lista só
       * existe depois de escolher uma aba, então o painel inteiro fica na cor do
       * seletor que o abriu. Em variável, e não em `background` direto, porque o
       * hover precisa de uma segunda mistura. A sombra sutil separa um cartão do
       * outro sem desenhar linha, e o anel continua reservado ao cartão que o
       * gráfico destaca, onde ele tem função.
       */
      style={
        {
          "--tinta": `color-mix(in oklab, ${cor} 25%, var(--card))`,
          "--tinta-forte": `color-mix(in oklab, ${cor} 40%, var(--card))`,
        } as React.CSSProperties
      }
      className={cn(
        "mb-2 break-inside-avoid rounded-lg bg-(--tinta) shadow-sm transition-all hover:bg-(--tinta-forte) hover:shadow-md",
        destacado && "bg-(--tinta-forte) shadow-md ring-2 ring-ring",
      )}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full cursor-pointer items-start gap-2 p-3 text-left focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ChevronRight
          aria-hidden
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            aberto && "rotate-90",
          )}
        />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">
              {norma.especie} nº {norma.numero}
            </span>
            {norma.data && (
              <span className="text-xs text-muted-foreground">
                {dataBR(norma.data)}
              </span>
            )}
            {norma.exercicio && (
              <span className="text-xs text-muted-foreground">
                · exercício {norma.exercicio}
              </span>
            )}
            {norma.quadrienio && (
              <span className="text-xs text-muted-foreground">
                · {norma.quadrienio[0]}–{norma.quadrienio[1]}
              </span>
            )}
          </span>
          <span
            className={cn(
              "text-sm leading-snug text-muted-foreground",
              !aberto && "line-clamp-2",
            )}
          >
            {norma.ementa}
          </span>
        </span>
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 border-t px-3 py-3 pl-9">
          {norma.publicacao && (
            <Detalhe rotulo="Publicação no DOE">
              {dataBR(norma.publicacao)}
            </Detalhe>
          )}
          {norma.link && (
            <Detalhe rotulo="Texto da norma">
              <a
                href={norma.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-foreground underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {norma.link.replace(/^https?:\/\//, "")}
                <ExternalLink aria-hidden className="size-3.5 shrink-0" />
              </a>
            </Detalhe>
          )}
          {norma.orgaos && <Detalhe rotulo="Órgãos">{norma.orgaos}</Detalhe>}
          {(norma.abas?.length ?? 0) > 1 && (
            /* A norma está em mais de uma aba da planilha e é contada uma vez
             * só; sem esta linha, quem procurasse na outra aba não a acharia. */
            <Detalhe rotulo="Abas da planilha">
              {norma.abas?.join(" · ")} — contada uma única vez no acervo
            </Detalhe>
          )}
          {norma.citacoes && (
            <Detalhe rotulo="Citações (criança/adolescente)">
              {norma.citacoes}
            </Detalhe>
          )}
          <ValoresLOA norma={norma} />
          {norma.metas.length > 0 && (
            <Detalhe rotulo="Metas e prioridades">
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {norma.metas.map((meta, i) => (
                  <li key={i}>{meta}</li>
                ))}
              </ul>
            </Detalhe>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * As seis abas da planilha de origem, uma por tipo de norma. Só uma fica aberta
 * por vez — o mesmo gesto da grade de ODS.
 */
export function SeletorAbas({
  selecionada,
  onSelecionar,
}: {
  selecionada: TipoNorma | null;
  onSelecionar: (aba: TipoNorma | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {TIPOS_NORMA.map((tipo) => {
        const ativo = selecionada === tipo;
        const cor = CORES_NORMA[tipo];
        const Icone = ICONES_NORMA[tipo];
        return (
          <button
            key={tipo}
            type="button"
            onClick={() => onSelecionar(ativo ? null : tipo)}
            aria-pressed={ativo}
            style={{
              background: `color-mix(in oklab, ${cor} 25%, var(--card))`,
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl p-3 text-center ring-2 transition-all duration-200",
              ativo
                ? "scale-105 ring-primary"
                : "ring-transparent hover:scale-105 hover:ring-foreground/20",
            )}
          >
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full"
              style={{ background: cor }}
            >
              <Icone className="size-5 text-primary-foreground" />
            </span>
            <span className="text-xs leading-tight font-semibold">{tipo}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {metaLeis.porTipo[tipo]}{" "}
              {metaLeis.porTipo[tipo] === 1 ? "norma" : "normas"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * As normas da aba escolhida, da mais recente para a mais antiga — a ordem em
 * que `data/historico-leis.ts` já entrega o acervo.
 */
export function ListaNormas({
  normas,
  normaFoco = null,
}: {
  normas: Norma[];
  /** Norma para a qual rolar e destacar — vem do clique no gráfico da LOA. */
  normaFoco?: string | null;
}) {
  /* A rolagem agora é a da página, sem contêiner próprio: `scrollIntoView` é o
   * caminho direto. */
  React.useEffect(() => {
    if (!normaFoco) return;
    const alvo = document.querySelector<HTMLElement>(
      `[data-norma-id="${CSS.escape(normaFoco)}"]`,
    );
    alvo?.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [normaFoco]);

  if (normas.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma norma desta aba corresponde à busca.
      </p>
    );
  }

  /*
   * Colunas de texto, e não grade: numa grade, abrir um cartão estica a linha
   * inteira e deixa um vão branco do lado do cartão vizinho, que continua
   * fechado. Com `columns`, os cartões escorrem e o vão não existe.
   */
  return (
    <div className="columns-1 gap-2 xl:columns-2">
      {normas.map((norma) => (
        <CartaoNorma
          key={norma.id}
          norma={norma}
          destacado={norma.id === normaFoco}
        />
      ))}
    </div>
  );
}
