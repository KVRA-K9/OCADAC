/**
 * Planilha de evidências do descritor "infantil", para a coordenação decidir o
 * que reflete no painel.
 *
 * São duas frentes com efeitos diferentes: as normas do acervo, que já aparecem
 * na lista do Histórico e onde a decisão é de destaque, e as ações das leis
 * orçamentárias, que entram na soma e mexem no valor das barras.
 *
 * Uso: node scripts/planilha-infantil.mjs
 */

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");
const DESTINO = resolve(raiz, "Histórico/Descritor infantil — evidências.xlsx");

const DECISAO = { header: "Entra no dashboard?", key: "decisao", width: 20 };
const OBSERVACAO = { header: "Observação", key: "observacao", width: 42 };

/** Lista fechada na coluna de decisão: evita "sim", "Sim" e "S" convivendo. */
function validarDecisao(aba, coluna, primeira, ultima) {
  for (let linha = primeira; linha <= ultima; linha++) {
    aba.getCell(coluna + linha).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"sim,não,avaliar"'],
    };
  }
}

function formatar(aba) {
  aba.getRow(1).font = { bold: true };
  aba.views = [{ state: "frozen", ySplit: 1 }];
  for (const coluna of aba.columns) {
    if (/R\$/.test(String(coluna.header))) coluna.numFmt = "#,##0.00";
  }
}

