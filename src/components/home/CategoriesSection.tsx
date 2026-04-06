"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";

export function CategoriesSection() {
  const { t } = useTranslation();

  const categories = [
    { icon: "⭐", nameKey: "categories.tour", slug: "tour", color: "bg-blue-50 text-blue-600" },
    { icon: "🚤", nameKey: "categories.barca", slug: "barca", color: "bg-teal-50 text-teal-600" },
    { icon: "🎭", nameKey: "categories.esperienze", slug: "esperienze", color: "bg-orange-50 text-orange-600" },
    { icon: "🍋", nameKey: "categories.food", slug: "food", color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
        <span className="section-label">{t("categories.subtitle", "Cosa vuoi vivere")}</span>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
          {t("categories.title", "Le Nostre Categorie")}
        </h2>
        <div className="gold-divider" />

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/esperienze?categoria=${cat.slug}`}
              className="group rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${cat.color} text-2xl mb-3`}>
                {cat.icon}
              </div>
              <h3 className="font-heading text-lg font-semibold text-navy">{t(cat.nameKey)}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
