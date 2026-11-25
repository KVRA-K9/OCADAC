/**
 * Gera a base do site a partir da planilha OCAD — a mesma que alimenta o BI.
 *
 * Formato de entrada (uma linha por ação × fonte de recurso):
 *   Órgão | Unidade | Funcional Programática | Fonte de Recursos | Orç. Inicial |
 *   Orç. Atual | Tipo | Ref. % | Empenhado | % Empenhado | Liquidado |
 *   % Liquidado | Pago | % Pago
 *
 * Duas armadilhas dessa planilha, ambas já verificadas contra o BI:
 *
 *   1. As colunas rotuladas "% Empenhado", "% Liquidado" e "% Pago" NÃO são
 *      percentuais — trazem o valor já ponderado pelo Ref. %. Já "Orç. Inicial"
 *      e "Orç. Atual" vêm brutos e precisam ser ponderados aqui.
 *   2. Não existe coluna de eixo. Ele é derivado da função orçamentária (os dois
 *      primeiros dígitos da funcional programática), com as exceções em
 *      `scripts/lib/ocad-base.mjs`.
 *
 * Uso: npm run dados [-- caminho/para/planilha.xls] [--dry-run] [--force]
 */

import { readFile, stat } from "node:fs/promises";
import { basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  consolidarRegistrosOcad,
  formatarIsoRioBranco,
  gravarBaseSeAlterada,
  imprimirResumo,
  lerBaseAtual,
  lerPlanilhaOcadBuffer,
  validarSegurancaAtualizacao,
} from "./lib/ocad-base.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const posicionais = args.filter((a) => !a.startsWith("--"));

const DRY_RUN = flags.has("--dry-run");
const FORCE = flags.has("--force");

// A planilha é reemitida todo mês; a fonte corrente pode ser passada na linha
// de comando — `npm run dados -- Planilhas/Setembro_2026/arquivo.xls` — e, sem
// argumento, fica a do exercício vigente.
const FONTE =
  posicionais[0] ??
  "Planilhas/Setembro_2026/OCAD_Orcamento_Crianca_Adolescente-2776-20261008.xls";
const ANO = 2026;

async function main() {
  const caminho = resolve(raiz, FONTE);
  const [buffer, { mtime }] = await Promise.all([readFile(caminho), stat(caminho)]);
  const { itens, linhasUteis } = lerPlanilhaOcadBuffer(buffer, {
    ano: ANO,
    origem: caminho,
  });

  const base = consolidarRegistrosOcad(itens, {
    ano: ANO,
    arquivoFonte: basename(FONTE),
    origem: "Planilha OCAD — mesma base do BI",
    origemTipo: "planilha",
    // A planilha não carimba a data de extração; fica registrada a do arquivo.
    dataArquivo: new Date(mtime).toISOString().slice(0, 10),
    atualizadoEm: formatarIsoRioBranco(mtime),
    linhasFonte: linhasUteis,
  });

  const baseAtual = await lerBaseAtual(raiz);
  validarSegurancaAtualizacao(base.registros, base.meta, baseAtual, {
    force: FORCE,
  });

  if (DRY_RUN) {
    console.log("[dry-run] Nenhum arquivo gravado.");
  } else {
    const { alterado } = await gravarBaseSeAlterada(raiz, base, baseAtual);
    if (!alterado) {
      console.log("Base já está atualizada — nenhuma alteração gravada.");
    }
  }

  imprimirResumo(base.meta, { linhasUteis });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
