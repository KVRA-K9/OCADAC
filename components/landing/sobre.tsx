import { Quote } from "lucide-react";

import { Section } from "@/components/landing/section";
import { Card, CardContent } from "@/components/ui/card";
import { CONTEUDO_OCAD } from "@/lib/conteudo-ocad";
import { URL_SEPLAN_OCAD } from "@/data/relatorios";

export function Sobre() {
  return (
    <Section
      id="sobre"
      titulo="O que é o OCAD?"
      subtitulo="Entenda a origem, a metodologia e o propósito do Orçamento Criança e Adolescente no Estado do Acre."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-primary/40 ring-0 md:col-span-1">
          <CardContent className="flex flex-col gap-4 pt-1">
            <Quote className="size-7 text-primary/40" />
            <p className="text-sm leading-relaxed text-foreground md:text-base">
              {CONTEUDO_OCAD.definicao}
            </p>
            <p className="text-xs text-muted-foreground">
              Fonte:{" "}
              <a
                href={URL_SEPLAN_OCAD}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {CONTEUDO_OCAD.definicaoFonte}
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 ring-0 bg-background md:col-span-1">
          <CardContent className="flex flex-col gap-3 pt-1">
            <h3 className="font-heading text-sm font-semibold text-primary">
              Em outras palavras
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {CONTEUDO_OCAD.definicaoDidatica}
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
