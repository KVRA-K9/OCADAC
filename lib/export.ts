import type { OrcamentoItem } from "@/lib/types";
import { metaBase } from "@/data/base-ocad";
import { getCreditosEquipe } from "@/lib/equipe";
import { getFormatadores } from "@/lib/format";
import { MESSAGES, type Locale } from "@/lib/messages";

function formatMoedaExport(valor: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

interface BlocoSecretaria {
  orgao: string;
  unidade: string;
  eixos: string[];
  acoes: {
    acao: string;
    eixo: string;
    classificacao: string;
    dotacao: number;
  }[];
  totalExclusivo: number;
  totalNaoExclusivo: number;
  total: number;
}

function estruturar(itens: OrcamentoItem[]): BlocoSecretaria[] {
  const chaves = [
    ...new Set(itens.map((i) => `${i.orgao}__${i.unidadeGestora}`)),
  ].sort();
  return chaves
    .map((chave) => {
      const [orgao, unidade] = chave.split("__");
      const sub = itens.filter(
        (i) => i.orgao === orgao && i.unidadeGestora === unidade,
      );
      const eixos = [...new Set(sub.map((i) => i.funcao))].sort();
      const acoes = sub.map((i) => ({
        acao: i.acao,
        eixo: i.funcao,
        classificacao: i.categoriaEconomica,
        dotacao: i.valores.ocadInicial,
      }));
      const totalExclusivo = sub
        .filter((i) => i.categoriaEconomica === "Exclusivo")
        .reduce((acc, i) => acc + i.valores.ocadInicial, 0);
      const totalNaoExclusivo = sub
        .filter((i) => i.categoriaEconomica === "Não Exclusivo")
        .reduce((acc, i) => acc + i.valores.ocadInicial, 0);
      return {
        orgao,
        unidade,
        eixos,
        acoes,
        totalExclusivo,
        totalNaoExclusivo,
        total: totalExclusivo + totalNaoExclusivo,
      };
    })
    .filter((b) => b.acoes.length > 0);
}

function dataExtenso(locale: Locale = "pt"): string {
  const d = new Date();
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  }
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return new Intl.DateTimeFormat("pt-BR", opts).format(d);
}

function exerciciosLabel(itens: OrcamentoItem[]): string {
  const anos = [...new Set(itens.map((i) => i.ano))].sort();
  if (anos.length === 0) return "—";
  if (anos.length === 1) return String(anos[0]);
  return `${anos[0]}–${anos[anos.length - 1]}`;
}

