"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from "lucide-react";

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
import {
  ROTULOS_ESTAGIO,
  corSecretaria,
  nomeOrgao,
  nomeUnidade,
  siglaOrgao,
} from "@/lib/estagios";
import {
  agregarHierarquia,
  type NoAcao,
  type NoOrgao,
  type NoUnidade,
} from "@/data/base-ocad";
import type { OrcamentoItem, ValoresOrcamentarios } from "@/lib/types";

type Dir = "asc" | "desc";

/** Colunas de dinheiro, iguais nos três níveis — é o que alinha a leitura. */
const COLUNAS_VALOR = [
  "ocadInicial",
  "ocadAtualizado",
  "ocadEmpenhado",
  "ocadLiquidado",
  "ocadPago",
  "ocadDisponivel",
] as const satisfies readonly (keyof ValoresOrcamentarios)[];

type ChaveValor = (typeof COLUNAS_VALOR)[number];
/** `nome` ordena alfabeticamente; as demais, pelo valor da coluna. */
type ChaveSort = ChaveValor | "nome";

/** Total de colunas, para o `colSpan` do estado vazio. */
const TOTAL_COLUNAS = COLUNAS_VALOR.length + 4;

/**
 * Ordena os três níveis pelo mesmo critério. Só o nome e os valores são
 * ordenáveis: classificação, eixo e ano não existem nos níveis agregados.
 */
function ordenarArvore(
  orgaos: NoOrgao[],
  chave: ChaveSort,
  dir: Dir,
): NoOrgao[] {
  const sinal = dir === "asc" ? 1 : -1;

  function ordenar<T>(
    nos: T[],
    nome: (n: T) => string,
    valor: (n: T) => number,
  ): T[] {
    return [...nos].sort((a, b) =>
      chave === "nome"
        ? sinal * nome(a).localeCompare(nome(b), "pt-BR")
        : sinal * (valor(a) - valor(b)),
    );
  }

  return ordenar(
    orgaos.map((o) => ({
      ...o,
      unidades: ordenar(
        o.unidades.map((u) => ({
          ...u,
          acoes: ordenar(
            u.acoes,
            (a) => a.acao,
            (a) => a[chave as ChaveValor],
          ),
        })),
        (u) => u.rotulo,
        (u) => u[chave as ChaveValor],
      ),
    })),
    (o) => siglaOrgao(o.orgao),
    (o) => o[chave as ChaveValor],
  );
}

function CelulasValores({ no }: { no: ValoresOrcamentarios }) {
  return (
    <>
      {COLUNAS_VALOR.map((chave) => (
        <TableCell key={chave} className="text-right tabular-nums">
          {formatMoeda(no[chave])}
        </TableCell>
      ))}
    </>
  );
}

