import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaPainel() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="relative flex aspect-[21/9] min-h-[220px] overflow-hidden rounded-2xl px-6 py-8 text-white md:min-h-[260px] md:px-12 md:py-10">
          <Image
            src="/crianca-shawadawa.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-[85%_45%] [filter:contrast(1.1)_saturate(1.15)_brightness(1.05)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-amber-900/45"
            aria-hidden
          />
          <div className="relative flex h-full max-w-2xl flex-col items-start justify-end gap-4 pb-4 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)] md:pb-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Explore os dados do OCAD
            </h2>
            <p className="text-sm leading-relaxed text-white/90 md:text-base">
              Acesse o painel interativo com indicadores, gráficos e a relação
              detalhada das ações orçamentárias do Estado do Acre voltadas à
              criança e ao adolescente.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-2 bg-[#ede3b4] text-accent-foreground [text-shadow:none] hover:bg-[#ede3b4]/90"
            >
              <Link href="/painel">
                Abrir painel interativo
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <span className="absolute bottom-2 right-3 text-[10px] text-white/60 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
            Fotografia: Cleiton Lopes - SECOM/AC
          </span>
        </div>
      </div>
    </section>
  );
}
