"use client";

import { Quote } from "lucide-react";

import { Section } from "@/components/landing/section";
import { Card, CardContent } from "@/components/ui/card";
import { getConteudoOcad } from "@/lib/conteudo-ocad";
import { useLocale, useT } from "@/lib/i18n";
import { URL_SEPLAN_OCAD } from "@/data/relatorios";

export function Sobre() {
  const { locale } = useLocale();
  const t = useT();
  const conteudo = getConteudoOcad(locale);

  return (
    <Section
      id="sobre"
      titulo={t.landing.sobre.titulo}
      subtitulo={t.landing.sobre.subtitulo}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-primary/40 ring-0 md:col-span-1">
          <CardContent className="flex flex-col gap-4 pt-1">
            <Quote className="size-7 text-primary/40" />
            <p className="text-sm leading-relaxed text-foreground md:text-base">
              {conteudo.definicao}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.landing.sobre.fonte}{" "}
              <a
                href={URL_SEPLAN_OCAD}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {conteudo.definicaoFonte}
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 ring-0 bg-background md:col-span-1">
          <CardContent className="flex flex-col gap-3 pt-1">
            <h3 className="font-heading text-sm font-semibold text-primary">
              {t.landing.sobre.emOutrasPalavras}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {conteudo.definicaoDidatica}
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
