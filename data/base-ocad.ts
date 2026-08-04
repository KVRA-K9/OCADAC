/**
 * Base do OCAD — a mesma planilha que alimenta o BI da SEPLAN.
 *
 * Gerada por `npm run dados` a partir de `Planilhas/OCAD_2026.xlsx`. Os valores
 * exibidos no site reproduzem os do BI ação a ação; o eixo é derivado da função
 * orçamentária, porque a planilha não traz essa coluna.
 */

import type {
  CategoriaEconomica,
  FiltrosOrcamento,
  OrcamentoItem,
  ValoresOrcamentarios,
} from "@/lib/types";
import { VALORES_NULOS } from "@/lib/types";
import dadosBrutos from "@/data/base-ocad.json";
import metaBruta from "@/data/base-ocad.meta.json";

const EIXO_MAP: Record<string, string> = {
  EDUCACAO: "Educação",
  SAUDE: "Saúde",
  ASSISTENCIA_SOCIAL: "Assistência Social",
};

const CLASSIFICACAO_MAP: Record<string, CategoriaEconomica> = {
  Exclusivo: "Exclusivo",
  "Não exclusivo": "Não Exclusivo",
};

const FUNCOES = ["Educação", "Saúde", "Assistência Social"] as const;

interface RegistroBase {
  ano: number;
  secretariaCodigo: string;
  secretariaNome: string;
  unidadeCodigo: string;
  unidadeNome: string;
  acaoCodigo: string;
  acao: string;
  programaFuncional: string;
  eixo: string;
  classificacao: string;
  ponderador: number;
  fontes: number;
  dotacaoInicial: number;
  ocadInicial: number;
  ocadAtualizado: number;
  ocadEmpenhado: number;
  ocadLiquidado: number;
  ocadPago: number;
  ocadDisponivel: number;
}

export interface MetaBase {
  arquivoFonte: string;
  origem: string;
  dataArquivo: string;
  geradoEm: string;
  anos: number[];
  linhasFonte: number;
  acoes: number;
  eixoDerivado: boolean;
  totais: ValoresOrcamentarios & { ocadEmpenhado: number; ocadPago: number };
}

export const metaBase = metaBruta as MetaBase;

/** Data do arquivo-fonte em dd/mm/aaaa, para exibição. */
export const dataBase = (() => {
  const [ano, mes, dia] = metaBase.dataArquivo.split("-");
  return `${dia}/${mes}/${ano}`;
})();

const registros = dadosBrutos as RegistroBase[];

export const totaisBase = metaBase.totais;

/**
 * Regra de ponderação em vigor, lida da própria base em vez de fixada no
 * código: se a planilha mudar o Ref. %, o texto exibido acompanha.
 */
export const PONDERACAO = (() => {
  const porClasse = new Map<string, number>();
  for (const r of registros) porClasse.set(r.classificacao, r.ponderador);

  const trecho = (classificacao: string, sufixo: string) => {
    const fator = porClasse.get(classificacao);
    if (fator === undefined) return null;
    return fator === 1
      ? `${sufixo} entram integralmente`
      : `${sufixo} entram a ${(fator * 100).toLocaleString("pt-BR")}%`;
  };

  const partes = [
    trecho("Não exclusivo", "Ações não exclusivas"),
    trecho("Exclusivo", "exclusivas"),
  ].filter(Boolean);

  return {
    porClassificacao: [...porClasse].map(([classificacao, fator]) => ({
      classificacao,
      fator,
    })),
    descricao: `${partes.join(" e ")}.`,
  };
})();

function gerarDados(): OrcamentoItem[] {
  return registros.map((d, i) => ({
    id: `OCAD-AC-${d.programaFuncional}-${d.unidadeCodigo}-${i}`,
    ano: d.ano,
    funcao: EIXO_MAP[d.eixo] ?? d.eixo,
    programa: d.programaFuncional,
    acao: d.acao,
    orgao: d.secretariaNome,
    unidadeGestora: d.unidadeNome,
    categoriaEconomica: CLASSIFICACAO_MAP[d.classificacao] ?? "Não Exclusivo",
    valores: {
      dotacaoInicial: d.dotacaoInicial,
      ocadInicial: d.ocadInicial,
      ocadAtualizado: d.ocadAtualizado,
      ocadEmpenhado: d.ocadEmpenhado,
      ocadLiquidado: d.ocadLiquidado,
      ocadPago: d.ocadPago,
      ocadDisponivel: d.ocadDisponivel,
    },
  }));
}

export const orcamentoData: OrcamentoItem[] = gerarDados();

export const anosDisponiveis: number[] = [
  ...new Set(orcamentoData.map((d) => d.ano)),
].sort((a, b) => a - b);

export const funcoesDisponiveis: string[] = [...FUNCOES];

export const orgaosDisponiveis: string[] = [
  ...new Set(orcamentoData.map((d) => d.orgao)),
].sort();

export const categoriasDisponiveis: CategoriaEconomica[] = [
  "Exclusivo",
  "Não Exclusivo",
];

export const OPCAO_TODOS = "todos";

export function somaValores(itens: OrcamentoItem[]): ValoresOrcamentarios {
  return itens.reduce<ValoresOrcamentarios>(
    (acc, item) => ({
      dotacaoInicial: acc.dotacaoInicial + item.valores.dotacaoInicial,
      ocadInicial: acc.ocadInicial + item.valores.ocadInicial,
      ocadAtualizado: acc.ocadAtualizado + item.valores.ocadAtualizado,
      ocadEmpenhado: acc.ocadEmpenhado + item.valores.ocadEmpenhado,
      ocadLiquidado: acc.ocadLiquidado + item.valores.ocadLiquidado,
      ocadPago: acc.ocadPago + item.valores.ocadPago,
      ocadDisponivel: acc.ocadDisponivel + item.valores.ocadDisponivel,
    }),
    { ...VALORES_NULOS },
  );
}

