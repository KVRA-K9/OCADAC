"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoeda } from "@/lib/format";
import type { OrcamentoItem } from "@/lib/types";

type Dir = "asc" | "desc";

interface Coluna {
  key: string;
  label: string;
  accessor: (i: OrcamentoItem) => number | string;
  render: (i: OrcamentoItem) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

const COLUNAS: Coluna[] = [
  { key: "orgao", label: "Órgão", accessor: (i) => i.orgao, render: (i) => i.orgao },
  {
    key: "categoriaEconomica",
    label: "Classificação",
    accessor: (i) => i.categoriaEconomica,
    render: (i) => i.categoriaEconomica,
  },
  {
    key: "ocadInicial",
    label: "OCAD Inicial",
    accessor: (i) => i.valores.ocadInicial,
    render: (i) => formatMoeda(i.valores.ocadInicial),
    align: "right",
  },
  {
    key: "ocadAtualizado",
    label: "OCAD Atualizado",
    accessor: (i) => i.valores.ocadAtualizado,
    render: (i) => formatMoeda(i.valores.ocadAtualizado),
    align: "right",
  },
  {
    key: "ocadLiquidado",
    label: "OCAD Liquidado",
    accessor: (i) => i.valores.ocadLiquidado,
    render: (i) => formatMoeda(i.valores.ocadLiquidado),
    align: "right",
  },
  {
    key: "ocadDisponivel",
    label: "OCAD Disponível",
    accessor: (i) => i.valores.ocadDisponivel,
    render: (i) => formatMoeda(i.valores.ocadDisponivel),
    align: "right",
  },
  { key: "funcao", label: "Eixo", accessor: (i) => i.funcao, render: (i) => i.funcao },
  { key: "ano", label: "Ano", accessor: (i) => i.ano, render: (i) => i.ano },
  { key: "acao", label: "Ação", accessor: (i) => i.acao, render: (i) => i.acao },
  { key: "programa", label: "Programa", accessor: (i) => i.programa, render: (i) => i.programa },
];

const TAMANHO_PAGINA = 10;

function comparar(a: number | string, b: number | string): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR");
}

export function DataTable({ data }: { data: OrcamentoItem[] }) {
  const [sortKey, setSortKey] = React.useState<string>("ano");
  const [dir, setDir] = React.useState<Dir>("desc");
  const [pagina, setPagina] = React.useState(0);

  const ordenado = React.useMemo(() => {
    const coluna = COLUNAS.find((c) => c.key === sortKey) ?? COLUNAS[0];
    return [...data].sort((a, b) => {
      const r = comparar(coluna.accessor(a), coluna.accessor(b));
      return dir === "asc" ? r : -r;
    });
  }, [data, sortKey, dir]);

  const totalPaginas = Math.max(1, Math.ceil(ordenado.length / TAMANHO_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaAtual * TAMANHO_PAGINA;
  const paginaDados = ordenado.slice(inicio, inicio + TAMANHO_PAGINA);

  const alternarSort = (key: string) => {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("asc");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {COLUNAS.map((c) => {
                const ativo = c.key === sortKey;
                return (
                  <TableHead
                    key={c.key}
                    className={cn(c.align === "right" && "text-right")}
                  >
                    <button
                      type="button"
                      onClick={() => alternarSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                        c.align === "right" && "flex-row-reverse",
                        ativo && "text-foreground",
                      )}
                    >
                      {c.label}
                      {ativo ? (
                        dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginaDados.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUNAS.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              paginaDados.map((item) => (
                <TableRow key={item.id}>
                  {COLUNAS.map((c) => (
                    <TableCell
                      key={c.key}
                      className={cn(
                        c.align === "right" && "text-right tabular-nums",
                        c.className,
                      )}
                    >
                      {c.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {ordenado.length === 0
            ? "0 registros"
            : `Mostrando ${inicio + 1}–${Math.min(
                inicio + TAMANHO_PAGINA,
                ordenado.length,
              )} de ${ordenado.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={paginaAtual === 0}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="tabular-nums">
            {paginaAtual + 1} / {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Próxima página"
            disabled={paginaAtual >= totalPaginas - 1}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
