import type { OpcaoFonte } from "@/data/base-ocad";
import { formatMoeda, formatMoedaCompacta, formatPercent } from "@/lib/format";
import type { ValoresOrcamentarios } from "@/lib/types";

/**
 * Identificação das fontes selecionadas. O código sozinho é opaco, e o nome não
 * cabe na pílula do botão — as descrições passam de 60 caracteres —, então ele
 * ganha lugar próprio aqui, junto dos números do recorte.
 */
export function FichaFonte({
  opcoes,
  valores,
  acoes,
  total,
}: {
  /** As fontes marcadas, com os valores que elas têm no recorte. */
  opcoes: OpcaoFonte[];
  /** Soma do recorte já filtrado — a mesma que a tabela exibe. */
  valores: ValoresOrcamentarios;
  /** Ações restantes no recorte. */
  acoes: number;
  /** Denominador da participação: o orçamento atualizado sem o filtro de fonte. */
  total: number;
}) {
  const varias = opcoes.length > 1;
  const valor = valores.ocadAtualizado;

  return (
    <div className="rounded-lg border-l-2 border-primary/40 bg-primary/15 p-3 dark:bg-primary/10">
      <p className="text-xs font-medium tracking-wide text-muted-foreground tabular-nums">
        {varias
          ? `${opcoes.length} fontes selecionadas`
          : `Fonte ${opcoes[0].codigo}`}
      </p>

      {varias ? null : (
        <p className="mt-0.5 text-sm leading-snug font-medium">
          {opcoes[0].nome}
        </p>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {formatMoeda(valor)}
        </span>{" "}
        · {formatPercent(total > 0 ? valor / total : 0)} do recorte · {acoes}{" "}
        {acoes === 1 ? "ação" : "ações"}
      </p>

      {varias ? (
        <ul className="mt-3 flex flex-col gap-1 border-t border-primary/25 pt-2">
          {opcoes.map((opcao) => (
            <li
              key={opcao.codigo}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="min-w-0">
                <span className="font-medium tabular-nums">{opcao.codigo}</span>{" "}
                <span className="text-muted-foreground">{opcao.nome}</span>
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {formatMoedaCompacta(opcao.valor)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        Valores da própria fonte em cada ação, como na planilha — sem rateio.
      </p>
    </div>
  );
}