async function main() {
  const busca = JSON.parse(
    await readFile(resolve(raiz, "data/normas-infantil.json"), "utf8"),
  );
  const apuracoes = JSON.parse(
    await readFile(resolve(raiz, "data/ocad-loas.json"), "utf8"),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "Projeto OCAD";

  /* --------------------------------------------- 1. normas, uma por linha */
  const normas = wb.addWorksheet("Normas — decisão");
  normas.columns = [
    { header: "Aba de origem", key: "tipo", width: 22 },
    { header: "Espécie", key: "especie", width: 16 },
    { header: "Número", key: "numero", width: 12 },
    { header: "Ano", key: "ano", width: 8 },
    { header: "Ementa", key: "ementa", width: 70 },
    { header: "Ocorrências", key: "ocorrencias", width: 13 },
    { header: "Na ementa?", key: "naEmenta", width: 12 },
    { header: "Texto da norma", key: "link", width: 44 },
    DECISAO,
    OBSERVACAO,
  ];
  for (const n of busca.normas) {
    const linha = normas.addRow({
      tipo: n.tipo,
      especie: n.especie,
      numero: n.numero,
      ano: n.ano,
      ementa: n.ementa,
      ocorrencias: n.ocorrencias,
      naEmenta: n.naEmenta ? "sim" : "",
    });
    linha.getCell("link").value = { text: n.link, hyperlink: n.link };
    linha.getCell("link").font = {
      color: { argb: "FF1155CC" },
      underline: true,
    };
    linha.getCell("ementa").alignment = { wrapText: true, vertical: "top" };
  }
  formatar(normas);
  validarDecisao(normas, "I", 2, busca.normas.length + 1);

  /* ------------------------------------------- 2. trechos, um por linha */
  const trechos = wb.addWorksheet("Normas — trechos");
  trechos.columns = [
    { header: "Norma", key: "norma", width: 30 },
    { header: "Ano", key: "ano", width: 8 },
    { header: "Palavra", key: "palavra", width: 12 },
    { header: "Trecho do texto da norma", key: "trecho", width: 130 },
  ];
  let nTrechos = 0;
  for (const n of busca.normas) {
    for (const t of n.trechos) {
      const linha = trechos.addRow({
        norma: n.especie + " " + n.numero,
        ano: n.ano,
        palavra: t.palavra,
        trecho: t.trecho,
      });
      linha.getCell("trecho").alignment = { wrapText: true, vertical: "top" };
      nTrechos++;
    }
  }
  formatar(trechos);

  /* ------------------------------------ 3. ações das LOAs, uma por linha */
  const acoes = wb.addWorksheet("Ações nas LOAs — decisão");
  acoes.columns = [
    { header: "Exercício", key: "exercicio", width: 11 },
    { header: "Órgão", key: "orgao", width: 40 },
    { header: "Unidade", key: "unidade", width: 40 },
    { header: "Código da ação", key: "codigo", width: 22 },
    { header: "Ação", key: "nome", width: 58 },
    { header: "Valor (R$)", key: "total", width: 18 },
    { header: "Origem da leitura", key: "origem", width: 26 },
    DECISAO,
    OBSERVACAO,
  ];
  const casadas = [];
  for (const a of apuracoes) {
    for (const i of a.acoesCasadas ?? []) {
      if (i.descritor !== "infantil") continue;
      casadas.push({ exercicio: a.exercicio, ...i });
    }
  }
  casadas.sort((a, b) => a.exercicio - b.exercicio);
  for (const i of casadas) {
    acoes.addRow({
      exercicio: i.exercicio,
      orgao: ((i.orgaoCodigo ?? "?") + " " + (i.orgaoNome ?? "")).trim(),
      unidade: ((i.unidadeCodigo ?? "?") + " " + (i.unidadeNome ?? "")).trim(),
      codigo: i.codigo,
      nome: i.nome,
      total: i.total,
      origem: i.origem ?? "quadro da unidade",
    });
  }
  const somaCasadas = casadas.reduce((s, i) => s + i.total, 0);
  const total = acoes.addRow({
    nome: "Total das ações casadas por “infantil”",
    total: somaCasadas,
  });
  total.font = { bold: true };
  formatar(acoes);
  validarDecisao(acoes, "H", 2, casadas.length + 1);

  /* ------------------------------------------------------- 4. como ler */
  const guia = wb.addWorksheet("Como ler");
  guia.columns = [{ header: "", key: "texto", width: 120 }];
  const decreto = busca.normas.find((n) => /8\.232/.test(n.numero));
  const porTipo = Object.entries(busca.porTipo)
    .map(([tipo, quantas]) => quantas + " " + tipo)
    .join(", ");

  const linhas = [
    "DESCRITOR “INFANTIL” — EVIDÊNCIAS PARA DECISÃO",
    "",
    busca.normasLidas +
      " normas do acervo varridas pelo texto integral no Legis do Acre — as seis abas da planilha de histórico. Nenhuma falha de leitura.",
    "Padrão procurado: " +
      busca.padrao +
      " — sem acento e com limite de palavra, o mesmo critério da apuração das leis orçamentárias. Casa “infantil” e “infantis”; não casa “infantilizado”.",
    "Resultado: " +
      busca.normasComOTermo +
      " normas com o termo (" +
      porTipo +
      "). Nenhuma LOA, LDO, PPA ou lei de estrutura administrativa.",
    "",
    "ABA “Normas — decisão”: uma linha por norma, com ementa, contagem e link. As oito já aparecem na lista do painel; a decisão aqui é se merecem marca de relevância para o OCAD.",
    "ABA “Normas — trechos”: uma linha por ocorrência, com o contexto em volta, para julgar se a menção é de política pública ou de passagem.",
    "ABA “Ações nas LOAs — decisão”: as ações que o descritor trouxe para a série apurada. Estas mexem no valor das barras do gráfico.",
    "",
    "BASE NORMATIVA DO DESCRITOR:",
    decreto
      ? decreto.especie +
        " " +
        decreto.numero +
        "/" +
        decreto.ano +
        ", que institui o Comitê de Apuração do OCAD, usa “saúde materno-infantil” ao definir o Orçamento Criança exclusivo. A palavra não é acréscimo externo: está na norma que criou a apuração."
      : "",
    "",
    "RESSALVA: os R$ 91,4 milhões atribuídos ao descritor numa versão anterior valiam antes do ajuste na classificação da educação. Com a folha da SEE dentro das unidades integrais, o “infantil” responde pelo valor totalizado na aba das ações.",
  ];
  for (const texto of linhas) guia.addRow({ texto });
  guia.getRow(1).font = { bold: true, size: 12 };
  for (let i = 1; i <= guia.rowCount; i++) {
    guia.getCell("A" + i).alignment = { wrapText: true, vertical: "top" };
  }

  await wb.xlsx.writeFile(DESTINO);
  console.log("gravado: " + DESTINO);
  console.log("  Normas — decisão: " + busca.normas.length + " linhas");
  console.log("  Normas — trechos: " + nTrechos + " linhas");
  console.log(
    "  Ações nas LOAs: " +
      casadas.length +
      " linhas, total R$ " +
      somaCasadas.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
  );
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
