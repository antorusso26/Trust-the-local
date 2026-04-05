export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Disclaimer } from "@/components/checkout/Disclaimer";
import { TourBookingForm } from "./TourBookingForm";
import { FavoriteButton } from "@/components/tour/FavoriteButton";
import { ShareButton } from "@/components/tour/ShareButton";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewForm } from "@/components/review/ReviewForm";
import { StarRating } from "@/components/review/StarRating";
import { MapPin, Clock, Users, CheckCircle } from "lucide-react";

const categoryConfig: Record<string, { label: string; color: string }> = {
  tour: { label: "TOUR", color: "bg-navy" },
  barca: { label: "BARCA", color: "bg-teal-600" },
  food: { label: "FOOD & WINE", color: "bg-amber-600" },
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
    title: tour ? `${tour.title} | Trust the Local` : "Tour non trovato",
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
      operators!inner(id, company_name, email, stripe_account_id, onboarding_status, description, logo_url),
      tour_images(id, image_url, sort_order, alt_text)
    `)
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !tour) notFound();

  // Fetch reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, tourist_name, rating, comment, operator_reply, operator_replied_at, created_at")
    .eq("tour_id", id)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const reviews = reviewsData || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    : 0;

  type TourImage = { id: string; image_url: string; sort_order: number; alt_text?: string };
  const operator = (tour as Record<string, unknown>).operators as {
    id: string; company_name: string; email: string; description?: string; logo_url?: string;
  };

  const images = (((tour as Record<string, unknown>).tour_images as TourImage[]) || [])
    .sort((a, b) => a.sort_order - b.sort_order);
  const mainImage = images[0]?.image_url || tour.image_url;

  const formattedPrice = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: tour.currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(tour.price_cents / 100);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const cat = categoryConfig[tour.category || "tour"] || categoryConfig.tour;
  const includes = ((tour as Record<string, unknown>).includes as string[]) || [];
  const highlights = ((tour as Record<string, unknown>).highlights as string[]) || [];
  const maxGuests = ((tour as Record<string, unknown>).max_guests as number) || 10;
  const meetingPoint = ((tour as Record<string, unknown>).meeting_point as string) || "";
  const priceType = ((tour as Record<string, unknown>).price_type as string) || "per_person";
  const priceLabel = priceType === "total" ? "totale" : "/ persona";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-cream border-b border-gray-100">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-warm-gray">
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
            <span>/</span>
            <Link href="/esperienze" className="hover:text-navy transition-colors">Esperienze</Link>
            <span>/</span>
            <span className="text-navy font-medium truncate max-w-[200px]">{tour.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-8">
            {/* Main Image */}
            {mainImage && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                <img src={mainImage} alt={tour.title} className="h-full w-full object-cover" />
                <div className="absolute top-4 left-4">
                  <span className={`inline-block rounded-md ${cat.color} px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white`}>
                    {cat.label}
                  </span>
                </div>
                {reviews.length > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="text-white text-sm font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-300 text-xs">({reviews.length})</span>
                  </div>
                )}
              </div>
            )}

            {/* Additional images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden">
                    <img src={img.image_url} alt={img.alt_text || tour.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title + Actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy leading-tight">
                    {tour.title}
                  </h1>
                  <p className="mt-1 text-warm-gray text-sm">
                    di <span className="font-semibold text-navy">{operator.company_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  <FavoriteButton tourId={id} />
                  <ShareButton title={tour.title} />
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold-bg px-4 py-2 text-sm font-semibold text-navy">
                <span className="text-gold">€</span>
                {formattedPrice} {priceLabel}
              </div>
              {tour.duration_minutes && (
                <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-navy border border-gray-200">
                  <Clock className="h-4 w-4 text-gold" />
                  {formatDuration(tour.duration_minutes)}
                </div>
              )}
              <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-navy border border-gray-200">
                <Users className="h-4 w-4 text-gold" />
                Max {maxGuests} persone
              </div>
              {meetingPoint && (
                <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-navy border border-gray-200">
                  <MapPin className="h-4 w-4 text-gold" />
                  {meetingPoint}
                </div>
              )}
            </div>

            {/* Description */}
            {tour.description && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-navy mb-3">Descrizione</h2>
                <p className="text-warm-gray leading-relaxed whitespace-pre-line">{tour.description}</p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-semibold text-navy mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-warm-gray text-sm">
                      <span className="text-gold mt-0.5">✦</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's included */}
            <div className="rounded-xl bg-cream border border-gray-100 p-6">
              <h3 className="font-heading text-lg font-semibold text-navy mb-4">Cosa include</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(includes.length > 0 ? includes : [
                  "Guida locale esperta",
                  "Assicurazione inclusa",
                  "Cancellazione gratuita 48h",
                  "Conferma immediata",
                ]).map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-warm-gray">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Operator info */}
            {operator.description && (
              <div className="rounded-xl border border-gray-100 p-6 flex items-start gap-4">
                {operator.logo_url ? (
                  <img src={operator.logo_url} alt={operator.company_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {operator.company_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-navy">{operator.company_name}</h3>
                  <p className="text-warm-gray text-sm mt-1">{operator.description}</p>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div id="review">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-navy">
                  Recensioni {reviews.length > 0 && `(${reviews.length})`}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={avgRating} size="md" />
                    <span className="font-bold text-navy">{avgRating.toFixed(1)}</span>
                    <span className="text-warm-gray text-sm">/ 5</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="bg-cream rounded-2xl p-8 text-center mb-6">
                  <p className="text-warm-gray">Ancora nessuna recensione. Sii il primo!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {(reviews as Array<{ id: string; tourist_name: string; rating: number; comment?: string; operator_reply?: string; operator_replied_at?: string; created_at: string }>).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}

              <ReviewForm tourId={id} />
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                <div className="text-center mb-4">
                  <span className="font-heading text-3xl font-bold text-navy">{formattedPrice}</span>
                  <span className="text-sm text-warm-gray"> {priceLabel}</span>
                </div>

                <TourBookingForm
                  tourId={tour.id}
                  priceCents={tour.price_cents}
                  currency={tour.currency}
                  operatorName={operator.company_name}
                />

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: "🔒", label: "Sicuro" },
                    { icon: "✓", label: "Verificato" },
                    { icon: "↩", label: "48h rimborso" },
                  ].map(({ icon, label }) => (
                    <div key={label}>
                      <span className="text-xl">{icon}</span>
                      <p className="text-xs text-warm-gray mt-1">{label}</p>
                    </div>
                  ))}
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
