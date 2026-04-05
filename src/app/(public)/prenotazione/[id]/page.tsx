export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { CancelBookingButton } from "./CancelBookingButton";
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle } from "lucide-react";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function hoursUntilTour(date: string, time?: string): number {
  const dt = new Date(`${date}T${time || "12:00"}:00`);
  return (dt.getTime() - Date.now()) / (1000 * 60 * 60);
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  const { id } = await params;
  const { token, action } = await searchParams;

  const db = createServiceRoleClient();

  const { data: booking, error } = await db
    .from("bookings")
    .select(`
      *,
      tours!inner(id, title, image_url, description, duration_minutes, meeting_point, category),
      operators!inner(company_name, email, phone)
    `)
    .eq("id", id)
    .single();

  if (error || !booking) notFound();

  // Validate token if provided
  if (token && booking.cancel_token !== token) notFound();

  const tour = booking.tours as { id: string; title: string; image_url?: string; description?: string; duration_minutes?: number; meeting_point?: string; category: string };
  const operator = booking.operators as { company_name: string; email: string; phone?: string };

  const hours = hoursUntilTour(booking.booking_date, booking.time_slot);
  const canCancel = booking.status === "confirmed" && hours > 0;
  const refundPercent = hours >= 48 ? 100 : hours >= 24 ? 50 : 0;
  const refundAmount = Math.round(booking.amount_cents * refundPercent / 100);

  const date = new Date(booking.booking_date).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    confirmed: { label: "Confermata", icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "text-green-700 bg-green-50" },
    pending: { label: "In attesa", icon: <Clock className="w-5 h-5 text-yellow-500" />, color: "text-yellow-700 bg-yellow-50" },
    cancelled: { label: "Cancellata", icon: <XCircle className="w-5 h-5 text-red-500" />, color: "text-red-700 bg-red-50" },
    refunded: { label: "Rimborsata", icon: <XCircle className="w-5 h-5 text-gray-400" />, color: "text-gray-600 bg-gray-50" },
  };

  const status = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-[#FBF8F1] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Banner */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 ${status.color}`}>
          {status.icon}
          <div>
            <p className="font-semibold">Prenotazione {status.label}</p>
            <p className="text-sm opacity-80">Codice: {id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Tour Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {tour.image_url && (
            <div className="h-48 overflow-hidden">
              <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-xl font-bold text-[#1B2A4A] mb-1">{tour.title}</h1>
            <p className="text-gray-500 text-sm">{operator.company_name}</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-[#D4A843]" />
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="text-sm font-medium capitalize">{date}</p>
                </div>
              </div>
              {booking.time_slot && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-[#D4A843]" />
                  <div>
                    <p className="text-xs text-gray-400">Orario</p>
                    <p className="text-sm font-medium">{booking.time_slot}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-[#D4A843]" />
                <div>
                  <p className="text-xs text-gray-400">Persone</p>
                  <p className="text-sm font-medium">{booking.guests}</p>
                </div>
              </div>
              {tour.meeting_point && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-[#D4A843]" />
                  <div>
                    <p className="text-xs text-gray-400">Punto di ritrovo</p>
                    <p className="text-sm font-medium">{tour.meeting_point}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-5 flex items-center justify-between">
              <p className="text-gray-500 text-sm">Totale pagato</p>
              <p className="text-2xl font-bold text-[#1B2A4A]">{formatEur(booking.amount_cents)}</p>
            </div>
          </div>
        </div>

        {/* Cancellation */}
        {canCancel && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-[#1B2A4A] mb-3">Cancellazione</h2>
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p className={`flex items-center gap-2 ${refundPercent === 100 ? "text-green-700 font-medium" : ""}`}>
                <span>✓</span> Entro 48h prima: rimborso 100%
              </p>
              <p className={`flex items-center gap-2 ${refundPercent === 50 ? "text-amber-700 font-medium" : ""}`}>
                <span>◆</span> Tra 48h e 24h: rimborso 50%
              </p>
              <p className={`flex items-center gap-2 ${refundPercent === 0 ? "text-red-700 font-medium" : ""}`}>
                <span>✗</span> Meno di 24h: nessun rimborso
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600">
                Se cancelli ora riceverai un rimborso di{" "}
                <span className="font-bold text-[#1B2A4A]">{formatEur(refundAmount)}</span>
                {" "}({refundPercent}%)
              </p>
            </div>

            <CancelBookingButton bookingId={id} cancelToken={booking.cancel_token} refundAmount={formatEur(refundAmount)} refundPercent={refundPercent} />
          </div>
        )}

        {booking.status === "cancelled" && booking.refund_amount_cents > 0 && (
          <div className="bg-blue-50 rounded-2xl p-5 mb-6">
            <p className="text-blue-800 font-medium">Rimborso di {formatEur(booking.refund_amount_cents)} ({booking.refund_percentage}%) in elaborazione.</p>
            <p className="text-blue-600 text-sm mt-1">Accredito entro 5-10 giorni lavorativi.</p>
          </div>
        )}

        {/* Operator contact */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-[#1B2A4A] mb-3">Contatto Operatore</h2>
          <p className="text-gray-700 font-medium">{operator.company_name}</p>
          <p className="text-gray-500 text-sm">{operator.email}</p>
          {operator.phone && <p className="text-gray-500 text-sm">{operator.phone}</p>}
        </div>

        <div className="text-center mt-6">
          <Link href="/esperienze" className="text-[#D4A843] hover:underline text-sm">
            ← Esplora altre esperienze
          </Link>
        </div>
      </div>
    </div>
  );
}
