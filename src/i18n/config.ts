export const LOCALES = ["it", "en", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

export const LOCALE_NAMES: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  it: "IT",
  en: "EN",
  de: "DE",
  fr: "FR",
};

const dictionaries: Record<Locale, () => Promise<Record<string, string>>> = {
  it: () => import("./dictionaries/it.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred && LOCALES.includes(preferred as Locale)) {
    return preferred as Locale;
  }
  return DEFAULT_LOCALE;
}
