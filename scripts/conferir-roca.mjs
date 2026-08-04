/**
 * Laudo de conciliação entre as três fontes do OCAD 2026:
 *
 *   1. planilha OCAD  (Planilhas/OCAD_Orcamento_Crianca_Adolescente_05.2026.xls)
 *   2. painel de orçamentos temáticos (data/visao-geral.json)
 *   3. ROCA em PDF    (data/roca-2026-acoes.json, via scripts/extrair-roca.py)
 *
 * As duas primeiras são a base oficial e devem bater entre si. O relatório é
 * conferido contra elas ação a ação.
 *
 * Uso: node scripts/conferir-roca.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PLANILHA = "Planilhas/OCAD_Orcamento_Crianca_Adolescente_05.2026.xls";
const TOTAL_TABELA_4 = 3_336_053_795.37;

// Eixos do ROCA, definidos por função orçamentária (Eixo I/II/III do relatório).
const EIXO_POR_FUNCAO = {
  "12": "Educação",
  "13": "Educação",
  "27": "Educação",
  "10": "Saúde",
  "16": "Saúde",
  "17": "Saúde",
  "08": "Assistência Social",
  "14": "Assistência Social",
};

// Totais que o ROCA imprime por bloco. A chave lista os códigos de unidade que
// compõem o bloco no relatório (SESACRE consolida FUNDES, FUNDHACRE e SEAD).
const TOTAIS_IMPRESSOS_POR_BLOCO = {
  "607+302+714": 854_914_081.46, // TOTAL SESACRE
  "213": 56_032_865.19, // TOTAL ISE
  "744": 4_048_143.19, // TOTAL HABITAÇÃO
  "754": 4_597_560.0, // TOTAL SANEAMENTO
  "762": 4_578_161.24, // TOTAL SEMULHER
  "303": 16_360_596.0, // TOTAL FEM
  "212": 33_490_714.41, // TOTAL IEPTEC
  "001+601": 2_335_791_942.39, // TOTAL SEE
  "760+608+606": 26_239_731.49, // TOTAL SEASDH
};

const TOTAL_ROCA_POR_EIXO = {
  "Educação": 2_385_643_252.8,
  "Saúde": 863_559_784.65,
  "Assistência Social": 86_850_757.92,
};

const numero = (v) => {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/\./g, "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
};

const reais = (v) =>
  `R$ ${(v ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const titulo = (t) => console.log(`\n${"=".repeat(78)}\n${t}\n${"=".repeat(78)}`);

/** Lê a planilha OCAD, aplicando o ponderador da coluna "Ref. %". */
function lerPlanilha() {
  const wb = XLSX.readFile(resolve(raiz, PLANILHA));
  const linhas = XLSX.utils
    .sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
      header: 1,
      blankrows: false,
      defval: null,
    })
    .slice(1)
    .filter((r) => ["EX", "NEX"].includes(String(r?.[6]).trim().toUpperCase()));

  return linhas.map((r) => {
    const fp = String(r[2] ?? "").trim();
    const ref = numero(r[7]) / 100;
    const dotacao = numero(r[4]);
    return {
      orgao: String(r[0] ?? "").replace("Órgão: ", "").trim().slice(0, 3),
      unidade: String(r[1] ?? "").replace("Unidade: ", "").trim().slice(0, 3),
      acaoCodigo: fp.slice(0, 17),
      acaoDescricao: fp.slice(20, 80),
      funcao: fp.slice(0, 2),
      tipo: String(r[6]).trim().toUpperCase(),
      ref,
      dotacaoInicial: dotacao,
      ocadInicial: dotacao * ref,
    };
  });
}

function agrupar(itens, chave, campo) {
  const m = new Map();
  for (const i of itens) m.set(chave(i), (m.get(chave(i)) ?? 0) + (i[campo] ?? 0));
  return m;
}