export function filtrarOrcamento(
  itens: OrcamentoItem[],
  filtros: FiltrosOrcamento,
): OrcamentoItem[] {
  return itens.filter((item) => {
    if (filtros.ano !== OPCAO_TODOS && item.ano !== Number(filtros.ano)) {
      return false;
    }
    if (filtros.funcao.length > 0 && !filtros.funcao.includes(item.funcao)) {
      return false;
    }
    if (
      filtros.categoriaEconomica !== OPCAO_TODOS &&
      item.categoriaEconomica !== filtros.categoriaEconomica
    ) {
      return false;
    }
    if (filtros.secretaria.length > 0 && !filtros.secretaria.includes(item.orgao)) {
      return false;
    }
    return true;
  });
}

export interface AgregadoOrgao extends ValoresOrcamentarios {
  orgao: string;
}

export function agregarPorOrgao(itens: OrcamentoItem[]): AgregadoOrgao[] {
  return orgaosDisponiveis
    .map((orgao) => {
      const soma = somaValores(itens.filter((i) => i.orgao === orgao));
      return { orgao, ...soma };
    })
    .filter((d) => d.ocadInicial > 0)
    .sort((a, b) => b.ocadInicial - a.ocadInicial);
}

export interface AgregadoFuncao {
  funcao: string;
  ocadInicial: number;
  ocadLiquidado: number;
}

export function agregarPorFuncao(itens: OrcamentoItem[]): AgregadoFuncao[] {
  return FUNCOES.map((funcao) => {
    const sub = itens.filter((i) => i.funcao === funcao);
    const soma = somaValores(sub);
    return {
      funcao,
      ocadInicial: soma.ocadInicial,
      ocadLiquidado: soma.ocadLiquidado,
    };
  })
    .filter((d) => d.ocadInicial > 0)
    .sort((a, b) => b.ocadInicial - a.ocadInicial);
}

export interface PontoSerie extends ValoresOrcamentarios {
  ano: number;
}

export function serieTemporal(itens: OrcamentoItem[]): PontoSerie[] {
  return anosDisponiveis.map((ano) => {
    const soma = somaValores(itens.filter((i) => i.ano === ano));
    return { ano, ...soma };
  });
}

export interface PontoComparacao {
  funcao: string;
  Exclusivo: number;
  "Não Exclusivo": number;
  ExclusivoInicial: number;
  NaoExclusivoInicial: number;
  ExclusivoLiquidado: number;
  NaoExclusivoLiquidado: number;
}

export function compararCategorias(itens: OrcamentoItem[]): PontoComparacao[] {
  return FUNCOES.map((funcao) => {
    const sub = itens.filter((i) => i.funcao === funcao);
    const exclusivoSub = sub.filter((i) => i.categoriaEconomica === "Exclusivo");
    const naoExclusivoSub = sub.filter(
      (i) => i.categoriaEconomica === "Não Exclusivo",
    );
    const exclusivo = exclusivoSub.reduce(
      (acc, i) => acc + i.valores.ocadInicial,
      0,
    );
    const naoExclusivo = naoExclusivoSub.reduce(
      (acc, i) => acc + i.valores.ocadInicial,
      0,
    );
    const exclusivoLiquidado = exclusivoSub.reduce(
      (acc, i) => acc + i.valores.ocadLiquidado,
      0,
    );
    const naoExclusivoLiquidado = naoExclusivoSub.reduce(
      (acc, i) => acc + i.valores.ocadLiquidado,
      0,
    );
    return {
      funcao,
      Exclusivo: exclusivo,
      "Não Exclusivo": naoExclusivo,
      ExclusivoInicial: exclusivo,
      NaoExclusivoInicial: naoExclusivo,
      ExclusivoLiquidado: exclusivoLiquidado,
      NaoExclusivoLiquidado: naoExclusivoLiquidado,
    };
  })
    .filter((d) => d.Exclusivo + d["Não Exclusivo"] > 0)
    .sort(
      (a, b) =>
        b.Exclusivo + b["Não Exclusivo"] - (a.Exclusivo + a["Não Exclusivo"]),
    );
}

export interface ContagemAcoesSecretaria {
  orgao: string;
  Exclusivo: number;
  "Não Exclusivo": number;
}

export function contarAcoesPorSecretaria(
  itens: OrcamentoItem[],
): ContagemAcoesSecretaria[] {
  return orgaosDisponiveis
    .map((orgao) => {
      const sub = itens.filter((i) => i.orgao === orgao);
      const exclusivo = sub.filter(
        (i) => i.categoriaEconomica === "Exclusivo",
      ).length;
      const naoExclusivo = sub.filter(
        (i) => i.categoriaEconomica === "Não Exclusivo",
      ).length;
      return { orgao, Exclusivo: exclusivo, "Não Exclusivo": naoExclusivo };
    })
    .filter((d) => d.Exclusivo + d["Não Exclusivo"] > 0)
    .sort(
      (a, b) =>
        b.Exclusivo + b["Não Exclusivo"] - (a.Exclusivo + a["Não Exclusivo"]),
    );
}
