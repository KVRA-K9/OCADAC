"use client";

import { ExternalLink, Gavel, Landmark, Globe, Scroll, ShieldCheck, ClipboardList, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/landing/section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBasesLegais, getConteudoOcad } from "@/lib/conteudo-ocad";
import { useLocale, useT } from "@/lib/i18n";

const ICONES: Record<number, LucideIcon> = {
  1: Landmark,
  2: Globe,
  3: Scroll,
  4: ShieldCheck,
  5: ClipboardList,
  6: GraduationCap,
};

export function BaseLegal() {
  const { locale } = useLocale();
  const t = useT();
  const conteudo = getConteudoOcad(locale);
  const basesLegais = getBasesLegais(locale);

  return (
    <Section
      id="base-legal"
      titulo={t.landing.baseLegal.titulo}
      subtitulo={t.landing.baseLegal.subtitulo}
    >
      <Card className="border border-primary/30 ring-0 relative mb-6 overflow-hidden bg-background">
        <Gavel className="pointer-events-none absolute -right-4 -bottom-4 size-32 text-primary opacity-25" />
        <CardContent className="relative flex flex-col gap-4 pt-1 md:flex-row md:items-start md:gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-base font-semibold">
              {t.landing.baseLegal.leiTitulo}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {conteudo.baseLegal}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {conteudo.baseLegalDidatica}
            </p>
            <a
              href="https://legis.ac.gov.br/detalhar/4706"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {t.landing.baseLegal.acessarIntegra}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {basesLegais.slice(1).map((item, i) => {
          const Icone = ICONES[i + 1] ?? Scroll;
          return (
            <Card key={item.titulo} className="border border-primary/40 ring-0 relative overflow-hidden">
              <Icone className="pointer-events-none absolute -right-4 -bottom-4 size-28 text-primary opacity-25" />
              <CardHeader>
                <CardTitle className="text-base">{item.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.descricao}
                </p>
                {item.externo && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {t.landing.baseLegal.acessarLink}
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
