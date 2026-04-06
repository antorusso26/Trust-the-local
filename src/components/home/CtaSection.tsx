"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-navy py-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
          🍋 {t("cta.title1", "La dolce vita")}
          <br />
          <span className="text-gold">{t("cta.title2", "inizia adesso")}</span>
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
          {t("cta.subtitle", "Prenota la tua esperienza in Costiera Amalfitana oggi. Cancellazione gratuita fino a 48h prima.")}
        </p>
        <Link
          href="/esperienze"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-base font-semibold text-white shadow-lg hover:bg-gold-dark transition-colors"
        >
          {t("cta.button", "Inizia a Esplorare")}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
