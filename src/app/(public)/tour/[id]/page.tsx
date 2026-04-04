export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Disclaimer } from "@/components/checkout/Disclaimer";
import { TourBookingForm } from "./TourBookingForm";

const categoryConfig: Record<string, { label: string; color: string }> = {
  tour: { label: "TOUR", color: "bg-navy" },
  barca: { label: "BARCA", color: "bg-teal-600" },
  food: { label: "FOOD WINE", color: "bg-amber-600" },
  esperienze: { label: "EXPERIENCE", color: "bg-purple-600" },
};

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TourPageProps) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data: tour } = await supabase
    .from("tours")
    .select("title, description")
    .eq("id", id)
    .single();

  return {
    title: tour ? `${tour.title}` : "Tour non trovato",
    description: tour?.description || "",
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: tour, error } = await supabase
    .from("tours")
    .select(`
      *,
      operators!inner(id, company_name, email, stripe_account_id, onboarding_status)
    `)
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !tour) {
    notFound();
  }

  const operator = (tour as Record<string, unknown>).operators as {
    id: string;
    company_name: string;
    email: string;
  };

  const formattedPrice = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: tour.currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(tour.price_cents / 100);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minuti`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} ore e ${m} minuti` : `${h} ore`;
  };

  const cat = categoryConfig[tour.category || "tour"] || categoryConfig.tour;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-cream border-b border-gray-100">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-warm-gray">
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/esperienze" className="hover:text-navy transition-colors">Esperienze</Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-navy font-medium truncate max-w-[200px]">{tour.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Image + Description */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tour Image */}
            {tour.image_url && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                <img
                  src={tour.image_url}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-block rounded-md ${cat.color} px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white`}>
                    {cat.label}
                  </span>
                </div>
              </div>
            )}

            {/* Tour Info */}
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy leading-tight">
                {tour.title}
              </h1>
              <p className="mt-2 text-sm text-warm-gray">
                di <strong className="text-navy">{operator.company_name}</strong>
              </p>
            </div>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-bg px-4 py-2 text-sm font-semibold text-navy">
                <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formattedPrice} / persona
              </div>
              {tour.duration_minutes && (
                <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-navy border border-gray-200">
                  <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(tour.duration_minutes)}
                </div>
              )}
            </div>

            {/* Description */}
            {tour.description && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-navy mb-3">Descrizione</h2>
                <p className="text-warm-gray leading-relaxed">{tour.description}</p>
              </div>
            )}

            {/* What's included */}
            <div className="rounded-xl bg-cream border border-gray-100 p-6">
              <h3 className="font-heading text-lg font-semibold text-navy mb-4">Cosa include</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Guida locale esperta",
                  "Assicurazione inclusa",
                  "Cancellazione gratuita 48h",
                  "Conferma immediata",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-warm-gray">
                    <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                <div className="text-center mb-4">
                  <span className="font-heading text-3xl font-bold text-navy">{formattedPrice}</span>
                  <span className="text-sm text-warm-gray"> / persona</span>
                </div>

                <TourBookingForm
                  tourId={tour.id}
                  priceCents={tour.price_cents}
                  currency={tour.currency}
                  operatorName={operator.company_name}
                />

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <svg className="h-5 w-5 text-gold mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs text-warm-gray">Sicuro</span>
                  </div>
                  <div>
                    <svg className="h-5 w-5 text-gold mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs text-warm-gray">Verificato</span>
                  </div>
                  <div>
                    <svg className="h-5 w-5 text-gold mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-warm-gray">48h rimborso</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Disclaimer operatorName={operator.company_name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
