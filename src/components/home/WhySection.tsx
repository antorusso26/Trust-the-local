"use client";

import { useTranslation } from "@/i18n/TranslationProvider";

export function WhySection() {
  const { t } = useTranslation();

  const items = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      titleKey: "why.guides.title",
      descKey: "why.guides.desc",
      color: "bg-navy text-white",
    },
    {
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
        </svg>
      ),
      titleKey: "why.authentic.title",
      descKey: "why.authentic.desc",
      color: "bg-gold text-white",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      titleKey: "why.secure.title",
      descKey: "why.secure.desc",
      color: "bg-teal-600 text-white",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
        <span className="section-label">{t("why.subtitle", "Il nostro impegno")}</span>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
          {t("why.title", "Perché Trust the Local")}
        </h2>
        <div className="gold-divider" />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.titleKey} className="flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${item.color} mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold text-navy">{t(item.titleKey)}</h3>
              <p className="mt-2 text-sm text-warm-gray leading-relaxed max-w-xs mx-auto">
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