function nomeArquivo(extensao: string): string {
  const d = new Date();
  const data = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(d)
    .replace(/\//g, "-");
  return `relatorio_orcamento_crianca_adolescente_${data}.${extensao}`;
}

type JsPDFWithAutoTable = {
  internal: {
    pageSize: { getWidth: () => number; getHeight: () => number };
    getNumberOfPages: () => number;
  };
  setFontSize: (n: number) => void;
  setFont: (f: string, s: string) => void;
  setText: unknown;
  text: (t: string, x: number, y: number, opts?: unknown) => void;
  addPage: () => void;
  setPage: (n: number) => void;
  save: (n: string) => void;
  addImage: (
    data: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => void;
  splitTextToSize: (t: string, w: number) => string[];
  setFillColor: (r: number, g: number, b: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setLineWidth: (n: number) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  rect: (x: number, y: number, w: number, h: number, style: string) => void;
  lastAutoTable?: { finalY: number };
};

async function carregarLogo(): Promise<string> {
  const res = await fetch("/logo-seplan-branca.png");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportarPDF(
  itens: OrcamentoItem[],
  locale: Locale = "pt",
): Promise<void> {
  const t = MESSAGES[locale].exportar;
  const { eixoRotulo, categoriaRotulo } = MESSAGES[locale].common;
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  let logoData = "";
  try {
    logoData = await carregarLogo();
  } catch {
    logoData = "";
  }

  const blocos = estruturar(itens);
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const d = doc as unknown as JsPDFWithAutoTable;
  const larguraPagina = d.internal.pageSize.getWidth();
  const alturaPagina = d.internal.pageSize.getHeight();
  const margemEsq = 40;
  const margemDir = 40;
  const larguraUtil = larguraPagina - margemEsq - margemDir;

  const LOGO_H = 35;
  const LOGO_W = 35 * (991 / 304);
  const LOGO_X = larguraPagina - margemDir - LOGO_W;
  const LOGO_Y = 18;
  const larguraTitulo = larguraUtil - LOGO_W - 16;

  let paginaAtual = 1;

  const desenharCabecalho = () => {
    d.setFillColor(0, 128, 48);
    d.rect(0, 0, larguraPagina, 70, "F");

    if (logoData) {
      d.addImage(logoData, "PNG", LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
    }

    d.setTextColor(255, 255, 255);
    d.setFontSize(12);
    d.setFont("helvetica", "bold");
    const tituloLinhas = d.splitTextToSize(t.titulo, larguraTitulo);
    d.text(tituloLinhas[0] ?? "", margemEsq, 32);

    d.setFontSize(10);
    d.setFont("helvetica", "normal");
    d.text(
      t.cabecalhoInfo(exerciciosLabel(itens), dataExtenso(locale), paginaAtual),
      margemEsq,
      50,
    );
    d.setTextColor(0, 0, 0);
  };

  const RODAPE_TEXTO = t.rodape;

  const desenharRodape = () => {
    d.setFontSize(7);
    d.setFont("helvetica", "normal");
    d.setTextColor(120, 120, 120);
    d.text(RODAPE_TEXTO, larguraPagina / 2, alturaPagina - 20, {
      align: "center",
    });
    d.setTextColor(0, 0, 0);
  };

  desenharCabecalho();
  desenharRodape();

  let cursorY = 95;

  const novaPagina = () => {
    d.addPage();
    // O número sai do próprio documento: entre um bloco e outro o autoTable
    // pode ter aberto páginas por conta própria, e um contador local ficaria
    // para trás no cabeçalho.
    paginaAtual = d.internal.getNumberOfPages();
    desenharCabecalho();
    desenharRodape();
    cursorY = 95;
  };

  const garantirEspaco = (min: number) => {
    if (cursorY + min > alturaPagina - 40) novaPagina();
  };

  for (const bloco of blocos) {
    garantirEspaco(100);

    d.setFontSize(10);
    d.setFont("helvetica", "bold");
    const nomeCompleto = `${bloco.orgao} (${bloco.unidade})`;
    const linhasNome = d.splitTextToSize(nomeCompleto, larguraUtil);
    linhasNome.forEach((linha: string) => {
      garantirEspaco(14);
      d.text(linha, margemEsq, cursorY);
      cursorY += 11;
    });
    cursorY += 4;

    garantirEspaco(20);
    d.setFontSize(9);
    d.setFont("helvetica", "italic");
    const eixoTxt = `${t.eixo}: ${bloco.eixos.map(eixoRotulo).join(" | ")}`;
    const linhasEixo = d.splitTextToSize(eixoTxt, larguraUtil);
    linhasEixo.forEach((linha: string) => {
      garantirEspaco(14);
      d.text(linha, margemEsq, cursorY);
      cursorY += 10;
    });
    cursorY += 6;

    garantirEspaco(40);

    const bodyRows = bloco.acoes.map((a) => [
      `${a.acao} (${eixoRotulo(a.eixo)})`,
      categoriaRotulo(a.classificacao),
      formatMoedaExport(a.dotacao, locale),
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [[t.colAplicacao, t.colClassificacao, t.colDotacao]],
      body: bodyRows,
      foot: [
        [
          t.rodapeExclusivo(formatMoedaExport(bloco.totalExclusivo, locale)),
          t.rodapeNaoExclusivo(formatMoedaExport(bloco.totalNaoExclusivo, locale)),
          t.rodapeTotal(formatMoedaExport(bloco.total, locale)),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 128, 48],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 7, cellPadding: 3 },
      footStyles: {
        fillColor: [0, 128, 48],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        lineWidth: 0.8,
        lineColor: [0, 100, 40],
      },
      columnStyles: {
        0: { cellWidth: larguraUtil * 0.6 },
        1: { cellWidth: larguraUtil * 0.2 },
        2: { cellWidth: larguraUtil * 0.2, halign: "right" },
      },
      margin: { left: margemEsq, right: margemDir, top: 95 },
      didDrawPage: () => {
        const numPaginas = d.internal.getNumberOfPages();
        d.setFillColor(0, 128, 48);
        d.rect(0, 0, larguraPagina, 70, "F");
        if (logoData) {
          d.addImage(logoData, "PNG", LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
        }
        d.setTextColor(255, 255, 255);
        d.setFontSize(12);
        d.setFont("helvetica", "bold");
        const tituloLinhas = d.splitTextToSize(t.titulo, larguraTitulo);
        d.text(tituloLinhas[0] ?? "", margemEsq, 32);
        d.setFontSize(10);
        d.setFont("helvetica", "normal");
        d.text(
          t.cabecalhoInfo(exerciciosLabel(itens), dataExtenso(locale), numPaginas),
          margemEsq,
          50,
        );
        d.setTextColor(0, 0, 0);
        d.setFontSize(7);
        d.setFont("helvetica", "normal");
        d.setTextColor(120, 120, 120);
        d.text(RODAPE_TEXTO, larguraPagina / 2, alturaPagina - 20, {
          align: "center",
        });
        d.setTextColor(0, 0, 0);
      },
    });

    cursorY = (d.lastAutoTable?.finalY ?? cursorY) + 20;
  }

  /*
   * Créditos ao final do documento, uma vez só. Quem recebe o PDF solto, fora
   * do site, fica sem saber quem respondeu pelos números — o rodapé de cada
   * página nomeia o departamento, mas não a equipe.
   */
  // A medição usa a fonte com que o texto será desenhado, e vem antes de uma
  // eventual virada de página, que redefine fonte e cor no cabeçalho.
  d.setFontSize(7.5);
  d.setFont("helvetica", "normal");
  const linhasCreditos = d.splitTextToSize(
    getCreditosEquipe(locale),
    larguraUtil,
  );
  const alturaCreditos = 26 + linhasCreditos.length * 10;

  /*
   * O bloco é ancorado ao pé da página, logo acima do rodapé institucional, e
   * não emendado onde a última tabela parou. Solto no fluxo ele caía no alto de
   * uma página nova e deixava meia folha em branco abaixo — colado ao pé, a
   * página termina onde o olho espera que termine.
   */
  const topoCreditos = alturaPagina - 34 - alturaCreditos;
  if (cursorY > topoCreditos) novaPagina();
  cursorY = topoCreditos;

  d.setDrawColor(0, 128, 48);
  d.setLineWidth(0.8);
  d.line(margemEsq, cursorY, margemEsq + larguraUtil, cursorY);
  cursorY += 14;

  d.setFontSize(8);
  d.setFont("helvetica", "bold");
  d.text(t.elaboracao, margemEsq, cursorY);
  cursorY += 12;

  d.setFontSize(7.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(90, 90, 90);
  linhasCreditos.forEach((linha: string) => {
    d.text(linha, margemEsq, cursorY);
    cursorY += 10;
  });
  d.setTextColor(0, 0, 0);

  d.save(nomeArquivo("pdf"));
}

export async function exportarXLSX(
  itens: OrcamentoItem[],
  locale: Locale = "pt",
): Promise<void> {
  const t = MESSAGES[locale].exportar;
  const { eixoRotulo, categoriaRotulo } = MESSAGES[locale].common;
  const ExcelJS = await import("exceljs");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(t.sheetMicrodados);

  ws.columns = [
    { header: t.colAno, key: "ano", width: 8 },
    { header: t.colOrgao, key: "orgao", width: 45 },
    { header: t.colUnidadeGestora, key: "unidadeGestora", width: 45 },
    { header: t.eixo, key: "funcao", width: 20 },
    { header: t.colPrograma, key: "programa", width: 20 },
    { header: t.colAcao, key: "acao", width: 60 },
    { header: t.colClassificacao, key: "categoriaEconomica", width: 16 },
    { header: t.colDotacaoInicial, key: "dotacaoInicial", width: 20 },
    { header: t.colOrcamentoInicial, key: "ocadInicial", width: 20 },
    { header: t.colOrcamentoAtualizado, key: "ocadAtualizado", width: 20 },
    { header: t.colEmpenhado, key: "ocadEmpenhado", width: 18 },
    { header: t.colLiquidado, key: "ocadLiquidado", width: 18 },
    { header: t.colPago, key: "ocadPago", width: 18 },
    { header: t.colDisponivel, key: "ocadDisponivel", width: 18 },
  ];
  ws.getRow(1).font = { bold: true };

  for (const item of itens) {
    ws.addRow({
      ano: item.ano,
      orgao: item.orgao,
      unidadeGestora: item.unidadeGestora,
      funcao: eixoRotulo(item.funcao),
      programa: item.programa,
      acao: item.acao,
      categoriaEconomica: categoriaRotulo(item.categoriaEconomica),
      dotacaoInicial: item.valores.dotacaoInicial,
      ocadInicial: item.valores.ocadInicial,
      ocadAtualizado: item.valores.ocadAtualizado,
      ocadEmpenhado: item.valores.ocadEmpenhado,
      ocadLiquidado: item.valores.ocadLiquidado,
      ocadPago: item.valores.ocadPago,
      ocadDisponivel: item.valores.ocadDisponivel,
    });
  }

  for (const key of [
    "dotacaoInicial",
    "ocadInicial",
    "ocadAtualizado",
    "ocadEmpenhado",
    "ocadLiquidado",
    "ocadPago",
    "ocadDisponivel",
  ]) {
    ws.getColumn(key).numFmt = "#,##0.00";
  }

  const wsFonte = wb.addWorksheet(t.sheetProcedencia);
  wsFonte.columns = [
    { header: t.colCampo, key: "campo", width: 24 },
    { header: t.colValor, key: "valor", width: 110 },
  ];
  wsFonte.getRow(1).font = { bold: true };
  for (const [campo, valor] of [
    [t.fonte, `${MESSAGES[locale].painel.origemBase} — SEPLAN/AC`],
    [t.arquivo, metaBase.arquivoFonte],
    [t.dataArquivo, getFormatadores(locale).formatData(metaBase.dataArquivo)],
    [t.acoes, String(metaBase.acoes)],
    [t.eixo, t.valorEixo],
    [t.ponderacao, MESSAGES[locale].common.ponderacao()],
    [t.colDisponivel, t.valorDisponivel],
    [
      t.linhasOrigem,
      t.linhasOrigemValor(metaBase.linhasFonte, metaBase.acoes),
    ],
  ]) {
    wsFonte.addRow({ campo, valor });
  }
  wsFonte.getColumn("valor").alignment = { wrapText: true, vertical: "top" };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo("xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
