import { Download } from "lucide-react";

import { Section } from "@/components/landing/section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { relatoriosOcad } from "@/data/relatorios";

export function Relatorios() {
  return (
    <Section
      id="relatorios"
      className="bg-muted/30"
      titulo="Relatórios anuais"
      subtitulo="Publicações oficiais da Seplan/AC com a apuração do OCAD, disponíveis para download."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatoriosOcad.map((r) => (
          <Card key={r.ano} className="border border-primary/40 ring-0 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{r.ano}</Badge>
              </div>
              <CardTitle className="mt-2 text-base">{r.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download />
                  Baixar PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Relatórios Publicados em{" "}
        <a
          href="https://seplan.ac.gov.br/planejamento-governamental/orcamentos-tematicos/orcamento-crianca-e-adolescente-ocad/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          seplan.ac.gov.br
        </a>
      </p>
    </Section>
  );
}