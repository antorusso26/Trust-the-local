export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Calendar, Users, Clock } from "lucide-react";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

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

export default async function OperatorBookingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: operator } = await db.from("operators").select("id").eq("user_id", user.id).single();
  if (!operator) redirect("/dashboard/operator");

  const { data: bookings } = await db
    .from("bookings")
    .select("*, tours!inner(title, category)")
    .eq("operator_id", operator.id)
    .order("booking_date", { ascending: false });

  type Booking = { id: string; customer_name?: string; customer_email: string; booking_date: string; time_slot?: string; guests: number; amount_cents: number; status: string; tours: { title: string; category: string } };
  const all = (bookings || []) as Booking[];
  const upcoming = all.filter((b) => b.status === "confirmed" && new Date(b.booking_date) >= new Date());

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Prenotazioni</h1>
        <p className="text-gray-500 mt-1">{upcoming.length} in arrivo · {all.length} totali</p>
      </div>

      {all.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Nessuna prenotazione ancora</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Cliente", "Tour", "Data", "Persone", "Orario", "Importo", "Stato"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {all.map((b) => {
                  const tour = b.tours as { title: string; category: string };
                  const date = new Date(b.booking_date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1B2A4A]">{b.customer_name || "—"}</p>
                        <p className="text-gray-400 text-xs">{b.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{tour.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#D4A843]" />{date}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.guests}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {b.time_slot ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time_slot}</span> : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1B2A4A]">{formatEur(b.amount_cents)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[b.status]}`}>
                          {statusLabel[b.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
