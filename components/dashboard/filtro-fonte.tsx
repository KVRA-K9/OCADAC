"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OpcaoFonte } from "@/data/base-ocad";
import { formatMoedaCompacta, formatParticipacao } from "@/lib/format";
import { normalizar } from "@/lib/texto";
import { cn } from "@/lib/utils";

/**
 * Onde a lista corta entre "Maiores" e "Demais". Seis cobrem 91,6% do orçamento
 * desta base; as outras 51 são uma cauda longa, que só fica legível quando as
 * barras são escaladas separadamente das grandes.
 */
const FONTES_EM_DESTAQUE = 6;

/**
 * Filtro por fonte de recursos: um botão no cabeçalho da tabela que abre a
 * lista das 57 fontes da planilha.
 *
 * A lista vai em duas seções, cada uma escalando as barras pela sua própria
 * maior. Numa régua única a 15401070 (31,8% do orçamento) achataria as outras
 * 56 — o percentual ao lado é que segue sempre sobre o total, então a separação
 * organiza sem enganar.
 */
export function FiltroFonte({
  fontes,
  escolhidas,
  alternar,
  limpar,
  total,
}: {
  fontes: OpcaoFonte[];
  escolhidas: string[];
  alternar: (codigo: string) => void;
  limpar: () => void;
  /** Denominador das participações — o orçamento atualizado do recorte. */
  total: number;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [busca, setBusca] = React.useState("");

  // A seção de cada fonte vem do posto no recorte inteiro, e não da posição
  // entre os resultados: senão buscar "saúde" listaria o SUS - Manutenção sob
  // "Maiores" ao lado de fontes sete vezes maiores. `fontes` já vem ordenada
  // por valor decrescente de `fontesDisponiveis`, então o corte é por índice.
  const maiores = fontes.slice(0, FONTES_EM_DESTAQUE);
  const demais = fontes.slice(FONTES_EM_DESTAQUE);

  // Busca por código ou nome, sem acento: "credito" acha OPERAÇÕES DE CRÉDITO.
  const termo = normalizar(busca.trim());
  const casa = (lista: OpcaoFonte[]) =>
    termo
      ? lista.filter((o) => normalizar(`${o.codigo} ${o.nome}`).includes(termo))
      : lista;

  const secoes = [
    { titulo: "Maiores", itens: casa(maiores) },
    { titulo: "Demais", itens: casa(demais) },
  ].filter((secao) => secao.itens.length > 0);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Filtrar por fonte de recursos"
        >
          Fonte
          {escolhidas.length > 0 ? (
            <span className="tabular-nums">· {escolhidas.length}</span>
          ) : null}
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por código ou nome..."
            aria-label="Buscar fonte de recursos"
            className="pl-9"
          />
        </div>

        {escolhidas.length > 0 ? (
          <div className="mt-2 flex items-center justify-between gap-2 px-2 text-xs text-muted-foreground">
            <span>
              {escolhidas.length}{" "}
              {escolhidas.length === 1 ? "selecionada" : "selecionadas"}
            </span>
            <button
              type="button"
              onClick={limpar}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Limpar
            </button>
          </div>
        ) : null}

        <div className="mt-2 max-h-80 overflow-y-auto">
          {secoes.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nenhuma fonte com esse código ou nome.
            </p>
          ) : (
            secoes.map((secao) => (
              <SecaoFontes
                key={secao.titulo}
                titulo={secao.titulo}
                itens={secao.itens}
                escolhidas={escolhidas}
                alternar={alternar}
                total={total}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Um bloco da lista, com régua própria: a barra de cada linha é proporcional à
 * maior fonte DA SEÇÃO, não ao total nem à maior de todas. É o que devolve
 * legibilidade à cauda, onde a maior vale 1,7% do orçamento.
 */
function SecaoFontes({
  titulo,
  itens,
  escolhidas,
  alternar,
  total,
}: {
  titulo: string;
  itens: OpcaoFonte[];
  escolhidas: string[];
  alternar: (codigo: string) => void;
  total: number;
}) {
  const teto = Math.max(...itens.map((o) => o.valor), 0);

  return (
    <>
      <p className="sticky top-0 z-10 bg-popover px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {titulo}
      </p>
      <ul>
        {itens.map((opcao) => (
          <li key={opcao.codigo}>
            <LinhaFonte
              opcao={opcao}
              total={total}
              teto={teto}
              marcada={escolhidas.includes(opcao.codigo)}
              onClick={() => alternar(opcao.codigo)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Uma fonte na lista. O popover não fecha ao clicar — a seleção é múltipla, e
 * fechar a cada escolha tornaria impossível montar um conjunto.
 */
function LinhaFonte({
  opcao,
  total,
  teto,
  marcada,
  onClick,
}: {
  opcao: OpcaoFonte;
  total: number;
  /** Maior valor da seção, que define a barra cheia. */
  teto: number;
  marcada: boolean;
  onClick: () => void;
}) {
  // Um piso de 2% de largura mantém visível a barra das menores fontes, que de
  // outro modo desapareceriam: nesta lista a maior vale milhares de vezes a
  // menor.
  const largura = teto > 0 ? Math.max((opcao.valor / teto) * 100, 2) : 0;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcada}
      onClick={onClick}
      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
          marcada
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input",
        )}
      >
        {marcada ? <Check className="size-3" /> : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3 text-sm">
          <span className={cn("tabular-nums", marcada && "font-medium")}>
            {opcao.codigo}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatMoedaCompacta(opcao.valor)} ·{" "}
            {formatParticipacao(total > 0 ? opcao.valor / total : 0)}
          </span>
        </span>

        <span aria-hidden className="mt-1 block h-1 rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary/60"
            style={{ width: `${largura}%` }}
          />
        </span>

        <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
          {opcao.nome}
        </span>
      </span>
    </button>
  );
}
