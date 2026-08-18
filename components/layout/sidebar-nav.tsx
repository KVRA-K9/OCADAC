"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Landmark,
  LayoutDashboard,
  Table2,
  Target,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITENS = [
  { href: "/", label: "Voltar à Página Inicial", icon: Home },
  { href: "/painel", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/painel/tabela", label: "Tabela Detalhada", icon: Table2 },
  { href: "/painel/evolucao", label: "Evolução Temporal", icon: TrendingUp },
  { href: "/painel/historico", label: "Histórico", icon: Landmark },
  { href: "/painel/ods", label: "ODS", icon: Target },
] as const;

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

const DURATION = "duration-300";
const EASE = "ease-[cubic-bezier(0.4,0,0.2,1)]";
const LABEL_EXPAND = "max-w-[170px] opacity-100 ml-2.5";

function LabelSpan({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <span
      className={cn(
        "whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] will-change-[max-width,opacity] text-left",
        DURATION,
        EASE,
        collapsed ? "max-w-0 opacity-0 ml-0" : LABEL_EXPAND,
      )}
    >
      {children}
    </span>
  );
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 overflow-hidden transition-[padding,gap] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "justify-center px-2 py-4 gap-0" : "px-4 py-5",
      )}>
        <Image
          src="/bandeira-acre.png"
          alt="Bandeira do Acre"
          width={500}
          height={350}
          unoptimized
          className={cn(
            "shrink-0 rounded-lg object-contain transition-[width,height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            collapsed ? "h-7 w-10" : "h-10 w-[57px]",
          )}
        />
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-hidden transition-[max-width,opacity] will-change-[max-width,opacity]",
            DURATION,
            EASE,
            collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100",
          )}
        >
          <span className="font-heading text-sm font-semibold leading-tight text-sidebar-foreground">
            OCAD | Acre
          </span>
          <span className="text-xs leading-tight text-sidebar-foreground/70">
            Criança e Adolescente
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-2 overflow-hidden">
        {NAV_ITENS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <Tooltip key={href} open={collapsed ? undefined : false} disableHoverableContent={!collapsed}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={ativo ? "page" : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={cn(
                    "flex h-10 w-full items-center justify-start px-3 rounded-lg text-sm font-medium overflow-hidden",
                    DURATION,
                    EASE,
                    ativo
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0 transition-transform duration-300" style={{ transformOrigin: "left center" }} />
                  <LabelSpan collapsed={collapsed}>{label}</LabelSpan>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer note (animated collapse) */}
      <div
        className={cn(
          "px-4 whitespace-nowrap overflow-hidden text-xs text-sidebar-foreground/60 transition-[max-height,opacity,padding] will-change-[max-height,opacity]",
          DURATION,
          EASE,
          collapsed ? "max-h-0 opacity-0 py-0" : "max-h-10 opacity-100 py-1 pb-3",
        )}
      >
        Fonte oficial: planilha OCAD — SEPLAN/AC, a mesma base do BI
      </div>
    </div>
  );
}