import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  titulo: string;
  valor: React.ReactNode;
  dica?: string;
  icone: LucideIcon;
  destaque?: boolean;
  className?: string;
}

export function KpiCard({
  titulo,
  valor,
  dica,
  icone: Icon,
  className,
}: KpiCardProps) {
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
        {dica && <p className="mt-1 text-xs opacity-70">{dica}</p>}
      </CardContent>
    </Card>
  );
}
