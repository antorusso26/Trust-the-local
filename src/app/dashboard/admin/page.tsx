export const dynamic = "force-dynamic";

import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, MapPin, Calendar, TrendingUp } from "lucide-react";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function AdminOverviewPage() {
  const db = createServiceRoleClient();

  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [
    { count: operatorsCount },
    { count: toursCount },
    { count: bookingsToday },
    { count: shopsCount },
    { data: transactions },
    { data: pendingOperators },
  ] = await Promise.all([
    db.from("operators").select("id", { count: "exact", head: true }),
    db.from("tours").select("id", { count: "exact", head: true }).eq("active", true),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("booking_date", today).eq("status", "confirmed"),
    db.from("shops").select("id", { count: "exact", head: true }).eq("active", true),
    db.from("transactions").select("platform_fee, status").eq("status", "captured").gte("created_at", monthStart),
    db.from("operators").select("id, company_name, email, created_at").eq("onboarding_status", "pending").order("created_at", { ascending: false }).limit(5),
  ]);

  const monthlyRevenue = (transactions || []).reduce((s: number, t: { platform_fee: number }) => s + t.platform_fee, 0);

  const adminSections = [
    { href: "/dashboard/admin/operators", label: "Operatori", icon: "👤", desc: `${operatorsCount || 0} registrati`, color: "bg-blue-50" },
    { href: "/dashboard/admin/tours", label: "Tour", icon: "🗺️", desc: `${toursCount || 0} attivi`, color: "bg-teal-50" },
    { href: "/dashboard/admin/bookings", label: "Prenotazioni", icon: "📅", desc: `${bookingsToday || 0} oggi`, color: "bg-green-50" },
    { href: "/dashboard/admin/shops", label: "Shop & QR", icon: "🏪", desc: `${shopsCount || 0} attivi`, color: "bg-amber-50" },
    { href: "/dashboard/admin/transactions", label: "Transazioni", icon: "💳", desc: "Export CSV", color: "bg-purple-50" },
    { href: "/dashboard/admin/reviews", label: "Recensioni", icon: "⭐", desc: "Moderazione", color: "bg-yellow-50" },
    { href: "/dashboard/admin/users", label: "Utenti", icon: "👥", desc: "Turisti e operatori", color: "bg-pink-50" },
    { href: "/dashboard/admin/logs", label: "Audit Log", icon: "📋", desc: "Tutte le azioni", color: "bg-gray-50" },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📊", desc: "Report e metriche", color: "bg-indigo-50" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Panoramica piattaforma Trust the Local</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Revenue Piattaforma" value={formatEur(monthlyRevenue)} subtitle="Questo mese" icon={<TrendingUp className="w-5 h-5" />} color="gold" />
        <StatsCard title="Operatori" value={operatorsCount || 0} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatsCard title="Tour Attivi" value={toursCount || 0} icon={<MapPin className="w-5 h-5" />} color="green" />
        <StatsCard title="Prenotazioni Oggi" value={bookingsToday || 0} icon={<Calendar className="w-5 h-5" />} color="navy" />
      </div>

      {(pendingOperators || []).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-amber-800 mb-3">⚠️ Operatori in attesa ({(pendingOperators || []).length})</h3>
          <div className="space-y-2">
            {(pendingOperators || []).map((op: { id: string; company_name: string; email: string }) => (
              <div key={op.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">{op.company_name}</p>
                  <p className="text-xs text-amber-700">{op.email}</p>
                </div>
                <Link href={`/dashboard/admin/operators`} className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full hover:bg-amber-700">
                  Revisiona
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminSections.map((s) => (
          <Link key={s.href} href={s.href} className={`${s.color} rounded-2xl p-5 hover:shadow-md transition-all group border border-white`}>
            <div className="text-3xl mb-3">{s.icon}</div>
            <p className="font-semibold text-[#1B2A4A] group-hover:text-[#D4A843] transition-colors">{s.label}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
