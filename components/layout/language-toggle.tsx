"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { useT } from "@/lib/i18n";

function BandeiraBrasil({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 17"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="17" fill="#009C3B" rx="1.5" />
      <path d="M12 2.4 21.6 8.5 12 14.6 2.4 8.5Z" fill="#FFDF00" />
      <circle cx="12" cy="8.5" r="3.3" fill="#002776" />
    </svg>
  );
}

function BandeiraReinoUnido({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 17"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="17" fill="#012169" rx="1.5" />
      <path
        d="M0 0 24 17M24 0 0 17"
        stroke="#fff"
        strokeWidth="3.4"
      />
      <path
        d="M0 0 24 17M24 0 0 17"
        stroke="#C8102E"
        strokeWidth="1.3"
      />
      <path d="M12 0V17M0 8.5H24" stroke="#fff" strokeWidth="5.6" />
      <path d="M12 0V17M0 8.5H24" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useT();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => setLocale("pt")}
        aria-label={t.common.ptBrasil}
        title={t.common.ptBrasil}
        className={cn(
          "cursor-pointer rounded p-1 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          locale === "pt"
            ? "opacity-100 ring-1 ring-ring"
            : "opacity-50 hover:opacity-90",
        )}
      >
        <BandeiraBrasil className="block h-3.5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-label={t.common.ingles}
        title={t.common.ingles}
        className={cn(
          "cursor-pointer rounded p-1 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          locale === "en"
            ? "opacity-100 ring-1 ring-ring"
            : "opacity-50 hover:opacity-90",
        )}
      >
        <BandeiraReinoUnido className="block h-3.5 w-5" />
      </button>
    </div>
  );
}
