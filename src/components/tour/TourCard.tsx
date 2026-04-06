"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/TranslationProvider";

interface TourCardProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  durationMinutes: number | null;
  operatorName: string;
  category?: string;
  priceType?: string;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  tour: { label: "TOUR", color: "bg-navy" },
  barca: { label: "BARCA", color: "bg-teal-600" },
  food: { label: "FOOD WINE", color: "bg-amber-600" },
  esperienze: { label: "EXPERIENCE", color: "bg-purple-600" },
};

export function TourCard({
  id,
  title,
  description,
  imageUrl,
  priceCents,
  currency,
  durationMinutes,
  operatorName,
  category,
  priceType,
}: TourCardProps) {
  const { t } = useTranslation();

  const formattedPrice = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceCents / 100);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${t("tour.minutes", "min")}`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}${t("tour.minutes", "min")}` : `${h} ${t("tour.hours", "ore")}`;
  };

  const cat = categoryConfig[category || "tour"] || categoryConfig.tour;

  return (
    <Link href={`/tour/${id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-cream text-warm-gray">
              <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-block rounded-md ${cat.color} px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white`}>
              {cat.label}
            </span>
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-white shadow-md">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-heading text-xl font-semibold text-navy leading-tight line-clamp-2">
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-sm text-warm-gray leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-4 flex flex-col gap-1.5 text-sm text-warm-gray">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{operatorName}</span>
            </div>
            {durationMinutes && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(durationMinutes)}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-warm-gray-light">
              {priceType === "total" ? t("tour.totalPrice", "prezzo totale") : t("tour.perPerson", "a persona")}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold group-hover:gap-2 transition-all">
              {t("tour.discover", "Scopri di più")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
