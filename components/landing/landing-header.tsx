"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ANCORAS = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#eixos", label: "Eixos" },
  { href: "/#base-legal", label: "Base Legal" },
  { href: "/#relatorios", label: "Relatórios" },
] as const;

export function LandingHeader() {
  const [aberto, setAberto] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <a
            href="https://seplan.ac.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seplan/AC - Página oficial"
          >
            <Image
              src="/logo-solo.png"
              alt="Logo OCAD Acre"
              width={72}
              height={40}
              priority
              unoptimized
              className="h-7 w-auto shrink-0 md:h-8"
            />
          </a>
          <div className="h-7 w-0.5 rounded-full bg-accent/85 md:h-8" aria-hidden />
          <a
            href="https://seplan.ac.gov.br/planejamento-governamental/orcamentos-tematicos/orcamento-crianca-e-adolescente-ocad/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden flex-col leading-tight sm:flex"
            aria-label="OCAD Acre - Página oficial da Seplan"
          >
            <span className="font-heading text-sm font-semibold" style={{ color: "#048D3E" }}>
              OCAD | Acre
            </span>
            <span className="text-xs text-muted-foreground">
              Orçamento Criança e Adolescente
            </span>
          </a>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ANCORAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/painel">
              Acessar painel
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden",
          aberto ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 border-t bg-background px-4 py-3">
          {NAV_ANCORAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAberto(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="mt-2">
            <Link href="/painel" onClick={() => setAberto(false)}>
              Acessar painel
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
