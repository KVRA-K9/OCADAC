"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { FiltersForm } from "@/components/dashboard/filters-form";
import { DataTable } from "@/components/dashboard/data-table";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FiltrosOrcamento } from "@/lib/types";
import {
  OPCAO_TODOS,
  aplicarFontes,
  filtrarOrcamento,
  fontesDisponiveis,
  orcamentoData,
  somaValores,
} from "@/data/base-ocad";
import { FiltroFonte } from "@/components/dashboard/filtro-fonte";
import { FichaFonte } from "@/components/dashboard/ficha-fonte";
import { NotaBase } from "@/components/dashboard/nota-base";
import { TabelaOrgaos } from "@/components/dashboard/tabela-orgaos";
import { exportarPDF, exportarXLSX } from "@/lib/export";

type Visao = "tabela" | "detalhado";

/** Identidade estável para "nenhuma fonte", que os `useMemo` usam de dependência. */
const VAZIO: string[] = [];

export default function TabelaPage() {
  const [filtros, setFiltros] = React.useState<FiltrosOrcamento>({
    ano: OPCAO_TODOS,
    funcao: [],
    categoriaEconomica: OPCAO_TODOS,
    secretaria: [],
  });

  const [exportando, setExportando] = React.useState<"pdf" | "xlsx" | null>(null);
  const [visao, setVisao] = React.useState<Visao>("tabela");
  const [fontesEscolhidas, setFontesEscolhidas] = React.useState<string[]>([]);

  const onApply = React.useCallback((f: FiltrosOrcamento) => setFiltros(f), []);

  const filtrados = React.useMemo(
    () => filtrarOrcamento(orcamentoData, filtros),
    [filtros],
  );

  const fontes = React.useMemo(() => fontesDisponiveis(filtrados), [filtrados]);

  // A fonte de recursos só aparece no grão da ação, então o filtro acompanha a
  // visão detalhada. Na visão em tabela a lista ativa é sempre vazia, e tudo
  // abaixo se reduz ao recorte dos filtros do topo — nenhuma seleção invisível
  // recorta os números.
  const fontesAtivas = visao === "detalhado" ? fontesEscolhidas : VAZIO;

  // Uma fonte escolhida pode sumir quando os filtros do topo mudam. Podamos só
  // as que sumiram — zerar a seleção inteira faria o usuário perder as outras
  // sem motivo visível.
  const sobreviventes = fontesEscolhidas.filter((codigo) =>
    fontes.some((f) => f.codigo === codigo),
  );
  if (sobreviventes.length !== fontesEscolhidas.length) {
    setFontesEscolhidas(sobreviventes);
  }

  const recorte = React.useMemo(
    () => aplicarFontes(filtrados, fontesAtivas),
    [filtrados, fontesAtivas],
  );

  const selecionadas = React.useMemo(
    () => fontes.filter((f) => fontesAtivas.includes(f.codigo)),
    [fontes, fontesAtivas],
  );

  /** Denominador da participação da ficha: o recorte antes do filtro de fonte. */
  const totalSemFonte = React.useMemo(
    () => somaValores(filtrados).ocadAtualizado,
    [filtrados],
  );

  function alternarFonte(codigo: string) {
    setFontesEscolhidas((atuais) =>
      atuais.includes(codigo)
        ? atuais.filter((f) => f !== codigo)
        : [...atuais, codigo],
    );
  }

  const handleExportPDF = async () => {
    if (recorte.length === 0) {
      toast.error("Não há registros para exportar.");
      return;
    }
    setExportando("pdf");
    try {
      await exportarPDF(recorte);
      toast.success("PDF exportado com sucesso.");
    } catch {
      toast.error("Falha ao exportar PDF.");
    } finally {
      setExportando(null);
    }
  };

  const handleExportXLSX = async () => {
    if (recorte.length === 0) {
      toast.error("Não há registros para exportar.");
      return;
    }
    setExportando("xlsx");
    try {
      await exportarXLSX(recorte);
      toast.success("Planilha exportada com sucesso.");
    } catch {
      toast.error("Falha ao exportar planilha.");
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Tabela Detalhada"
        descricao="Ações do Orçamento Criança e Adolescente por órgão, unidade orçamentária e ação, do orçamento inicial ao valor pago. Clique em uma linha para abrir o nível seguinte."
      />

      <FiltersForm onApply={onApply} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Execução por órgão, unidade e ação
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {recorte.length} registros
            </span>
          </CardTitle>
          <CardAction className="flex flex-wrap items-start gap-2">
            {/* O filtro vem PRIMEIRO de propósito. A barra é ancorada à
                direita, então um grupo que nasce aqui cresce para a esquerda,
                sobre espaço vazio, e os dois grupos seguintes não saem do
                lugar. Entre o alternador e o botão de exportar, como seria
                natural, o alternador pularia para a esquerda no instante do
                clique — o botão fugiria de baixo do cursor. */}
            {visao === "detalhado" && fontes.length > 0 ? (
              <div className="flex gap-1 rounded-lg border border-border p-1 motion-safe:animate-in motion-safe:duration-300 motion-safe:ease-out motion-safe:fade-in-0">
                <FiltroFonte
                  fontes={fontes}
                  escolhidas={fontesAtivas}
                  alternar={alternarFonte}
                  limpar={() => setFontesEscolhidas(VAZIO)}
                  total={totalSemFonte}
                />
              </div>
            ) : null}

            <div className="flex gap-1 rounded-lg border border-border p-1">
              <Button
                variant={visao === "tabela" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setVisao("tabela");
                  setFontesEscolhidas(VAZIO);
                }}
              >
                Tabela
              </Button>
              <Button
                variant={visao === "detalhado" ? "default" : "ghost"}
                size="sm"
                onClick={() => setVisao("detalhado")}
              >
                Detalhado
              </Button>
            </div>

            {/* Mesma moldura do alternador ao lado — é o que iguala a altura
                dos dois grupos, já que o quadro soma a borda e o `p-1` à
                altura de um botão `sm`. */}
            <div className="flex gap-1 rounded-lg border border-border p-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={exportando !== null}>
                    {exportando ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Formato de exportação</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleExportPDF}>
                    <FileText className="size-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleExportXLSX}>
                    <FileSpreadsheet className="size-4" />
                    XLSX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Trocar de visão é um gesto, não um corte. O bloco que chega usa o
              mesmo desenho da revelação da página — só opacidade e um
              deslocamento curto —, e o `key` força a remontagem para que ele
              rode a cada troca. A altura muda muito entre as duas (9 linhas
              contra a árvore inteira), e o que a animação resolve é dar ao
              olho um instante para acompanhar de onde veio o conteúdo. */}
          <div
            key={visao}
            className="flex flex-col gap-4 motion-safe:animate-in motion-safe:duration-300 motion-safe:ease-out motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
          >
            {visao === "detalhado" ? (
              <>
                {selecionadas.length > 0 ? (
                  <FichaFonte
                    opcoes={selecionadas}
                    valores={somaValores(recorte)}
                    acoes={recorte.length}
                    total={totalSemFonte}
                  />
                ) : null}
                <DataTable data={recorte} />
              </>
            ) : (
              <TabelaOrgaos data={recorte} />
            )}
          </div>
          <NotaBase />
        </CardContent>
      </Card>
    </div>
  );
}
