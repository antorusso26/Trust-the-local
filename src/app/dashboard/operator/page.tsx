export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LayoutDashboard, TrendingUp, Calendar, MapPin, AlertCircle } from "lucide-react";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function OperatorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: operator } = await db
    .from("operators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!operator) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2A4A]">Profilo operatore non trovato</h2>
        <p className="text-gray-500 mt-2">Completa prima la registrazione come operatore.</p>
        <Link href="/register" className="mt-6 inline-block bg-[#D4A843] text-white px-8 py-3 rounded-full font-medium">
          Registrati
        </Link>
      </div>
    );
  }

  // Stats from current month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [{ data: transactions }, { data: bookings }, { data: tours }] = await Promise.all([
    db.from("transactions").select("operator_net, status").eq("operator_id", operator.id),
    db.from("bookings").select("id, status, created_at").eq("operator_id", operator.id),
    db.from("tours").select("id, title, active").eq("operator_id", operator.id),
  ]);

  type Tx = { operator_net: number; status: string };
  type Bk = { status: string };
  type Tr = { id: string; active: boolean };
  const txList = (transactions || []) as Tx[];
  const captured = txList.filter((t) => t.status === "captured");
  const totalRevenue = captured.reduce((s: number, t: Tx) => s + t.operator_net, 0);
  const monthlyRevenue = totalRevenue;

  const confirmedBookings = ((bookings || []) as Bk[]).filter((b) => b.status === "confirmed").length;
  const activeTours = ((tours || []) as Tr[]).filter((t) => t.active).length;

  // Recent bookings
  const { data: recentBookings } = await db
    .from("bookings")
    .select("id, customer_name, booking_date, status, amount_cents, tours!inner(title)")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-700",
  };

  const needsKyc = operator.onboarding_status !== "verified";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#D4A843]" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">{operator.company_name}</p>
        </div>
        {needsKyc && (
          <Link href="/dashboard/operator/kyc" className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
            ⚠️ Completa verifica KYC
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Guadagno Totale"
          value={formatEur(totalRevenue)}
          subtitle="Netto commissioni"
          icon={<TrendingUp className="w-5 h-5" />}
          color="gold"
        />
        <StatsCard
          title="Prenotazioni Confermate"
          value={confirmedBookings}
          icon={<Calendar className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Tour Attivi"
          value={activeTours}
          icon={<MapPin className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1B2A4A]">Ultime Prenotazioni</h2>
            <Link href="/dashboard/operator/bookings" className="text-xs text-[#D4A843] font-medium hover:underline">
              Vedi tutte →
            </Link>
          </div>
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Nessuna prenotazione ancora</p>
          ) : (
            <div className="space-y-3">
              {(recentBookings as unknown as Array<{ id: string; customer_name?: string; booking_date: string; status: string; amount_cents: number; tours: { title: string } }>).map((b) => {
                const tour = b.tours as unknown as { title: string };
                const date = new Date(b.booking_date).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
                return (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{b.customer_name || "Cliente"}</p>
                      <p className="text-xs text-gray-400">{tour.title} · {date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{formatEur(b.amount_cents)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1B2A4A] mb-4">Azioni Rapide</h2>
          <div className="space-y-3">
            {[
              { href: "/dashboard/operator/tours/new", label: "➕ Crea nuovo tour", desc: "Aggiungi un'esperienza al catalogo" },
              { href: "/dashboard/operator/tours", label: "📋 Gestisci tour", desc: `${activeTours} tour attivi` },
              { href: "/dashboard/operator/bookings", label: "📅 Vedi prenotazioni", desc: `${confirmedBookings} confermate` },
              { href: "/dashboard/operator/reviews", label: "⭐ Recensioni", desc: "Leggi e rispondi" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="text-gray-300 group-hover:text-[#D4A843] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
