/**
 * Coleta diretamente do SICAF (`app.wprelocad` — "Emitir Relatório do Orçamento
 * Criança e Adolescente") a planilha Excel com os filtros oficiais do OCAD e
 * atualiza `data/base-ocad.json` e `data/base-ocad.meta.json`.
 *
 * Variáveis de ambiente obrigatórias:
 *   SICAF_CPF    CPF de acesso ao SICAF
 *   SICAF_SENHA  Senha de acesso ao SICAF
 *
 * Certificado TLS:
 *   O servidor do SICAF não envia o certificado intermediário Sectigo OV R36;
 *   execute com `NODE_EXTRA_CA_CERTS=scripts/certs/sectigo-ov-r36.pem`.
 *
 * Uso:
 *   npm run dados:sicaf
 *   npm run dados:sicaf -- --dry-run
 *   npm run dados:sicaf -- --mes=11 --ano=2026 --force
 *   npm run dados:sicaf -- --aguardar-manutencao
 */

import { appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { setTimeout as aguardarMs } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import {
  consolidarRegistrosOcad,
  formatarIsoRioBranco,
  gravarBaseSeAlterada,
  hojeRioBranco,
  imprimirResumo,
  lerBaseAtual,
  lerPlanilhaOcadBuffer,
  reais,
  validarSegurancaAtualizacao,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const SICAF_BASE = "https://sicaf.sefaz.ac.gov.br/sicaf/";
const TIMEOUT_MS = 30_000;
const INTERVALO_MANUTENCAO_MS = 5 * 60_000;
const ESPERA_MAX_MANUTENCAO_MIN = 240;

/**
 * Filtros fixos de `app.wprelocad` ("Emitir Relatório do Orçamento Criança e
 * Adolescente"), mantendo o recorte integral por unidade e todos os grupos.
 */
const FILTROS_WPRELOCAD = {
  vCDGORGI: "000",
  vCDGORGF: "999",
  vCDGUNII: "000",
  vCDGUNIF: "999",
  vRDZFPPAI: "0",
  vRDZFPPAF: "99999999999",
  vCDGFNTRCSI: "0",
  vCDGFNTRCSF: "99999999",
  vGRUPO: "9", // Todos
  vTIPOREL: "U", // Por Unidade
};

function mesAtualRioBranco() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Rio_Branco",
      month: "numeric",
    }).format(new Date()),
  );
}

function lerArgs(argv) {
  const hoje = hojeRioBranco();
  const opts = {
    dryRun: false,
    force: false,
    aguardarManutencao: false,
    esperaMaxMin: ESPERA_MAX_MANUTENCAO_MIN,
    ano: Number(hoje.slice(0, 4)),
    mes: mesAtualRioBranco(),
  };

  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--force") opts.force = true;
    else if (arg === "--aguardar-manutencao") opts.aguardarManutencao = true;
    else if (arg.startsWith("--espera-max-min=")) {
      opts.esperaMaxMin = Number(arg.slice("--espera-max-min=".length));
    } else if (arg.startsWith("--ano=")) opts.ano = Number(arg.slice("--ano=".length));
    else if (arg.startsWith("--mes=")) opts.mes = Number(arg.slice("--mes=".length));
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }

  if (!Number.isInteger(opts.ano) || opts.ano < 2000 || opts.ano > 2100) {
    throw new Error(`Exercício inválido: ${opts.ano}`);
  }
  if (!Number.isInteger(opts.mes) || opts.mes < 1 || opts.mes > 12) {
    throw new Error(`Mês inválido: ${opts.mes}`);
  }
  if (!Number.isFinite(opts.esperaMaxMin) || opts.esperaMaxMin < 0) {
    throw new Error(`Espera máxima inválida: ${opts.esperaMaxMin}`);
  }

  return opts;
}

