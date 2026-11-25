/**
 * Núcleo compartilhado de normalização, consolidação e validação da base OCAD.
 *
 * Usado tanto pela carga manual de planilhas (`gerar-base-ocad.mjs`) quanto pela
 * sincronização automática via API do Sistema de Orçamentos Temáticos
 * (`sincronizar-api-ocad.mjs`), mantendo regras de negócio, arredondamento e
 * metadados num único lugar.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Eixo por função orçamentária, conforme a composição do OCAD. */
export const EIXO_POR_FUNCAO = {
  "12": "EDUCACAO",
  "13": "EDUCACAO",
  "27": "EDUCACAO",
  "10": "SAUDE",
  "16": "SAUDE",
  "17": "SAUDE",
  "08": "ASSISTENCIA_SOCIAL",
  "14": "ASSISTENCIA_SOCIAL",
};

/**
 * Ações cujo eixo foge da regra por função. A classificação do OCAD é decisão
 * de política pública, não consequência automática da função orçamentária.
 * Confirmadas com a SEPLAN.
 */
export const EXCECOES_EIXO = {
  // Ação da SEE: promoção de direitos humanos e diversidade nas escolas.
  "717|001|14422145210430000": "EDUCACAO",
};

/** Campos monetários da ação, que a decomposição por fonte precisa reproduzir. */
export const CAMPOS_VALOR = [
  "dotacaoInicial",
  "ocadInicial",
  "ocadAtualizado",
  "ocadEmpenhado",
  "ocadLiquidado",
  "ocadPago",
  "ocadDisponivel",
];

/** Proporção mínima de ações frente à base vigente (trava contra corte parcial). */
export const MIN_ACTION_COUNT_RATIO = 0.85;

export const centavos = (v) => Math.round(v * 100) / 100;

export const reais = (v) =>
  `R$ ${(v ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function hojeRioBranco() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Rio_Branco",
  }).format(new Date());
}

/** Timestamp ISO 8601 no fuso de Rio Branco (UTC-5), independente do host. */
export function formatarIsoRioBranco(data = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Rio_Branco",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(data)
      .map((p) => [p.type, p.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}-05:00`;
}

export function chaveLogicaAcao(secretariaCodigo, unidadeCodigo, programaFuncional) {
  return `${secretariaCodigo}|${unidadeCodigo}|${programaFuncional}`;
}

/**
 * Resolve o eixo temático da ação.
 *
 * A regra canônica do OCAD (`EXCECOES_EIXO` → `EIXO_POR_FUNCAO`) prevalece;
 * caso a função não esteja mapeada, aceita o `eixoSugerido` (se válido) ou
 * lança erro explícito para evitar classificação silenciosa errada.
 */
export function resolverEixo(chave, programaFuncional, eixoSugerido) {
  const funcao = String(programaFuncional ?? "").slice(0, 2);
  const canonico = EXCECOES_EIXO[chave] ?? EIXO_POR_FUNCAO[funcao];
  if (canonico) {
    if (eixoSugerido && eixoSugerido !== canonico) {
      console.warn(
        `Aviso: eixo sugerido "${eixoSugerido}" na ação ${chave} ajustado para "${canonico}" pela regra do OCAD.`,
      );
    }
    return canonico;
  }

  if (
    eixoSugerido === "EDUCACAO" ||
    eixoSugerido === "SAUDE" ||
    eixoSugerido === "ASSISTENCIA_SOCIAL"
  ) {
    return eixoSugerido;
  }

  throw new Error(
    `Sem eixo para a função ${funcao} (ação ${chave}). ` +
      `Acrescente a função em EIXO_POR_FUNCAO ou a ação em EXCECOES_EIXO.`,
  );
}

/**
 * Consolida ações e fontes brutas/normalizadas no formato exato de `base-ocad.json`
 * e gera os metadados compatíveis com `base-ocad.meta.json`.
 *
 * Cada item de entrada deve ter:
 * - ano, secretariaCodigo, secretariaNome, unidadeCodigo, unidadeNome,
 *   programaFuncional, acaoCodigo, acao, eixo, classificacao, ponderador
 * - fontes: array de `{ codigo, nome, dotacaoInicial, ocadInicial, ocadAtualizado, ocadEmpenhado, ocadLiquidado, ocadPago }`
 */