function main() {
  const planilha = lerPlanilha();
  const caminhoRoca = resolve(raiz, "data/roca-2026-acoes.json");
  const roca = existsSync(caminhoRoca)
    ? JSON.parse(readFileSync(caminhoRoca, "utf8")).filter(
        (r) => r.grupoFonte === "total",
      )
    : [];

  const totalPlanilha = planilha.reduce((t, r) => t + r.ocadInicial, 0);

  /* ---------------- 1. a base bate consigo mesma? ---------------- */
  titulo("1. BASE OFICIAL — planilha OCAD × painel de orçamentos temáticos");
  const caminhoPainel = resolve(raiz, "data/visao-geral.json");
  const painel = existsSync(caminhoPainel)
    ? JSON.parse(readFileSync(caminhoPainel, "utf8"))
    : [];
  const totalPainel = painel.reduce((t, r) => t + (r.ocadInicial ?? 0), 0);
  if (painel.length) {
    console.log(`planilha OCAD 05.2026 : ${reais(totalPlanilha)}  (${planilha.length} linhas)`);
    console.log(`painel (atual)        : ${reais(totalPainel)}  (${painel.length} ações)`);
    const delta = totalPainel - totalPlanilha;
    if (Math.abs(delta) < 0.5) {
      console.log("→ IDÊNTICOS: é a mesma base.");
    } else {
      // A planilha 05.2026 é um instantâneo anterior. As ações que só existem
      // no painel explicam a diferença; se não explicarem, há algo a investigar.
      const chavesPlan = new Set(
        planilha.map((p) => `${p.acaoCodigo}|${p.orgao}|${p.unidade}`),
      );
      const novas = painel.filter(
        (r) =>
          !chavesPlan.has(
            `${r.programaFuncional}|${r.secretariaCodigo}|${r.unidadeCodigo}`,
          ),
      );
      const somaNovas = novas.reduce((t, r) => t + r.ocadInicial, 0);
      console.log(
        `→ o painel tem ${reais(delta)} a mais — instantâneo posterior ao da planilha.`,
      );
      for (const n of novas) {
        console.log(
          `   + ${n.programaFuncional}  ${n.secretariaCodigo}/${n.unidadeCodigo}  ${reais(n.ocadInicial)}  ${n.acao.slice(0, 40)}`,
        );
      }
      console.log(
        Math.abs(somaNovas - delta) < 0.5
          ? "   → as ações novas explicam integralmente a diferença."
          : `   → ATENÇÃO: as ações novas somam ${reais(somaNovas)}, e não a diferença toda.`,
      );
    }
  }

  // Daqui em diante a referência é o painel — instantâneo mais recente da base.
  const base = painel.map((r) => ({
    orgao: r.secretariaCodigo,
    unidade: r.unidadeCodigo,
    acaoCodigo: r.programaFuncional,
    acaoDescricao: r.acao,
    funcao: String(r.programaFuncional).slice(0, 2),
    dotacaoInicial: r.dotacaoInicial,
    ocadInicial: r.ocadInicial,
  }));

  /* ---------------- 2. ações compartilhadas na base ---------------- */
  titulo("2. AÇÕES DA BASE PRESENTES EM MAIS DE UM ÓRGÃO OU UNIDADE");
  console.log(
    "Compartilhar uma ação é legítimo quando dois órgãos executam parcelas dela\n" +
      "— folha centralizada na SEAD e execução na secretaria, por exemplo. Aqui\n" +
      "elas são apenas listadas, para conferência contra a classificação oficial.\n",
  );
  const locaisPorAcao = new Map();
  for (const r of base) {
    if (!locaisPorAcao.has(r.acaoCodigo)) locaisPorAcao.set(r.acaoCodigo, new Map());
    const m = locaisPorAcao.get(r.acaoCodigo);
    const k = `${r.orgao}/${r.unidade}`;
    m.set(k, { soma: (m.get(k)?.soma ?? 0) + r.ocadInicial, desc: r.acaoDescricao });
  }
  const compartilhadas = [...locaisPorAcao].filter(([, m]) => m.size > 1);
  if (compartilhadas.length === 0) {
    console.log(`nenhuma — ${locaisPorAcao.size} ações, cada uma em um único local`);
  }
  for (const [cod, locais] of compartilhadas) {
    const total = [...locais.values()].reduce((t, v) => t + v.soma, 0);
    console.log(`${cod}  ${[...locais.values()][0].desc.slice(0, 44)}`);
    for (const [k, v] of locais) console.log(`     ${k}  ${reais(v.soma).padStart(22)}`);
    console.log(`     ${"soma".padEnd(7)} ${reais(total).padStart(22)}`);
  }

  if (roca.length === 0) {
    console.log(
      "\n(data/roca-2026-acoes.json ausente — rode scripts/extrair-roca.py para as seções 3 a 5)",
    );
    return;
  }

  /* ---------------- 3. duplicidades no ROCA ---------------- */
  titulo("3. DUPLICIDADES NO ROCA (mesma ação em mais de uma unidade)");
  const porAcaoRoca = new Map();
  for (const r of roca) {
    const u = `${r.unidadeCodigo} ${r.unidadeNome}`.slice(0, 34);
    if (!porAcaoRoca.has(r.acaoCodigo)) porAcaoRoca.set(r.acaoCodigo, new Map());
    const m = porAcaoRoca.get(r.acaoCodigo);
    m.set(u, {
      soma: (m.get(u)?.soma ?? 0) + (r.ocadInicial ?? 0),
      pagina: r.pagina,
      descricao: r.acaoDescricao,
    });
  }
  const dupRoca = [...porAcaoRoca].filter(([, u]) => u.size > 1);
  for (const [cod, unidades] of dupRoca) {
    const naBase = base.filter((p) => p.acaoCodigo === cod);
    const orgaosBase = [...new Set(naBase.map((p) => `${p.orgao}/${p.unidade}`))];
    console.log(`\nAÇÃO ${cod}`);
    for (const [u, v] of unidades) {
      console.log(`   ROCA  pág.${String(v.pagina).padStart(2)}  ${reais(v.soma).padStart(22)}  ${u}`);
    }
    console.log(
      `   BASE  ${orgaosBase.length ? orgaosBase.join(", ") : "ausente"}  ${reais(
        naBase.reduce((t, p) => t + p.ocadInicial, 0),
      )}`,
    );
  }
  if (dupRoca.length === 0) console.log("nenhuma");

  /* ---------------- 4. ponderação não aplicada ---------------- */
  titulo("4. PONDERAÇÃO — linhas do ROCA em que OCAD INICIAL ≠ dotação × Ref");
  console.log(
    "Só entram linhas cuja leitura é íntegra (dotação, Ref e OCAD inicial legíveis),\n" +
      "e a conferência é cruzada com o valor da mesma ação na base.\n",
  );
  const suspeitas = [];
  for (const r of roca) {
    if (r.dotacaoInicial == null || r.ocadInicial == null || r.ref == null) continue;
    const ref = r.ref > 1.5 ? r.ref / 100 : r.ref;
    const esperado = Math.round(r.dotacaoInicial * ref * 100) / 100;
    if (Math.abs(esperado - r.ocadInicial) <= 0.05) continue;

    const naBase = base.filter((p) => p.acaoCodigo === r.acaoCodigo);
    const brutoBase = naBase.reduce((t, p) => t + p.dotacaoInicial, 0);
    const pondBase = naBase.reduce((t, p) => t + p.ocadInicial, 0);
    // A dotação do relatório tem de bater com a da base; se não bater, a linha
    // provavelmente foi contaminada por um subtotal na extração e não serve
    // como evidência.
    const legivel = naBase.length > 0 && Math.abs(brutoBase - r.dotacaoInicial) < 0.5;
    const valorConfere = legivel && Math.abs(r.ocadInicial - pondBase) < 0.5;
    const classe = !legivel
      ? "INCONCLUSIVO  (leitura da linha não confere com a base)"
      : valorConfere
        ? "REF IMPRESSA ERRADA  (valor correto, sem impacto financeiro)"
        : "PONDERAÇÃO NÃO APLICADA  (impacto financeiro)";
    suspeitas.push({ r, esperado, ref, brutoBase, pondBase, legivel, valorConfere, classe });
  }
  const ordem = (s) => (!s.legivel ? 2 : s.valorConfere ? 1 : 0);
  for (const s of suspeitas.sort((a, b) => ordem(a) - ordem(b))) {
    const { r } = s;
    console.log(
      `\n${s.classe}\n   pág.${r.pagina}  ${r.acaoCodigo}  ${r.unidadeCodigo} ${(r.unidadeNome || "").slice(0, 24)}`,
    );
    console.log(
      `   ROCA: dotação ${reais(r.dotacaoInicial)} × ${(s.ref * 100).toFixed(0)}% ⇒ ${reais(s.esperado)}, mas imprime ${reais(r.ocadInicial)}`,
    );
    console.log(
      `   BASE: dotação ${reais(s.brutoBase)} ⇒ OCAD inicial ${reais(s.pondBase)}`,
    );
    if (!s.valorConfere && s.legivel) {
      console.log(`   ⇒ o relatório soma ${reais(r.ocadInicial - s.pondBase)} a mais nesta ação`);
    }
  }
  if (suspeitas.length === 0) console.log("nenhuma");

  /* ---------------- 5. códigos inexistentes na base ---------------- */
  titulo("5. CÓDIGOS DO ROCA QUE NÃO EXISTEM NA BASE");
  console.log(
    "Quando uma ação da mesma unidade tem exatamente a mesma dotação, o código\n" +
      "impresso é um erro de digitação — o valor está certo, o identificador não.\n",
  );
  const codsBase = new Set(base.map((p) => p.acaoCodigo));
  const orfaos = [...porAcaoRoca.keys()].filter((c) => !codsBase.has(c));
  for (const c of orfaos) {
    for (const [unidade, v] of porAcaoRoca.get(c)) {
      const cod3 = unidade.slice(0, 3);
      const candidatos = base.filter(
        (p) =>
          (p.orgao === cod3 || p.unidade === cod3) &&
          Math.abs(p.ocadInicial - v.soma) < 0.5 &&
          !codsBase.has(c),
      );
      console.log(`  ${c}  ${reais(v.soma).padStart(20)}  pág.${v.pagina}  ${unidade}`);
      for (const cand of candidatos.slice(0, 2)) {
        console.log(
          `       ↳ na base, mesmo valor: ${cand.acaoCodigo}  ${cand.acaoDescricao.slice(0, 46)}`,
        );
      }
    }
  }
  if (orfaos.length === 0) console.log("nenhum");

  /* ---------------- 6. reconciliação por eixo ---------------- */
  titulo("6. RECONCILIAÇÃO POR EIXO (funções orçamentárias do próprio ROCA)");
  console.log("Base: painel atual, agrupado pela função da funcional programática.\n");
  const baseEixo = agrupar(
    painel.map((r) => ({
      ...r,
      eixo: EIXO_POR_FUNCAO[String(r.programaFuncional).slice(0, 2)] ?? "?",
    })),
    (r) => r.eixo,
    "ocadInicial",
  );
  const totalBase = totalPainel;
  let somaDelta = 0;
  for (const [eixo, totalRoca] of Object.entries(TOTAL_ROCA_POR_EIXO)) {
    const b = baseEixo.get(eixo) ?? 0;
    const delta = totalRoca - b;
    somaDelta += delta;
    console.log(
      `${eixo.padEnd(20)} ROCA ${reais(totalRoca).padStart(22)}  base ${reais(b).padStart(22)}  Δ ${reais(delta).padStart(20)}`,
    );
  }
  console.log("-".repeat(78));
  console.log(
    `${"TOTAL".padEnd(20)} ROCA ${reais(TOTAL_TABELA_4).padStart(22)}  base ${reais(totalBase).padStart(22)}  Δ ${reais(TOTAL_TABELA_4 - totalBase).padStart(20)}`,
  );
  const fecha = Math.abs(somaDelta - (TOTAL_TABELA_4 - totalBase)) < 0.5;
  console.log(
    fecha
      ? "→ a soma das diferenças por eixo reproduz exatamente a diferença total."
      : `→ ATENÇÃO: soma por eixo ${reais(somaDelta)} não reproduz a diferença total.`,
  );

  /* ---------------- 7. cobertura da leitura do PDF ---------------- */
  titulo("7. COBERTURA DA LEITURA DO PDF, POR BLOCO DO RELATÓRIO");
  console.log(
    "Um bloco só sustenta conclusão exaustiva se o extraído reproduz o total\n" +
      "que o próprio relatório imprime para ele.\n",
  );
  for (const [bloco, impresso] of Object.entries(TOTAIS_IMPRESSOS_POR_BLOCO)) {
    const lido = roca
      .filter((r) => bloco.split("+").includes(r.unidadeCodigo))
      .reduce((t, r) => t + (r.ocadInicial ?? 0), 0);
    const ok = Math.abs(lido - impresso) < 0.5;
    console.log(
      `${ok ? "RECONCILIA  " : "INCOMPLETO  "}${bloco.padEnd(16)} lido ${reais(lido).padStart(22)}  impresso ${reais(impresso).padStart(22)}`,
    );
  }
  const acoesRoca = new Set(roca.map((r) => r.acaoCodigo)).size;
  console.log(
    `\nações lidas no relatório: ${acoesRoca} · ações na base: ${new Set(base.map((p) => p.acaoCodigo)).size}`,
  );
}

main();
