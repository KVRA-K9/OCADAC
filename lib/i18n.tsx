"use client";

import * as React from "react";

import {
  MESSAGES,
  LOCALE_COOKIE,
  type Locale,
  type Messages,
} from "@/lib/messages";

export type { Locale, Messages };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: "pt",
  setLocale: () => {},
});

export function LocaleProvider({
  initialLocale = "pt",
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
    document.documentElement.lang = next === "en" ? "en" : "pt-BR";
  }, []);

  const value = React.useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Idioma ativo e troca de idioma. */
export function useLocale(): LocaleContextValue {
  return React.useContext(LocaleContext);
}

/** Os textos de interface do idioma ativo, já resolvidos por domínio. */
export function useT(): Messages {
  return MESSAGES[React.useContext(LocaleContext).locale];
}
