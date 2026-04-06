"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Locale, DEFAULT_LOCALE, LOCALES } from "./config";

const STORAGE_KEY = "ttl_locale";

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  loading: true,
});

export function useTranslation() {
  return useContext(TranslationContext);
}

const loaders: Record<Locale, () => Promise<Record<string, string>>> = {
  it: () => import("./dictionaries/it.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadDict = useCallback(async (loc: Locale) => {
    try {
      const d = await loaders[loc]();
      setDict(d);
    } catch {
      // fallback: keep existing dict
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const detected = saved && LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
    setLocaleState(detected);
    loadDict(detected);
  }, [loadDict]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      localStorage.setItem(STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
      loadDict(newLocale);
    },
    [loadDict]
  );

  const t = useCallback(
    (key: string, fallback?: string) => {
      return dict[key] || fallback || key;
    },
    [dict]
  );

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </TranslationContext.Provider>
  );
}
