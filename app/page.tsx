import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { Sobre } from "@/components/landing/sobre";
import { Eixos } from "@/components/landing/eixos";
import { BaseLegal } from "@/components/landing/base-legal";
import { Relatorios } from "@/components/landing/relatorios";
import { CtaPainel } from "@/components/landing/cta-painel";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="relative flex-1">
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
        <div className="relative z-10">
          <Hero />
          <Sobre />
          <Eixos />
          <BaseLegal />
          <Relatorios />
          <CtaPainel />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