function criarSessaoHttp() {
  const cookies = new Map();

  const guardarCookies = (headers) => {
    const lista = headers.getSetCookie ? headers.getSetCookie() : [];
    for (const item of lista) {
      const [par] = item.split(";");
      const eq = par.indexOf("=");
      if (eq > 0) {
        cookies.set(par.slice(0, eq).trim(), par.slice(eq + 1).trim());
      }
    }
  };

  const cabecalhoCookie = () =>
    [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

  return async function requisitar(caminho, init = {}) {
    const url = new URL(caminho, SICAF_BASE).toString();
    const headers = new Headers(init.headers ?? {});
    const cookie = cabecalhoCookie();
    if (cookie) headers.set("Cookie", cookie);

    let resp;
    try {
      resp = await fetch(url, {
        ...init,
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      const causa = err?.cause?.code ?? err?.cause?.message;
      const dicaCert =
        causa === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
          ? " Defina NODE_EXTRA_CA_CERTS=scripts/certs/sectigo-ov-r36.pem."
          : "";
      throw new Error(
        `Falha de rede ao acessar ${url}${causa ? ` (causa: ${causa})` : ""}.${dicaCert}`,
        { cause: err },
      );
    }

    guardarCookies(resp.headers);
    return resp;
  };
}

function extrairExercicioAtivo(html) {
  const m = html.match(/"vEXRORC"\s*:\s*"(\d{4})"/);
  return m ? Number(m[1]) : null;
}

function verificarBloqueioWaf(html, etapa) {
  if (/Acesso bloqueado/i.test(html)) {
    throw new Error(`WAF da SEFAZ bloqueou a requisição em "${etapa}".`);
  }
}

function decodificarEntidadesHtml(texto) {
  return texto
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, cod) => String.fromCodePoint(Number(cod)))
    .replace(/&amp;/g, "&");
}

function extrairPrevisaoRioBranco(textoLimpo) {
  const m =
    textoLimpo.match(/PREVIS[ÃA]O DE RESTABELECIMENTO\s*:?\s*(\d{1,2})\s*[:hH]\s*(\d{2})?/i) ??
    textoLimpo.match(/(?:at[eé]|[àa]s)\s*(\d{1,2})\s*[:hH]\s*(\d{2})?/i);
  if (!m) return { previsaoMs: null, previsaoTexto: null };

  const hora = Number(m[1]);
  const minuto = m[2] ? Number(m[2]) : 0;
  if (!Number.isInteger(hora) || hora < 0 || hora > 23 || !Number.isInteger(minuto) || minuto < 0 || minuto > 59) {
    return { previsaoMs: null, previsaoTexto: null };
  }

  const hh = String(hora).padStart(2, "0");
  const mm = String(minuto).padStart(2, "0");
  // America/Rio_Branco possui fuso fixo UTC-5 (sem horário de verão).
  const dataHojeAc = hojeRioBranco();
  const previsaoMs = Date.parse(`${dataHojeAc}T${hh}:${mm}:00-05:00`);
  if (!Number.isFinite(previsaoMs)) {
    return { previsaoMs: null, previsaoTexto: null };
  }
  return { previsaoMs, previsaoTexto: `${hh}:${mm}` };
}

function extrairEstadoBloqueioSicaf(html) {
  const mGx =
    html.match(/name="GXState"\s+value='([^']+)'/i) ??
    html.match(/name="GXState"\s+value="([^"]+)"/i);

  let sdt = null;
  if (mGx) {
    try {
      const gx = JSON.parse(decodificarEntidadesHtml(mGx[1]));
      sdt = gx?.vSDTSISTEMA ?? null;
    } catch {
      sdt = null;
    }
  }

  const bloqueadoFlag = Boolean(sdt?.SistemaBloqueado);
  const bloqueadoTexto = /MANUTEN[ÇC][ÃA]O PROGRAMADA/i.test(html);
  if (!bloqueadoFlag && !bloqueadoTexto) {
    return { bloqueado: false, mensagem: "", previsaoMs: null, previsaoTexto: null };
  }

  const htmlMsg = String(sdt?.SistemaMensagemBloqueio ?? "");
  const textoLimpo = decodificarEntidadesHtml(htmlMsg)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const mensagem = textoLimpo || "SICAF temporariamente indisponível para manutenção programada.";
  const { previsaoMs, previsaoTexto } = extrairPrevisaoRioBranco(mensagem);
  return { bloqueado: true, mensagem, previsaoMs, previsaoTexto };
}