export function consolidarRegistrosOcad(
  itens,
  { ano, arquivoFonte, origem, origemTipo = "planilha", dataArquivo, atualizadoEm, linhasFonte },
) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("Nenhuma ação OCAD encontrada para consolidação.");
  }

  const chavesVistas = new Set();
  let totalLinhas = 0;

  const registros = itens.map((item) => {
    const secretariaCodigo = String(item.secretariaCodigo ?? "").trim();
    const unidadeCodigo = String(item.unidadeCodigo ?? "").trim();
    const programaFuncional = String(item.programaFuncional ?? "").trim();
    const chave = chaveLogicaAcao(secretariaCodigo, unidadeCodigo, programaFuncional);

    if (!/^\d{3}$/.test(secretariaCodigo)) {
      throw new Error(`Código de secretaria inválido na ação ${chave}: "${secretariaCodigo}"`);
    }
    if (!/^\d{3}$/.test(unidadeCodigo)) {
      throw new Error(`Código de unidade inválido na ação ${chave}: "${unidadeCodigo}"`);
    }
    if (!/^\d{17}$/.test(programaFuncional)) {
      throw new Error(
        `Programa funcional fora do padrão (esperado 17 dígitos) na ação ${chave}: "${programaFuncional}"`,
      );
    }
    if (chavesVistas.has(chave)) {
      throw new Error(`Chave lógica duplicada na base: ${chave}`);
    }
    chavesVistas.add(chave);

    const ponderador = Number(item.ponderador);
    if (!Number.isFinite(ponderador) || ponderador <= 0 || ponderador > 1) {
      throw new Error(`Ponderador inválido (${item.ponderador}) na ação ${chave}`);
    }

    if (item.classificacao !== "Exclusivo" && item.classificacao !== "Não exclusivo") {
      throw new Error(`Classificação inválida (${item.classificacao}) na ação ${chave}`);
    }

    if (!Array.isArray(item.fontes) || item.fontes.length === 0) {
      throw new Error(`Ação ${chave} sem fontes de recurso.`);
    }

    const fontesAgrupadas = new Map();
    for (const f of item.fontes) {
      const codigo = String(f.codigo ?? "").trim();
      if (!/^\d{8}$/.test(codigo)) {
        throw new Error(
          `Fonte de Recursos fora do padrão na ação ${chave}: "${codigo}". ` +
            `Esperado um código de 8 dígitos.`,
        );
      }
      totalLinhas += 1;

      const atual = fontesAgrupadas.get(codigo) ?? {
        codigo,
        nome: String(f.nome ?? "").trim(),
        dotacaoInicial: 0,
        ocadInicial: 0,
        ocadAtualizado: 0,
        ocadEmpenhado: 0,
        ocadLiquidado: 0,
        ocadPago: 0,
      };

      atual.dotacaoInicial += Number(f.dotacaoInicial ?? 0);
      atual.ocadInicial += Number(f.ocadInicial ?? 0);
      atual.ocadAtualizado += Number(f.ocadAtualizado ?? 0);
      atual.ocadEmpenhado += Number(f.ocadEmpenhado ?? 0);
      atual.ocadLiquidado += Number(f.ocadLiquidado ?? 0);
      atual.ocadPago += Number(f.ocadPago ?? 0);
      fontesAgrupadas.set(codigo, atual);
    }

    let somaDotacaoInicial = 0;
    let somaOcadInicial = 0;
    let somaOcadAtualizado = 0;
    let somaOcadEmpenhado = 0;
    let somaOcadLiquidado = 0;
    let somaOcadPago = 0;

    for (const f of fontesAgrupadas.values()) {
      somaDotacaoInicial += f.dotacaoInicial;
      somaOcadInicial += f.ocadInicial;
      somaOcadAtualizado += f.ocadAtualizado;
      somaOcadEmpenhado += f.ocadEmpenhado;
      somaOcadLiquidado += f.ocadLiquidado;
      somaOcadPago += f.ocadPago;
    }

    const fontes = [...fontesAgrupadas.values()]
      .map((f) => {
        const atualizado = centavos(f.ocadAtualizado);
        const liquidado = centavos(f.ocadLiquidado);
        return {
          codigo: f.codigo,
          nome: f.nome,
          dotacaoInicial: centavos(f.dotacaoInicial),
          ocadInicial: centavos(f.ocadInicial),
          ocadAtualizado: atualizado,
          ocadEmpenhado: centavos(f.ocadEmpenhado),
          ocadLiquidado: liquidado,
          ocadPago: centavos(f.ocadPago),
          ocadDisponivel: centavos(atualizado - liquidado),
        };
      })
      .sort((x, y) => y.ocadInicial - x.ocadInicial);

    const ocadAtualizado = centavos(somaOcadAtualizado);
    const ocadLiquidado = centavos(somaOcadLiquidado);

    const registro = {
      ano: Number(item.ano ?? ano),
      secretariaCodigo,
      secretariaNome: String(item.secretariaNome ?? "").trim(),
      unidadeCodigo,
      unidadeNome: String(item.unidadeNome ?? "").trim(),
      acaoCodigo: String(item.acaoCodigo ?? programaFuncional.slice(-8)).trim(),
      acao: String(item.acao ?? "").trim(),
      programaFuncional,
      eixo: resolverEixo(chave, programaFuncional, item.eixo),
      classificacao: item.classificacao,
      ponderador,
      fontes,
      dotacaoInicial: centavos(somaDotacaoInicial),
      ocadInicial: centavos(somaOcadInicial),
      ocadAtualizado,
      ocadEmpenhado: centavos(somaOcadEmpenhado),
      ocadLiquidado,
      ocadPago: centavos(somaOcadPago),
      ocadDisponivel: centavos(ocadAtualizado - ocadLiquidado),
    };

    /*
     * A comparação em centavos inteiros admite até 1 centavo de desvio por fonte
     * por conta do arredondamento individual vs arredondamento no total da ação.
     */
    for (const campo of CAMPOS_VALOR) {
      if (!Number.isFinite(registro[campo])) {
        throw new Error(`Valor não numérico em ${campo} na ação ${chave}`);
      }
      const soma = fontes.reduce((t, f) => t + Math.round(f[campo] * 100), 0);
      if (Math.abs(soma - Math.round(registro[campo] * 100)) > fontes.length) {
        throw new Error(
          `Soma das fontes diverge do total da ação em ${campo}: ` +
            `${soma / 100} ≠ ${registro[campo]} (${chave})`,
        );
      }
    }

    return registro;
  });

  const somaCampo = (campo) =>
    centavos(registros.reduce((t, r) => t + r[campo], 0));

  const porClassificacao = registros.reduce((acc, r) => {
    const a = (acc[r.classificacao] ??= {
      acoes: 0,
      ocadInicial: 0,
      ocadLiquidado: 0,
    });
    a.acoes += 1;
    a.ocadInicial = centavos(a.ocadInicial + r.ocadInicial);
    a.ocadLiquidado = centavos(a.ocadLiquidado + r.ocadLiquidado);
    return acc;
  }, {});

  const anos = [...new Set(registros.map((r) => r.ano))].sort((a, b) => a - b);

  const meta = {
    arquivoFonte,
    origem,
    origemTipo,
    dataArquivo,
    geradoEm: hojeRioBranco(),
    atualizadoEm: atualizadoEm ?? formatarIsoRioBranco(),
    anos,
    linhasFonte: linhasFonte ?? totalLinhas,
    acoes: registros.length,
    fontesDistintas: new Set(
      registros.flatMap((r) => r.fontes.map((f) => f.codigo)),
    ).size,
    eixoDerivado: true,
    totais: {
      dotacaoInicial: somaCampo("dotacaoInicial"),
      ocadInicial: somaCampo("ocadInicial"),
      ocadAtualizado: somaCampo("ocadAtualizado"),
      ocadEmpenhado: somaCampo("ocadEmpenhado"),
      ocadLiquidado: somaCampo("ocadLiquidado"),
      ocadPago: somaCampo("ocadPago"),
      ocadDisponivel: somaCampo("ocadDisponivel"),
    },
    porClassificacao,
  };

  return { registros, meta };
}

