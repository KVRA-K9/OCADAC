"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  OPCAO_MES_ATUAL,
  carregarCorteMensal,
  metaBase,
  orcamentoData,
  type BaseMensalCarregada,
} from "@/data/base-ocad";

/**
 * Carrega sob demanda o corte mensal selecionado no filtro "Execução até",
 * mantendo a base vigente em memória sem requisições extras na carga inicial.
 */
export function useBaseMensal(ateMes: string, erroMensagem: string) {
  const [carregado, setCarregado] = React.useState<{
    chave: string;
    base: BaseMensalCarregada;
  } | null>(null);
  const [falhaChave, setFalhaChave] = React.useState<string | null>(null);

  const ehAtual = !ateMes || ateMes === OPCAO_MES_ATUAL;
  const precisaBuscar = !ehAtual && carregado?.chave !== ateMes;

  React.useEffect(() => {
    if (!precisaBuscar) return;

    let cancelado = false;
    carregarCorteMensal(ateMes)
      .then((base) => {
        if (!cancelado) {
          setFalhaChave(null);
          setCarregado({ chave: ateMes, base });
        }
      })
      .catch(() => {
        if (!cancelado) {
          setFalhaChave(ateMes);
          toast.error(erroMensagem);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [ateMes, erroMensagem, precisaBuscar]);

  const baseAtiva = ehAtual
    ? { itens: orcamentoData, meta: metaBase }
    : carregado?.chave === ateMes
      ? carregado.base
      : (carregado?.base ?? { itens: orcamentoData, meta: metaBase });

  const carregandoMes = precisaBuscar && falhaChave !== ateMes;

  return { ...baseAtiva, carregandoMes };
}
