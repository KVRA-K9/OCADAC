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
  FonteAcao,
  OrcamentoItem,
  ValoresOrcamentarios,
} from "@/lib/types";
import { VALORES_NULOS } from "@/lib/types";
import { rotuloUnidade } from "@/lib/estagios";
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
  fontes: FonteAcao[];
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
  /** Quantas fontes de recurso distintas aparecem na planilha. */
  fontesDistintas: number;
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
    acaoCodigo: d.acaoCodigo,
    acao: d.acao,
    orgao: d.secretariaNome,
    orgaoCodigo: d.secretariaCodigo,
    unidadeGestora: d.unidadeNome,
    unidadeCodigo: d.unidadeCodigo,
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
    fontes: d.fontes,
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

/** Soma estágio a estágio. Serve tanto para ações quanto para fontes. */
export function somarValores(
  valores: ValoresOrcamentarios[],
): ValoresOrcamentarios {
  return valores.reduce<ValoresOrcamentarios>(
    (acc, v) => ({
      dotacaoInicial: acc.dotacaoInicial + v.dotacaoInicial,
      ocadInicial: acc.ocadInicial + v.ocadInicial,
      ocadAtualizado: acc.ocadAtualizado + v.ocadAtualizado,
      ocadEmpenhado: acc.ocadEmpenhado + v.ocadEmpenhado,
      ocadLiquidado: acc.ocadLiquidado + v.ocadLiquidado,
      ocadPago: acc.ocadPago + v.ocadPago,
      ocadDisponivel: acc.ocadDisponivel + v.ocadDisponivel,
    }),
    { ...VALORES_NULOS },
  );
}

export function somaValores(itens: OrcamentoItem[]): ValoresOrcamentarios {
  return somarValores(itens.map((item) => item.valores));
}

export interface OpcaoFonte {
  /** Código de 8 dígitos, como na coluna "Fonte de Recursos" da planilha. */
  codigo: string;
  nome: string;
  /**
   * Orçamento atualizado da fonte no recorte. É ele, e não o inicial, que
   * dimensiona a barra da lista: há fontes abertas no meio do exercício, cuja
   * dotação inicial é zero — pelo inicial elas apareceriam como R$ 0.
   */
  valor: number;
  /** Em quantas ações do recorte a fonte aparece. */
  acoes: number;
}

/** As fontes presentes num recorte, da maior para a menor. */
export function fontesDisponiveis(itens: OrcamentoItem[]): OpcaoFonte[] {
  const porCodigo = new Map<string, OpcaoFonte>();
  for (const item of itens) {
    for (const fonte of item.fontes) {
      const opcao = porCodigo.get(fonte.codigo) ?? {
        codigo: fonte.codigo,
        nome: fonte.nome,
        valor: 0,
        acoes: 0,
      };
      opcao.valor += fonte.ocadAtualizado;
      opcao.acoes += 1;
      porCodigo.set(fonte.codigo, opcao);
    }
  }
  return [...porCodigo.values()].sort((a, b) => b.valor - a.valor);
}

/**
 * Recorta as ações às fontes escolhidas: os valores passam a ser só os das
 * fontes marcadas, e as ações que não usam nenhuma delas saem da lista.
 *
 * Nada é rateado — a planilha já traz cada estágio por fonte —, e uma ação
 * custeada por duas fontes selecionadas entra uma vez só, com a soma das duas.
 */
