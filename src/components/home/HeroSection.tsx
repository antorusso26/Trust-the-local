"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80"
          alt="Costiera Amalfitana"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/80" />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-6">
          <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">
            {t("hero.badge", "Costiera Amalfitana")}
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] max-w-3xl">
          {t("hero.title1", "Scopri l'Anima")}
          <br />
          <span className="text-gold">{t("hero.title2", "della Costiera")}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
          {t("hero.subtitle", "Esperienze indimenticabili tra limoni profumati, maioliche colorate e il mare più blu d'Italia. Con guide locali vere.")}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/esperienze"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-gold-dark transition-colors"
          >
            {t("hero.cta", "Esplora le Esperienze")}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/dashboard/tourist"
            className="inline-flex items-center rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            {t("hero.bookings", "Le Mie Prenotazioni")}
          </Link>
        </div>
      </div>
    </section>
  );
}
