import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  titulo?: string;
  subtitulo?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Section({
  id,
  titulo,
  subtitulo,
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("w-full py-16 md:py-20 scroll-mt-16", className)}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 md:px-6",
          containerClassName,
        )}
      >
        {(titulo || subtitulo) && (
          <div className="mb-10 flex max-w-3xl flex-col gap-2">
            {titulo && (
              <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                {titulo}
              </h2>
            )}
            {subtitulo && (
              <p className="text-sm text-muted-foreground md:text-base">
                {subtitulo}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}