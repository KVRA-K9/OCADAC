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
import { OPCAO_TODOS, filtrarOrcamento, orcamentoData } from "@/data/base-ocad";
import { NotaBase } from "@/components/dashboard/nota-base";
import { exportarPDF, exportarXLSX } from "@/lib/export";

export default function TabelaPage() {
  const [filtros, setFiltros] = React.useState<FiltrosOrcamento>({
    ano: OPCAO_TODOS,
    funcao: [],
    categoriaEconomica: OPCAO_TODOS,
    secretaria: [],
  });

  const [exportando, setExportando] = React.useState<"pdf" | "xlsx" | null>(null);

  const onApply = React.useCallback((f: FiltrosOrcamento) => setFiltros(f), []);

  const filtrados = React.useMemo(
    () => filtrarOrcamento(orcamentoData, filtros),
    [filtros],
  );

  const handleExportPDF = async () => {
    if (filtrados.length === 0) {
      toast.error("Não há registros para exportar.");
      return;
    }
    setExportando("pdf");
    try {
      await exportarPDF(filtrados);
      toast.success("PDF exportado com sucesso.");
    } catch {
      toast.error("Falha ao exportar PDF.");
    } finally {
      setExportando(null);
    }
  };

  const handleExportXLSX = async () => {
    if (filtrados.length === 0) {
      toast.error("Não há registros para exportar.");
      return;
    }
    setExportando("xlsx");
    try {
      await exportarXLSX(filtrados);
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
              {filtrados.length} registros
            </span>
          </CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exportando !== null}
                >
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
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DataTable data={filtrados} />
          <NotaBase />
        </CardContent>
      </Card>
    </div>
  );
}
