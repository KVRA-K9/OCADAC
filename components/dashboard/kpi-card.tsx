import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  titulo: string;
  valor: React.ReactNode;
  dica?: string;
  icone: LucideIcon;
  destaque?: boolean;
  className?: string;
  progressoPct?: number;
  corProgresso?: string;
}

export function KpiCard({
  titulo,
  valor,
  dica,
  icone: Icon,
  className,
  progressoPct,
  corProgresso = "var(--chart-3)",
}: KpiCardProps) {
  const pctLimitado =
    typeof progressoPct === "number"
      ? Math.min(Math.max(progressoPct, 0), 100)
      : null;

  return (
    <Card className={cn("relative overflow-hidden border-[#ede3b4] bg-[#ede3b4] text-accent-foreground ring-[#ede3b4]/30 animate-in fade-in-0 slide-in-from-bottom-2 duration-500", className)}>
      <Icon className="pointer-events-none absolute -right-3 -bottom-3 size-24 text-current opacity-15" />
      <CardHeader>
        <CardTitle className="text-sm font-medium opacity-80">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-semibold tracking-tight tabular-nums [&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:gap-x-3 [&>div]:gap-y-1 [&>div>span]:flex [&>div>span]:items-baseline [&>div>span]:gap-1.5 [&>div>span>span:first-child]:text-sm [&>div>span>span:first-child]:font-medium [&>div>span>span:first-child]:opacity-90 [&>div>span>span:last-child]:text-xl">
          {valor}
        </div>
        {pctLimitado !== null && (
          <div
            role="progressbar"
            aria-valuenow={Math.round(pctLimitado * 10) / 10}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={titulo}
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-current/15"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${pctLimitado}%`, backgroundColor: corProgresso }}
            />
          </div>
        )}
        {dica && <p className="mt-2 text-xs opacity-75">{dica}</p>}
      </CardContent>
    </Card>
  );
}
