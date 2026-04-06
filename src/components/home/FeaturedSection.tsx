"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";
import { TourGrid } from "@/components/tour/TourGrid";

interface Tour {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  currency: string;
  duration_minutes: number | null;
  category: string;
  price_type?: string;
  operators: { company_name: string };
}

export function FeaturedSection({ tours }: { tours: Tour[] }) {
  const { t } = useTranslation();

  return (
    <section id="esperienze" className="py-16 bg-cream">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="section-label">{t("featured.subtitle", "Le più amate")}</span>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
            {t("featured.title", "Esperienze in Primo Piano")}
          </h2>
          <div className="gold-divider" />
        </div>

        <TourGrid tours={tours} />

        <div className="mt-10 text-center">
          <Link
            href="/esperienze"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-8 py-3 text-base font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
          >
            {t("featured.viewAll", "Vedi Tutte le Esperienze")}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