export function aplicarFontes(
  itens: OrcamentoItem[],
  codigos: string[],
): OrcamentoItem[] {
  if (codigos.length === 0) return itens;
  const escolhidas = new Set(codigos);

  return itens.flatMap((item) => {
    const fontes = item.fontes.filter((f) => escolhidas.has(f.codigo));
    if (fontes.length === 0) return [];
    return [{ ...item, fontes, valores: somarValores(fontes) }];
  });
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

export interface LinhaOrgao extends ValoresOrcamentarios {
  orgao: string;
  orgaoCodigo: string;
  /** Orçamento atualizado das ações exclusivas do órgão. */
  exclusivo: number;
  /** Orçamento atualizado das ações não exclusivas. */
  naoExclusivo: number;
  /** Eixos presentes no órgão, na ordem de `FUNCOES`. */
  funcoes: string[];
  unidades: number;
  acoes: number;
}

/**
 * Uma linha por órgão, para a visão em tabela plana.
 *
 * Diferente de `agregarPorOrgao`, que serve aos gráficos, esta parte do próprio
 * recorte em vez da lista global de órgãos e não descarta quem tem dotação
 * inicial zero — um órgão custeado só por crédito adicional some de um gráfico
 * sem prejuízo, mas some de uma tabela levando o total junto.
 */
export function agregarOrgaos(itens: OrcamentoItem[]): LinhaOrgao[] {
  const porOrgao = new Map<string, OrcamentoItem[]>();
  for (const item of itens) {
    porOrgao.set(item.orgaoCodigo, [
      ...(porOrgao.get(item.orgaoCodigo) ?? []),
      item,
    ]);
  }

  const atualizadoDe = (sub: OrcamentoItem[], categoria: CategoriaEconomica) =>
    somaValores(sub.filter((i) => i.categoriaEconomica === categoria))
      .ocadAtualizado;

  return [...porOrgao.values()]
    .map((sub) => ({
      orgao: sub[0].orgao,
      orgaoCodigo: sub[0].orgaoCodigo,
      exclusivo: atualizadoDe(sub, "Exclusivo"),
      naoExclusivo: atualizadoDe(sub, "Não Exclusivo"),
      funcoes: FUNCOES.filter((f) => sub.some((i) => i.funcao === f)),
      unidades: new Set(sub.map((i) => i.unidadeCodigo)).size,
      acoes: sub.length,
      ...somaValores(sub),
    }))
    .sort((a, b) => b.ocadAtualizado - a.ocadAtualizado);
}

export interface AgregadoUnidade extends ValoresOrcamentarios {
  /** `códigoDoÓrgão/códigoDaUnidade`. */
  chave: string;
  /** Nomenclatura do BI: `SEE`, `SEE/FUNDEB`, `SEAD/FOLHA FUNDES`. */
  rotulo: string;
  secretaria: string;
  orgaoCodigo: string;
  unidade: string;
  acoes: number;
}

/**
 * Agrega por unidade orçamentária — o mesmo recorte que o BI usa nos filtros.
 * Um órgão aparece em mais de um card quando executa por fundos distintos.
 */
export function agregarPorUnidade(itens: OrcamentoItem[]): AgregadoUnidade[] {
  const porChave = new Map<string, OrcamentoItem[]>();
  for (const item of itens) {
    const chave = `${item.orgaoCodigo}/${item.unidadeCodigo}`;
    porChave.set(chave, [...(porChave.get(chave) ?? []), item]);
  }

  const unidades = [...porChave.entries()]
    .map(([chave, sub]) => ({
      chave,
      rotulo: rotuloUnidade(sub[0].orgao, sub[0].orgaoCodigo, sub[0].unidadeCodigo),
      secretaria: sub[0].orgao,
      orgaoCodigo: sub[0].orgaoCodigo,
      unidade: sub[0].unidadeGestora,
      acoes: sub.length,
      ...somaValores(sub),
    }))
    .filter((d) => d.ocadInicial > 0);

  // Total por órgão, para ordenar os grupos entre si.
  const totalPorOrgao = new Map<string, number>();
  for (const u of unidades) {
    totalPorOrgao.set(
      u.orgaoCodigo,
      (totalPorOrgao.get(u.orgaoCodigo) ?? 0) + u.ocadAtualizado,
    );
  }

  /*
   * Órgãos do maior para o menor e, dentro de cada um, as unidades também por
   * valor. Ordenar só por valor espalharia SEE, SEE/FUNDEB e SEE/IEPTEC pela
   * grade inteira; agrupando, as unidades de uma mesma secretaria ficam lado a
   * lado sem perder a leitura por tamanho.
   */
  return unidades.sort(
    (a, b) =>
      (totalPorOrgao.get(b.orgaoCodigo) ?? 0) -
        (totalPorOrgao.get(a.orgaoCodigo) ?? 0) ||
      b.ocadAtualizado - a.ocadAtualizado,
  );
}

export interface NoAcao extends ValoresOrcamentarios {
  id: string;
  acaoCodigo: string;
  acao: string;
  programa: string;
  funcao: string;
  ano: number;
  categoriaEconomica: CategoriaEconomica;
}

export interface NoUnidade extends ValoresOrcamentarios {
  /** `códigoDoÓrgão/códigoDaUnidade`. */
  chave: string;
  /** Nomenclatura do BI: `SEE`, `SEE/FUNDEB`. */
  rotulo: string;
  unidade: string;
  acoes: NoAcao[];
}

export interface NoOrgao extends ValoresOrcamentarios {
  orgao: string;
  orgaoCodigo: string;
  unidades: NoUnidade[];
  totalAcoes: number;
}

/**
 * A mesma divisão dos cards da visão geral, em árvore: órgão → unidade
 * orçamentária → ação. Alimenta a tabela detalhada, onde cada nível abre para
 * mostrar o de baixo.
 *
 * Diferente de `agregarPorUnidade`, nada é descartado: um card vazio não serve
 * para nada, mas uma tabela que omite registro deixa de bater com o total
 * exportado.
 */
export function agregarHierarquia(itens: OrcamentoItem[]): NoOrgao[] {
  const porOrgao = new Map<string, OrcamentoItem[]>();
  for (const item of itens) {
    porOrgao.set(item.orgaoCodigo, [
      ...(porOrgao.get(item.orgaoCodigo) ?? []),
      item,
    ]);
  }

  const orgaos = [...porOrgao.values()].map((doOrgao) => {
    const porUnidade = new Map<string, OrcamentoItem[]>();
    for (const item of doOrgao) {
      porUnidade.set(item.unidadeCodigo, [
        ...(porUnidade.get(item.unidadeCodigo) ?? []),
        item,
      ]);
    }

    const unidades = [...porUnidade.values()]
      .map((sub) => ({
        chave: `${sub[0].orgaoCodigo}/${sub[0].unidadeCodigo}`,
        rotulo: rotuloUnidade(
          sub[0].orgao,
          sub[0].orgaoCodigo,
          sub[0].unidadeCodigo,
        ),
        unidade: sub[0].unidadeGestora,
        acoes: sub
          .map((i) => ({
            id: i.id,
            acaoCodigo: i.acaoCodigo,
            acao: i.acao,
            programa: i.programa,
            funcao: i.funcao,
            ano: i.ano,
            categoriaEconomica: i.categoriaEconomica,
            ...i.valores,
          }))
          .sort((a, b) => b.ocadAtualizado - a.ocadAtualizado),
        ...somaValores(sub),
      }))
      .sort((a, b) => b.ocadAtualizado - a.ocadAtualizado);

    return {
      orgao: doOrgao[0].orgao,
      orgaoCodigo: doOrgao[0].orgaoCodigo,
      unidades,
      totalAcoes: doOrgao.length,
      ...somaValores(doOrgao),
    };
  });

  return orgaos.sort((a, b) => b.ocadAtualizado - a.ocadAtualizado);
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
