"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  OPCAO_MES_ATUAL,
  carregarCorteMensal,
  metaBase,
  obterCorteMensalEmCache,
  orcamentoData,
  precarregarCortesMensais,
  type BaseMensalCarregada,
} from "@/data/base-ocad";

/**
 * Carrega sob demanda o corte mensal selecionado no filtro "Execução até",
 * lendo diretamente do cache em memória quando já disponível para evitar
 * qualquer frame intermediário ou piscadela na troca de mês.
 */
export function useBaseMensal(ateMes: string, erroMensagem: string) {
  const [carregado, setCarregado] = React.useState<{
    chave: string;
    base: BaseMensalCarregada;
  } | null>(null);
  const [falhaChave, setFalhaChave] = React.useState<string | null>(null);

  React.useEffect(() => {
    precarregarCortesMensais();
  }, []);

  const chaveAlvo = ateMes || OPCAO_MES_ATUAL;
  const emCache = obterCorteMensalEmCache(chaveAlvo);
  const precisaBuscar = emCache === null && carregado?.chave !== chaveAlvo;

  React.useEffect(() => {
    if (!precisaBuscar) return;

    let cancelado = false;
    carregarCorteMensal(chaveAlvo)
      .then((base) => {
        if (!cancelado) {
          setFalhaChave(null);
          setCarregado({ chave: chaveAlvo, base });
        }
      })
      .catch(() => {
        if (!cancelado) {
          setFalhaChave(chaveAlvo);
          toast.error(erroMensagem);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [chaveAlvo, erroMensagem, precisaBuscar]);

  const baseAtiva =
    emCache ??
    (carregado?.chave === chaveAlvo
      ? carregado.base
      : (carregado?.base ?? { itens: orcamentoData, meta: metaBase }));

  const carregandoMes = precisaBuscar && falhaChave !== chaveAlvo;

  return { ...baseAtiva, carregandoMes };
}
