"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { CREDITOS_EQUIPE } from "@/lib/equipe";

const LINKS_INSTITUCIONAIS = [
  {
    label: "Seplan/AC",
    href: "https://seplan.ac.gov.br",
  },
  {
    label: "Portal da Transparência",
    href: "https://transparencia.ac.gov.br/#/dashboard",
  },
  {
    label: "Diário Oficial",
    href: "https://www.diario.ac.gov.br/",
  },
  {
    label: "Legislativo do Acre",
    href: "https://legis.ac.gov.br/",
  },
] as const;

export function LandingFooter() {
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
            alt="Brasão do Estado do Acre"
            width={160}
            height={77}
            unoptimized
            className="h-32 w-auto"
          />

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Navegação
            </h3>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-left text-sm text-foreground hover:text-primary"
            >
              Início
            </button>
            <Link
              href="/painel"
              className="text-sm text-foreground hover:text-primary"
            >
              Painel interativo
            </Link>
            <Link
              href="/#sobre"
              className="text-sm text-foreground hover:text-primary"
            >
              Sobre o OCAD
            </Link>
            <Link
              href="/#relatorios"
              className="text-sm text-foreground hover:text-primary"
            >
              Relatórios
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Institucional
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
            <p>
              © {new Date().getFullYear()} Governo do Estado do Acre ·
              Secretaria de Estado de Planejamento do Acre - Departamento de
              Estudos e Planejamento Orçamentário - DEPPO/SEPLAN
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Av. Getúlio Vargas, 232 · Centro · Rio Branco · Acre · CEP
              69900-060
            </p>
          </div>
          <Separator className="my-2" />
          <p className="leading-relaxed">{CREDITOS_EQUIPE}</p>
        </div>
      </div>
    </footer>
  );
}
