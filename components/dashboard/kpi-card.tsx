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
  corIndicador?: string;
  className?: string;
  progressoPct?: number;
  corProgresso?: string;
}

export function KpiCard({
  titulo,
  valor,
  dica,
  icone: Icon,
  destaque = false,
  corIndicador,
  className,
  progressoPct,
  corProgresso = "var(--chart-3)",
}: KpiCardProps) {
  const pctLimitado =
    typeof progressoPct === "number"
      ? Math.min(Math.max(progressoPct, 0), 100)
      : null;

  return (
    <Card
      className={cn(
        "gap-2.5 py-4",
        destaque
          ? "bg-[#f6f0d8] text-accent-foreground ring-1 ring-[#e2d6a6] dark:bg-card dark:text-card-foreground dark:ring-border"
          : "bg-card text-card-foreground ring-1 ring-border",
        className,
      )}
    >
      <CardHeader className="px-4 py-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {corIndicador && (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: corIndicador }}
              />
            )}
            <span>{titulo}</span>
          </CardTitle>
          <Icon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground/70"
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 py-0">
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
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${pctLimitado}%`, backgroundColor: corProgresso }}
            />
          </div>
        )}
        {dica && (
          <p className="mt-1.5 text-xs text-muted-foreground">{dica}</p>
        )}
      </CardContent>
    </Card>
  );
}