/**
 * Lê a base atualmente gravada em `data/`, retornando `null` se não existir.
 */
export async function lerBaseAtual(raiz) {
  try {
    const [dadosRaw, metaRaw] = await Promise.all([
      readFile(resolve(raiz, "data", "base-ocad.json"), "utf8"),
      readFile(resolve(raiz, "data", "base-ocad.meta.json"), "utf8"),
    ]);
    return {
      registros: JSON.parse(dadosRaw),
      meta: JSON.parse(metaRaw),
    };
  } catch (err) {
    if (err && err.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Travas de segurança equivalentes ao `assessAutoPublish` do Orçamentos
 * Temáticos para evitar que uma coleta parcial ou vazia sobrescreva a base.
 */
export function validarSegurancaAtualizacao(
  novosRegistros,
  novoMeta,
  baseAtual,
  { force = false } = {},
) {
  if (!Array.isArray(novosRegistros) || novosRegistros.length === 0) {
    throw new Error("Bloqueado: a nova base não possui nenhuma ação.");
  }
  if (novoMeta.fontesDistintas === 0) {
    throw new Error("Bloqueado: a nova base não possui fontes de recurso.");
  }
  if (novoMeta.totais.ocadAtualizado <= 0 && novoMeta.totais.ocadInicial <= 0) {
    throw new Error("Bloqueado: totais orçamentários zerados na nova base.");
  }

  if (!baseAtual || !Array.isArray(baseAtual.registros) || baseAtual.registros.length === 0) {
    return;
  }

  const anosAtuais = new Set(baseAtual.registros.map((r) => r.ano));
  const mesmoExercicio = novoMeta.anos.some((a) => anosAtuais.has(a));

  if (mesmoExercicio && !force) {
    const minimo = Math.floor(baseAtual.registros.length * MIN_ACTION_COUNT_RATIO);
    if (novosRegistros.length < minimo) {
      throw new Error(
        `Bloqueado por trava de segurança: a nova base tem ${novosRegistros.length} ações, ` +
          `abaixo de ${Math.round(MIN_ACTION_COUNT_RATIO * 100)}% da base atual (${baseAtual.registros.length} ações, mínimo ${minimo}). ` +
          `Use --force se a redução for intencional.`,
      );
    }
  }
}

/**
 * Grava `data/base-ocad.json` e `data/base-ocad.meta.json` somente quando houver
 * mudança substantiva nos registros ou na data/origem do corte, evitando commits
 * vazios apenas pela mudança de `geradoEm`.
 */
export async function gravarBaseSeAlterada(raiz, { registros, meta }, baseAtual) {
  const destinoDados = resolve(raiz, "data", "base-ocad.json");
  const destinoMeta = resolve(raiz, "data", "base-ocad.meta.json");

  const dadosJson = JSON.stringify(registros, null, 2);

  if (baseAtual) {
    const dadosAtuaisJson = JSON.stringify(baseAtual.registros, null, 2);
    const metaSubstantivaIgual =
      baseAtual.meta?.dataArquivo === meta.dataArquivo &&
      baseAtual.meta?.arquivoFonte === meta.arquivoFonte &&
      baseAtual.meta?.origem === meta.origem &&
      (baseAtual.meta?.origemTipo ?? "planilha") === (meta.origemTipo ?? "planilha");

    if (dadosJson === dadosAtuaisJson && metaSubstantivaIgual) {
      return { alterado: false, destinoDados, destinoMeta };
    }
  }

  await writeFile(destinoDados, dadosJson, "utf8");
  await writeFile(destinoMeta, JSON.stringify(meta, null, 2), "utf8");
  return { alterado: true, destinoDados, destinoMeta };
}

export function imprimirResumo(meta, { linhasUteis } = {}) {
  console.log(`Fonte: ${meta.arquivoFonte} (corte ${meta.dataArquivo})`);
  console.log(
    `${linhasUteis ?? meta.linhasFonte} linhas → ${meta.acoes} ações (${meta.fontesDistintas} fontes distintas)`,
  );
  console.log("--- Totais ponderados ---");
  console.log(`OCAD Inicial:    ${reais(meta.totais.ocadInicial)}`);
  console.log(`OCAD Atualizado: ${reais(meta.totais.ocadAtualizado)}`);
  console.log(`OCAD Empenhado:  ${reais(meta.totais.ocadEmpenhado)}`);
  console.log(`OCAD Liquidado:  ${reais(meta.totais.ocadLiquidado)}`);
  console.log(`OCAD Pago:       ${reais(meta.totais.ocadPago)}`);
  console.log(`OCAD Disponível: ${reais(meta.totais.ocadDisponivel)}`);
  for (const [k, v] of Object.entries(meta.porClassificacao)) {
    console.log(`  ${k}: ${v.acoes} ações | inicial ${reais(v.ocadInicial)}`);
  }
}
