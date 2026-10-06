/**
 * Textos e helpers compartilhados por mais de um domínio de tela.
 *
 * Os helpers de rótulo traduzem, para exibição, valores que existem nos DADOS
 * (eixos, categorias econômicas, status de indicador) e que, por isso, não
 * podem ser traduzidos na fonte: são chaves de comparação em filtros e
 * agrupamentos. O idioma `pt` devolve o próprio valor; o `en` traduz.
 */

import { PONDERACAO } from "@/data/base-ocad";

const EIXOS_EN: Record<string, string> = {
  "Educação": "Education",
  "Saúde": "Health",
  "Assistência Social": "Social Assistance",
};

const CATEGORIAS_EN: Record<string, string> = {
  "Exclusivo": "Exclusive",
  "Não Exclusivo": "Non-exclusive",
  "Não exclusivo": "Non-exclusive",
};

const STATUS_ODS_EN: Record<string, string> = {
  "Produzido": "Produced",
  "Em análise/construção": "Under analysis/development",
  "Sem dados": "No data",
};

const TIPO_NORMA_EN: Record<string, string> = {
  "Lei Ordinária": "Ordinary Law",
  "Decreto": "Decree",
  "Estrutura Administrativa": "Administrative Structure",
  "PPA": "PPA",
  "LDO": "LDO",
  "LOA": "LOA",
};

const pctPtBr = (fator: number) => (fator * 100).toLocaleString("pt-BR");

export const pt = {
  semDados: "Sem dados",
  ptBrasil: "Português (Brasil)",
  ingles: "English",
  ponderacao: () => PONDERACAO.descricao,
  eixoRotulo: (valor: string) => valor,
  categoriaRotulo: (valor: string) => valor,
  statusOdsRotulo: (valor: string) => valor,
  tipoNormaRotulo: (valor: string) => valor,
};

export const en: typeof pt = {
  semDados: "No data",
  ptBrasil: "Português (Brasil)",
  ingles: "English",
  ponderacao: () => {
    const de = (classificacao: string) =>
      PONDERACAO.porClassificacao.find((p) => p.classificacao === classificacao);
    const partes: string[] = [];

    const naoExclusivo = de("Não exclusivo");
    if (naoExclusivo) {
      partes.push(
        naoExclusivo.fator === 1
          ? "Non-exclusive actions enter in full"
          : `Non-exclusive actions enter at ${pctPtBr(naoExclusivo.fator)}%`,
      );
    }

    const exclusivo = de("Exclusivo");
    if (exclusivo) {
      partes.push(
        exclusivo.fator === 1
          ? "exclusive actions enter in full"
          : `exclusive actions enter at ${pctPtBr(exclusivo.fator)}%`,
      );
    }

    return `${partes.join(" and ")}.`;
  },
  eixoRotulo: (valor: string) => EIXOS_EN[valor] ?? valor,
  categoriaRotulo: (valor: string) => CATEGORIAS_EN[valor] ?? valor,
  statusOdsRotulo: (valor: string) => STATUS_ODS_EN[valor] ?? valor,
  tipoNormaRotulo: (valor: string) => TIPO_NORMA_EN[valor] ?? valor,
};
