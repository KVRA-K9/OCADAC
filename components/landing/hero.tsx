"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { URL_LEI_OCAD } from "@/data/relatorios";
import { useT } from "@/lib/i18n";

export function Hero() {
  const t = useT();

  return (
    <section className="relative flex min-h-[380px] w-full items-center overflow-hidden border-b md:min-h-[480px]">
      <Image
        src="/criancas-rio-ilustracao.png"
        alt=""
        fill
        priority
        unoptimized
        className="object-cover object-[50%_30%]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/5"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-10 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)] md:px-6 md:py-14">
        <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {t.landing.hero.titulo}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
          {t.landing.hero.descricao}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-[#ede3b4] text-accent-foreground [text-shadow:none] hover:bg-[#ede3b4]/90"
          >
            <Link href="/painel">
              {t.landing.hero.acessarPainel}
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white [text-shadow:none] hover:bg-white/10 hover:text-white"
          >
            <a href={URL_LEI_OCAD} target="_blank" rel="noopener noreferrer">
              {t.landing.hero.lei}
              <ExternalLink />
            </a>
          </Button>
        </div>
      </div>

    </section>
  );
}
