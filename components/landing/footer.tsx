"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { getCreditosEquipe } from "@/lib/equipe";
import { useLocale, useT } from "@/lib/i18n";

export function LandingFooter() {
  const { locale } = useLocale();
  const t = useT();

  const LINKS_INSTITUCIONAIS = [
    {
      label: t.landing.footer.linkSeplan,
      href: "https://seplan.ac.gov.br",
    },
    {
      label: t.landing.footer.linkTransparencia,
      href: "https://transparencia.ac.gov.br/#/dashboard",
    },
    {
      label: t.landing.footer.linkDiarioOficial,
      href: "https://www.diario.ac.gov.br/",
    },
    {
      label: t.landing.footer.linkLegislativo,
      href: "https://legis.ac.gov.br/",
    },
  ] as const;

  return (
    <footer className="relative overflow-hidden border-t bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          backgroundImage: "url('/desenhos/diversos.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "top left",
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <Image
            src="/brasao.jpeg"
            alt={t.landing.footer.brasaoAcre}
            width={160}
            height={77}
            unoptimized
            className="h-32 w-auto"
          />

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.landing.footer.navegacao}
            </h3>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-left text-sm text-foreground hover:text-primary"
            >
              {t.landing.footer.inicio}
            </button>
            <Link
              href="/painel"
              className="text-sm text-foreground hover:text-primary"
            >
              {t.landing.footer.painelInterativo}
            </Link>
            <Link
              href="/#sobre"
              className="text-sm text-foreground hover:text-primary"
            >
              {t.landing.footer.sobreOcad}
            </Link>
            <Link
              href="/#relatorios"
              className="text-sm text-foreground hover:text-primary"
            >
              {t.landing.footer.relatorios}
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.landing.footer.institucional}
            </h3>
            {LINKS_INSTITUCIONAIS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{t.landing.footer.copyright(new Date().getFullYear())}</p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {t.landing.footer.endereco}
            </p>
          </div>
          <Separator className="my-2" />
          <p className="leading-relaxed">{getCreditosEquipe(locale)}</p>
        </div>
      </div>
    </footer>
  );
}
