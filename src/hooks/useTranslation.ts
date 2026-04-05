"use client";

import { useState, useEffect, useCallback } from "react";
import { type Locale, DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

const STORAGE_KEY = "ttl_locale";

let cachedDict: Record<string, string> | null = null;
let cachedLocale: Locale | null = null;

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const detected = saved && LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
    setLocaleState(detected);

    if (cachedDict && cachedLocale === detected) {
      setDict(cachedDict);
      setLoading(false);
      return;
    }

    import(`@/i18n/dictionaries/${detected}.json`)
      .then((mod) => {
        const d = mod.default;
        cachedDict = d;
        cachedLocale = detected;
        setDict(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
    import(`@/i18n/dictionaries/${newLocale}.json`)
      .then((mod) => {
        const d = mod.default;
        cachedDict = d;
        cachedLocale = newLocale;
        setDict(d);
      })
      .catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return dict[key] || fallback || key;
    },
    [dict]
  );

  return { t, locale, setLocale, loading };
}