async function abrirLoginSicafAguardandoManutencao(opts) {
  const inicio = Date.now();
  const limiteMs = inicio + opts.esperaMaxMin * 60_000;

  while (true) {
    const requisitar = criarSessaoHttp();
    const rLoginGet = await requisitar("app.sicaf");
    const htmlLogin = await rLoginGet.text();
    verificarBloqueioWaf(htmlLogin, "abertura do login");

    const estado =
      rLoginGet.status === 502 || rLoginGet.status === 503 || rLoginGet.status === 504
        ? {
            bloqueado: true,
            mensagem: `SICAF temporariamente indisponível (HTTP ${rLoginGet.status}).`,
            previsaoMs: null,
            previsaoTexto: null,
          }
        : extrairEstadoBloqueioSicaf(htmlLogin);
    if (!estado.bloqueado) {
      if (Date.now() - inicio > 5_000) {
        console.log("SICAF restabelecido! Prosseguindo com a autenticação...");
      }
      return requisitar;
    }

    if (!opts.aguardarManutencao) {
      throw new Error(`SICAF em manutenção/bloqueado: ${estado.mensagem}`);
    }

    const agora = Date.now();
    if (agora >= limiteMs) {
      throw new Error(
        `SICAF permaneceu em manutenção após ${opts.esperaMaxMin} min: ${estado.mensagem}`,
      );
    }

    // Verifica a cada 5 min e também logo após o horário previsto de restabelecimento.
    const alvoPrevisao =
      estado.previsaoMs && estado.previsaoMs > agora ? estado.previsaoMs + 30_000 : null;
    const proximoCheck = Math.min(
      limiteMs,
      alvoPrevisao ? Math.min(agora + INTERVALO_MANUTENCAO_MS, alvoPrevisao) : agora + INTERVALO_MANUTENCAO_MS,
    );
    const esperaMs = Math.max(15_000, proximoCheck - agora);
    const esperaMin = (esperaMs / 60_000).toFixed(1).replace(/\.0$/, "");
    const horaAc = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Rio_Branco",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(agora));

    console.log(
      `[${horaAc} AC] SICAF em manutenção programada${estado.previsaoTexto ? ` (previsão: ${estado.previsaoTexto} AC)` : ""}. Nova verificação em ${esperaMin} min...`,
    );
    await aguardarMs(esperaMs);
  }
}

function extrairNomeEDataArquivo(location) {
  const url = new URL(location, SICAF_BASE);
  const queryBruta = url.search.replace(/^\?/, "");
  const primeiroSegmento = decodeURIComponent(queryBruta.split(",")[0] ?? "").trim();
  const nome = primeiroSegmento || `OCAD_sicaf_${hojeRioBranco()}.xls`;
  const mData = nome.match(/(\d{4})(\d{2})(\d{2})\.xls/i);
  const dataArquivo = mData ? `${mData[1]}-${mData[2]}-${mData[3]}` : hojeRioBranco();
  return { nome, dataArquivo, downloadUrl: url.toString() };
}

async function registrarStepSummary({ meta, baseAtual, alterado, dryRun, mes }) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const status = dryRun
    ? "Simulação (`dry_run`)"
    : alterado
      ? "Atualizado"
      : "Sem alterações";

  const linhas = [
    "## Coleta direta do OCAD no SICAF (`app.wprelocad`)",
    "",
    `- **Situação:** ${status}`,
    `- **Fonte:** ${meta.arquivoFonte} (${meta.origem})`,
    `- **Competência:** exercício ${meta.anos.join(", ")}, mês ${mes}`,
    `- **Data de corte:** ${meta.dataArquivo}`,
    `- **Atualizado em:** ${meta.atualizadoEm}`,
    `- **Ações:** ${meta.acoes}${baseAtual ? ` (antes: ${baseAtual.meta?.acoes ?? "?"})` : ""}`,
    `- **Fontes distintas:** ${meta.fontesDistintas}`,
    `- **OCAD Inicial:** ${reais(meta.totais.ocadInicial)}`,
    `- **OCAD Atualizado:** ${reais(meta.totais.ocadAtualizado)}`,
    `- **OCAD Empenhado:** ${reais(meta.totais.ocadEmpenhado)}`,
    `- **OCAD Liquidado:** ${reais(meta.totais.ocadLiquidado)}`,
    `- **OCAD Pago:** ${reais(meta.totais.ocadPago)}`,
    "",
  ];

  await appendFile(summaryPath, linhas.join("\n"), "utf8");
}

