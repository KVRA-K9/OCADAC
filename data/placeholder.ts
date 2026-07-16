import type {
  CategoriaEconomica,
  FiltrosOrcamento,
  OrcamentoItem,
  ValoresOrcamentarios,
} from "@/lib/types";
import dadosBrutos from "@/orcamentos-tematicos-visao-geral-2026-07-06.json";

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

interface DadosBrutosItem {
  ano: number;
  secretariaNome: string;
  unidadeNome: string;
  unidadeCodigo: string;
  acaoCodigo: string;
  acao: string;
  programaFuncional: string;
  eixo: string;
  classificacao: string;
  orcamentoAtualizado: number;
  orcamentoAtualizadoPonderado: number;
  disponivel: number;
  planejadoPonderado: number;
  liquidadoPonderado: number;
}

function gerarDados(): OrcamentoItem[] {
  return (dadosBrutos as DadosBrutosItem[]).map((d, i) => ({
    id: `OCAD-AC-${d.acaoCodigo}-${d.unidadeCodigo}-${i}`,
    ano: d.ano,
    funcao: EIXO_MAP[d.eixo] ?? d.eixo,
    programa: d.programaFuncional,
    acao: d.acao,
    orgao: d.secretariaNome,
    unidadeGestora: d.unidadeNome,
    categoriaEconomica: CLASSIFICACAO_MAP[d.classificacao] ?? "Não Exclusivo",
    valores: {
      previsto: d.planejadoPonderado,
      empenhado: d.orcamentoAtualizadoPonderado,
      liquidado: d.liquidadoPonderado,
      pago: d.disponivel,
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
      previsto: acc.previsto + item.valores.previsto,
      empenhado: acc.empenhado + item.valores.empenhado,
      liquidado: acc.liquidado + item.valores.liquidado,
      pago: acc.pago + item.valores.pago,
    }),
    { previsto: 0, empenhado: 0, liquidado: 0, pago: 0 },
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
    .filter((d) => d.previsto > 0)
    .sort((a, b) => b.previsto - a.previsto);
}

export interface AgregadoFuncao {
  funcao: string;
  previsto: number;
  pago: number;
}

export function agregarPorFuncao(itens: OrcamentoItem[]): AgregadoFuncao[] {
  return FUNCOES.map((funcao) => {
    const sub = itens.filter((i) => i.funcao === funcao);
    const soma = somaValores(sub);
    return { funcao, previsto: soma.previsto, pago: soma.pago };
  })
    .filter((d) => d.previsto > 0)
    .sort((a, b) => b.previsto - a.previsto);
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
  ExclusivoPrevisto: number;
  NaoExclusivoPrevisto: number;
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
      (acc, i) => acc + i.valores.previsto,
      0,
    );
    const naoExclusivo = naoExclusivoSub.reduce(
      (acc, i) => acc + i.valores.previsto,
      0,
    );
    const exclusivoLiquidado = exclusivoSub.reduce(
      (acc, i) => acc + i.valores.liquidado,
      0,
    );
    const naoExclusivoLiquidado = naoExclusivoSub.reduce(
      (acc, i) => acc + i.valores.liquidado,
      0,
    );
    return {
      funcao,
      Exclusivo: exclusivo,
      "Não Exclusivo": naoExclusivo,
      ExclusivoPrevisto: exclusivo,
      NaoExclusivoPrevisto: naoExclusivo,
      ExclusivoLiquidado: exclusivoLiquidado,
      NaoExclusivoLiquidado: naoExclusivoLiquidado,
    };
  })
    .filter(
      (d) => d.Exclusivo + d["Não Exclusivo"] > 0,
    )
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
