"use client";

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
import { getRelatoriosOcad } from "@/data/relatorios";
import { useLocale, useT } from "@/lib/i18n";

export function Relatorios() {
  const { locale } = useLocale();
  const t = useT();
  const relatorios = getRelatoriosOcad(locale);

  return (
    <Section
      id="relatorios"
      className="bg-muted/30"
      titulo={t.landing.relatorios.titulo}
      subtitulo={t.landing.relatorios.subtitulo}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((r) => (
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
                  {t.landing.relatorios.baixarPdf}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t.landing.relatorios.publicadosEm}{" "}
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
