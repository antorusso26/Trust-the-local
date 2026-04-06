"use client";

import { useState } from "react";
import { type Locale, LOCALES, LOCALE_FLAGS, LOCALE_NAMES } from "@/i18n/config";
import { useTranslation } from "@/i18n/TranslationProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/50 text-sm transition-all"
        aria-label="Seleziona lingua"
      >
        <span className="font-medium">{LOCALE_FLAGS[locale]}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[140px]">
            {LOCALES.map((l: Locale) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                  l === locale ? "text-[#1B2A4A] font-semibold bg-amber-50" : "text-gray-700"
                }`}
              >
                <span className="w-6 text-center font-medium text-xs">{LOCALE_FLAGS[l]}</span>
                <span>{LOCALE_NAMES[l]}</span>
                {l === locale && (
                  <svg className="w-3.5 h-3.5 ml-auto text-[#D4A843]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