async function main() {
  const cpf = process.env.SICAF_CPF?.trim();
  const senha = process.env.SICAF_SENHA;
  if (!cpf || !senha) {
    throw new Error(
      "Credenciais ausentes: defina as variáveis de ambiente SICAF_CPF e SICAF_SENHA.",
    );
  }

  const opts = lerArgs(process.argv.slice(2));

  console.log("1/4 Abrindo página de login do SICAF...");
  const requisitar = await abrirLoginSicafAguardandoManutencao(opts);

  console.log("2/4 Autenticando sessão no SICAF...");
  const rLoginPost = await requisitar("app.sicaf", {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: new URL("app.sicaf", SICAF_BASE).toString(),
    },
    body: new URLSearchParams({
      vLOGONTO: "1",
      vUSUARIOLOGIN: cpf,
      vUSUARIOSENHA: senha,
      vURL: "",
      vUSUARIOSENHAAUX: "",
      GXState: "undefined",
      _EventName: "E'DOACESSAR'.",
      _EventGridId: "",
      _EventRowId: "",
    }).toString(),
  });

  const destinoLogin = rLoginPost.headers.get("location") ?? "";
  if (rLoginPost.status !== 302 || !destinoLogin || /app\.sicaf$/i.test(destinoLogin)) {
    const corpoErro = await rLoginPost.text().catch(() => "");
    verificarBloqueioWaf(corpoErro, "autenticação");
    const estado = extrairEstadoBloqueioSicaf(corpoErro);
    if (estado.bloqueado) {
      throw new Error(`SICAF em manutenção/bloqueado: ${estado.mensagem}`);
    }
    throw new Error(
      `Falha na autenticação do SICAF (HTTP ${rLoginPost.status}). Verifique SICAF_CPF e SICAF_SENHA.`,
    );
  }

  console.log("3/4 Abrindo app.wprelocad e disparando exportação Excel...");
  const rRelGet = await requisitar("app.wprelocad", { redirect: "manual" });
  if (rRelGet.status !== 200) {
    throw new Error(
      `Não foi possível abrir app.wprelocad (HTTP ${rRelGet.status}).`,
    );
  }
  const htmlRel = await rRelGet.text();
  verificarBloqueioWaf(htmlRel, "abertura de app.wprelocad");

  const exercicioAtivo = extrairExercicioAtivo(htmlRel);
  if (exercicioAtivo !== null && exercicioAtivo !== opts.ano) {
    throw new Error(
      `Exercício ativo no SICAF (${exercicioAtivo}) diverge do solicitado (${opts.ano}).`,
    );
  }

  const rExcelPost = await requisitar("app.wprelocad", {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: new URL("app.wprelocad", SICAF_BASE).toString(),
    },
    body: new URLSearchParams({
      ...FILTROS_WPRELOCAD,
      vMES: String(opts.mes),
      GXState: "undefined",
      _EventName: "E'DOEXCEL'.",
      _EventGridId: "",
      _EventRowId: "",
    }).toString(),
  });

  const locExcel = rExcelPost.headers.get("location");
  if (rExcelPost.status !== 302 || !locExcel || !/\.xls/i.test(locExcel)) {
    const corpoExcel = await rExcelPost.text().catch(() => "");
    verificarBloqueioWaf(corpoExcel, "exportação Excel em app.wprelocad");
    throw new Error(
      `Exportação Excel em app.wprelocad não retornou arquivo (HTTP ${rExcelPost.status}).`,
    );
  }

  const { nome: arquivoFonte, dataArquivo, downloadUrl } =
    extrairNomeEDataArquivo(locExcel);
  console.log(`4/4 Baixando ${arquivoFonte} (mês ${opts.mes}, exercício ${opts.ano})...`);

  const rDownload = await requisitar(downloadUrl);
  if (!rDownload.ok) {
    throw new Error(`Falha ao baixar ${arquivoFonte} (HTTP ${rDownload.status}).`);
  }

  const buffer = Buffer.from(await rDownload.arrayBuffer());
  if (buffer.length < 1024) {
    throw new Error(`Arquivo baixado suspeito/vazio (${buffer.length} bytes).`);
  }

  const { itens, linhasUteis } = lerPlanilhaOcadBuffer(buffer, {
    ano: opts.ano,
    origem: arquivoFonte,
  });

  const base = consolidarRegistrosOcad(itens, {
    ano: opts.ano,
    arquivoFonte,
    origem: "SICAF/SEFAZ — Relatório OCAD (app.wprelocad)",
    origemTipo: "sicaf",
    dataArquivo,
    atualizadoEm: formatarIsoRioBranco(),
    linhasFonte: linhasUteis,
  });

  const baseAtual = await lerBaseAtual(raiz);
  validarSegurancaAtualizacao(base.registros, base.meta, baseAtual, {
    force: opts.force,
  });

  let alterado = false;
  if (opts.dryRun) {
    console.log("[dry-run] Coleta e validação aprovadas. Nenhum arquivo gravado.");
  } else {
    ({ alterado } = await gravarBaseSeAlterada(raiz, base, baseAtual));
    console.log(
      alterado
        ? "Base atualizada em data/base-ocad.json e data/base-ocad.meta.json."
        : "Base já está atualizada — nenhuma alteração gravada.",
    );
  }

  imprimirResumo(base.meta, { linhasUteis });
  await registrarStepSummary({
    meta: base.meta,
    baseAtual,
    alterado,
    dryRun: opts.dryRun,
    mes: opts.mes,
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
