import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Calendar, MapPin, Clock, Users, ChevronRight, XCircle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-700",
};

const statusLabel: Record<string, string> = {
  pending: "In attesa",
  confirmed: "Confermata",
  cancelled: "Cancellata",
  refunded: "Rimborsata",
};

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function TouristDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: bookings } = await db
    .from("bookings")
    .select(`
      id, status, booking_date, time_slot, guests, amount_cents, created_at,
      cancel_token, cancelled_at, refund_percentage,
      tours!inner(id, title, image_url, duration_minutes, category),
      operators!inner(company_name)
    `)
    .eq("customer_email", user.email!)
    .order("booking_date", { ascending: false });

  type BookingRow = { id: string; status: string; booking_date: string; time_slot?: string; guests: number; amount_cents: number; created_at: string; cancel_token?: string; cancelled_at?: string; refund_percentage?: number; tours: { id: string; title: string; image_url?: string; duration_minutes?: number; category?: string }; operators: { company_name: string } };
  const allBookings = (bookings || []) as unknown as BookingRow[];
  const upcoming = allBookings.filter(
    (b) => b.status === "confirmed" && new Date(b.booking_date) >= new Date()
  );
  const past = allBookings.filter(
    (b) => b.status !== "confirmed" || new Date(b.booking_date) < new Date()
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Le Mie Prenotazioni</h1>
        <p className="text-gray-500 mt-1">Gestisci le tue esperienze in Costiera Amalfitana</p>
      </div>

      {/* Upcoming */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#D4A843]" />
          Prossime Esperienze ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="text-5xl mb-3">⛵</div>
            <p className="text-gray-500">Nessuna esperienza in programma</p>
            <Link href="/esperienze" className="mt-4 inline-block bg-[#D4A843] text-white px-6 py-2.5 rounded-full text-sm font-medium">
              Esplora le esperienze
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((booking) => {
              const tour = booking.tours as { id: string; title: string; image_url?: string; duration_minutes?: number; category?: string };
              const op = booking.operators as { company_name: string };
              const date = new Date(booking.booking_date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
              const isUpcoming = new Date(booking.booking_date) > new Date(Date.now() + 48 * 3600000);

              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5">
                  <div className="w-24 h-20 rounded-xl bg-gradient-to-br from-[#1B2A4A] to-[#2d4070] flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden">
                    {tour.image_url ? (
                      <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover rounded-xl" />
                    ) : "⛵"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#1B2A4A] truncate">{tour.title}</h3>
                        <p className="text-gray-500 text-sm">{op.company_name}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColor[booking.status]}`}>
                        {statusLabel[booking.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#D4A843]" />{date}</span>
                      {booking.time_slot && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#D4A843]" />{booking.time_slot}</span>}
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#D4A843]" />{booking.guests} {booking.guests === 1 ? "persona" : "persone"}</span>
                      <span className="font-semibold text-[#1B2A4A]">{formatEur(booking.amount_cents)}</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Link
                        href={`/prenotazione/${booking.id}`}
                        className="text-xs text-[#D4A843] font-medium hover:underline flex items-center gap-1"
                      >
                        Dettagli <ChevronRight className="w-3 h-3" />
                      </Link>
                      {isUpcoming && (
                        <Link
                          href={`/prenotazione/${booking.id}?action=cancel`}
                          className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancella
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            Storico ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((booking) => {
              const tour = booking.tours as { id: string; title: string };
              const op = booking.operators as { company_name: string };
              const date = new Date(booking.booking_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#1B2A4A] truncate text-sm">{tour.title}</p>
                    <p className="text-gray-400 text-xs">{op.company_name} · {date}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600">{formatEur(booking.amount_cents)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[booking.status]}`}>
                      {statusLabel[booking.status]}
                    </span>
                    {booking.status === "confirmed" && new Date(booking.booking_date) < new Date() && (
                      <Link
                        href={`/tour/${tour.id}#review`}
                        className="text-xs text-[#D4A843] font-medium hover:underline"
                      >
                        ⭐ Recensisci
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
