"use client";

import * as React from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLocale, useT } from "@/lib/i18n";

const STORAGE_KEY = "ocad:sidebar-collapsed";

const STORAGE_LISTENERS = new Set<() => void>();

function subscribe(callback: () => void) {
  STORAGE_LISTENERS.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    STORAGE_LISTENERS.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "false";
  } catch {
    return "false";
  }
}

function getServerSnapshot(): string {
  return "false";
}

function setCollapsedStorage(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore
  }
  STORAGE_LISTENERS.forEach((cb) => cb());
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const t = useT();
  const { locale } = useLocale();
  const mainRef = React.useRef<HTMLElement>(null);
  const pillRef = React.useRef<HTMLDivElement>(null);
  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.classList.remove("animate-locale-swap");
      void mainEl.offsetWidth;
      mainEl.classList.add("animate-locale-swap");

      const handleAnimEnd = () => {
        mainEl.classList.remove("animate-locale-swap");
      };
      mainEl.addEventListener("animationend", handleAnimEnd, { once: true });
    }

    const pillEl = pillRef.current;
    if (pillEl) {
      pillEl.classList.remove("animate-badge-pulse");
      void pillEl.offsetWidth;
      pillEl.classList.add("animate-badge-pulse");

      const handlePillEnd = () => {
        pillEl.classList.remove("animate-badge-pulse");
      };
      pillEl.addEventListener("animationend", handlePillEnd, { once: true });
    }
  }, [locale]);

  const stored = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const collapsed = stored === "true";

  const toggleCollapsed = React.useCallback(() => {
    setCollapsedStorage(!collapsed);
  }, [collapsed]);

return (
    <div className="relative z-10 flex min-h-screen w-full">
      <div
        aria-hidden
        className="fundo-desenhos-base pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src="/desenhos/casa.jpg"
          alt=""
          className="pointer-events-none absolute opacity-[0.60]"
          style={{ bottom: 300, left: "4%", width: 360, height: "auto" }}
        />
        <img
          src="/desenhos/criancas.jpg"
          alt=""
          className="pointer-events-none absolute opacity-[0.60]"
          style={{ top: "18%", right: "10%", width: 420, height: "auto" }}
        />
        <img
          src="/desenhos/amigos.jpg"
          alt=""
          className="pointer-events-none absolute opacity-[0.50]"
          style={{
            top: "50%",
            left: "50%",
            width: 480,
            height: "auto",
            transform: "translate(-50%, -50%)",
            zIndex: -9,
          }}
        />
      </div>
      <aside
className={[
          "sticky z-20 top-0 h-screen hidden shrink-0 border-r bg-sidebar/90 backdrop-blur-sm text-sidebar-foreground lg:flex lg:flex-col overflow-hidden",
          "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width]",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>

      {/* Floating toggle button on the sidebar/content border (desktop only) */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? t.nav.expandirMenu : t.nav.recolherMenu}
        className={cn(
          "fixed top-6 z-30 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground hover:bg-background lg:flex",
          collapsed ? "left-16" : "left-64",
        )}
      >
        <PanelLeftOpen
          className={cn(
            "size-3.5 absolute transition-opacity duration-200",
            collapsed ? "opacity-100" : "opacity-0",
          )}
        />
        <PanelLeftClose
          className={cn(
            "size-3.5 absolute transition-opacity duration-200",
            collapsed ? "opacity-0" : "opacity-100",
          )}
        />
      </button>

      <div className="relative z-20 flex min-w-0 flex-1 flex-col">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-30 lg:hidden"
              aria-label={t.nav.abrirMenu}
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton className="w-72 p-0">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Balão flutuante de idioma no canto superior direito */}
        <div
          ref={pillRef}
          className="fixed right-4 top-4 z-30 flex h-8 items-center rounded-full border border-border/80 bg-background/85 px-2 shadow-xs backdrop-blur-md transition-all"
          role="region"
          aria-label={t.common.idioma}
        >
          <LanguageToggle />
        </div>

        <main ref={mainRef} className="flex-1 p-4 md:p-6 bg-background/55">
          {children}
        </main>
      </div>
    </div>
  );
}