/** Botão que abre e fecha um nível. O `aria-expanded` também pinta a linha. */
function Expansor({
  aberto,
  aoAlternar,
  children,
  className,
}: {
  aberto: boolean;
  aoAlternar: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-expanded={aberto}
      className={cn(
        "flex w-full cursor-pointer items-start gap-1.5 text-left focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <ChevronRight
        aria-hidden
        className={cn(
          "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
          aberto && "rotate-90",
        )}
      />
      <span className="min-w-0">{children}</span>
    </button>
  );
}

/** Linhas filhas nascem com um deslize curto, para a abertura ficar legível. */
const ENTRADA =
  "animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none";

const CELULA_NOME = "max-w-[28rem] whitespace-normal";

function LinhaOrgao({
  orgao,
  aberto,
  aoAlternar,
}: {
  orgao: NoOrgao;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  return (
    <TableRow className="bg-muted/30">
      <TableCell
        className={cn(CELULA_NOME, "font-semibold")}
        style={{ borderLeft: `3px solid ${corSecretaria(orgao.orgao)}` }}
      >
        <Expansor aberto={aberto} aoAlternar={aoAlternar}>
          {siglaOrgao(orgao.orgao)}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {orgao.unidades.length} un. · {orgao.totalAcoes} ações
          </span>
          <span className="block text-xs font-normal text-muted-foreground">
            {nomeOrgao(orgao.orgao)}
          </span>
        </Expansor>
      </TableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <CelulasValores no={orgao} />
    </TableRow>
  );
}

function LinhaUnidade({
  unidade,
  secretaria,
  aberto,
  aoAlternar,
}: {
  unidade: NoUnidade;
  secretaria: string;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  return (
    <TableRow className={ENTRADA}>
      <TableCell className={cn(CELULA_NOME, "pl-6 font-medium")}>
        <Expansor aberto={aberto} aoAlternar={aoAlternar}>
          {unidade.rotulo}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {unidade.acoes.length} ações
          </span>
          <span className="block text-xs font-normal text-muted-foreground">
            {nomeUnidade(unidade.unidade, secretaria)}
          </span>
        </Expansor>
      </TableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <CelulasValores no={unidade} />
    </TableRow>
  );
}

function LinhaAcao({ acao }: { acao: NoAcao }) {
  return (
    <TableRow className={ENTRADA}>
      {/* Recuo alinhado ao texto da unidade, já que a ação não tem seta. */}
      <TableCell className={cn(CELULA_NOME, "pl-[3.6rem] text-sm")}>
        <span className="text-muted-foreground">{acao.acaoCodigo}</span>{" "}
        {acao.acao}
        <span className="block text-xs text-muted-foreground">
          {acao.programa}
        </span>
      </TableCell>
      <TableCell className="text-sm">{acao.categoriaEconomica}</TableCell>
      <TableCell className="text-sm">{acao.funcao}</TableCell>
      <TableCell className="text-sm tabular-nums">{acao.ano}</TableCell>
      <CelulasValores no={acao} />
    </TableRow>
  );
}

/**
 * Tabela detalhada em três níveis — órgão → unidade orçamentária → ação —, na
 * mesma divisão dos cards da visão geral. Cada nível abre para baixo e mostra
 * o de dentro, com as colunas de execução alinhadas em todos eles.
 */
export function DataTable({ data }: { data: OrcamentoItem[] }) {
  const [sortKey, setSortKey] = React.useState<ChaveSort>("ocadAtualizado");
  const [dir, setDir] = React.useState<Dir>("desc");
  const [abertos, setAbertos] = React.useState<ReadonlySet<string>>(new Set());

  const arvore = React.useMemo(
    () => ordenarArvore(agregarHierarquia(data), sortKey, dir),
    [data, sortKey, dir],
  );

  const chaves = React.useMemo(
    () =>
      arvore.flatMap((o) => [
        o.orgaoCodigo,
        ...o.unidades.map((u) => u.chave),
      ]),
    [arvore],
  );
  const tudoAberto = chaves.length > 0 && chaves.every((c) => abertos.has(c));

  const alternar = (chave: string) =>
    setAbertos((atual) => {
      const proximo = new Set(atual);
      if (!proximo.delete(chave)) proximo.add(chave);
      return proximo;
    });

  const alternarSort = (chave: ChaveSort) => {
    if (chave === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(chave);
      setDir(chave === "nome" ? "asc" : "desc");
    }
  };

  const cabecalhoOrdenavel = (chave: ChaveSort, rotulo: string) => {
    const ativo = chave === sortKey;
    return (
      <button
        type="button"
        onClick={() => alternarSort(chave)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground",
          chave !== "nome" && "flex-row-reverse",
          ativo && "text-foreground",
        )}
      >
        {rotulo}
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
    );
  };

  const totalUnidades = arvore.reduce((n, o) => n + o.unidades.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {arvore.length} {arvore.length === 1 ? "órgão" : "órgãos"} ·{" "}
          {totalUnidades} {totalUnidades === 1 ? "unidade" : "unidades"} ·{" "}
          {data.length} {data.length === 1 ? "ação" : "ações"}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={chaves.length === 0}
          onClick={() => setAbertos(tudoAberto ? new Set() : new Set(chaves))}
        >
          {tudoAberto ? "Recolher tudo" : "Expandir tudo"}
        </Button>
      </div>

      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>
                {cabecalhoOrdenavel("nome", "Órgão / Unidade / Ação")}
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground uppercase">
                Classificação
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground uppercase">
                Eixo
              </TableHead>
              <TableHead className="text-xs tracking-wide text-muted-foreground uppercase">
                Ano
              </TableHead>
              {COLUNAS_VALOR.map((chave) => (
                <TableHead key={chave} className="text-right">
                  {cabecalhoOrdenavel(chave, ROTULOS_ESTAGIO[chave])}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {arvore.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={TOTAL_COLUNAS}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              arvore.map((orgao) => (
                <React.Fragment key={orgao.orgaoCodigo}>
                  <LinhaOrgao
                    orgao={orgao}
                    aberto={abertos.has(orgao.orgaoCodigo)}
                    aoAlternar={() => alternar(orgao.orgaoCodigo)}
                  />
                  {abertos.has(orgao.orgaoCodigo) &&
                    orgao.unidades.map((unidade) => (
                      <React.Fragment key={unidade.chave}>
                        <LinhaUnidade
                          unidade={unidade}
                          secretaria={orgao.orgao}
                          aberto={abertos.has(unidade.chave)}
                          aoAlternar={() => alternar(unidade.chave)}
                        />
                        {abertos.has(unidade.chave) &&
                          unidade.acoes.map((acao) => (
                            <LinhaAcao key={acao.id} acao={acao} />
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
