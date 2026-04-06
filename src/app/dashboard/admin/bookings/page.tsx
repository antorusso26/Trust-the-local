export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminBookingsPage() {
  const supabase = createServiceRoleClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      guest_name,
      guest_email,
      guests,
      date,
      time_slot,
      status,
      amount_cents,
      currency,
      created_at,
      cancelled_at,
      tours!inner(title),
      operators!inner(company_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  type Booking = {
    id: string;
    guest_name: string;
    guest_email: string;
    guests: number;
    date: string;
    time_slot: string | null;
    status: string;
    amount_cents: number;
    currency: string;
    created_at: string;
    cancelled_at: string | null;
    tours: { title: string };
    operators: { company_name: string };
  };

  const bookingList = ((bookings || []) as unknown as Booking[]);

  const statusConfig: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Confermata", color: "bg-green-50 text-green-700" },
    pending: { label: "In attesa", color: "bg-yellow-50 text-yellow-700" },
    cancelled: { label: "Cancellata", color: "bg-red-50 text-red-700" },
    completed: { label: "Completata", color: "bg-blue-50 text-blue-700" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1B2A4A]">Tutte le Prenotazioni</h1>
          <p className="text-sm text-gray-500 mt-1">{bookingList.length} prenotazioni</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Tour</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Operatore</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Data</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ospiti</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Importo</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stato</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookingList.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.pending;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1B2A4A]">{b.guest_name}</div>
                      <div className="text-xs text-gray-400">{b.guest_email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{b.tours.title}</td>
                    <td className="px-4 py-3 text-gray-600">{b.operators.company_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(b.date).toLocaleDateString("it-IT")}
                      {b.time_slot && <span className="text-xs text-gray-400 ml-1">{b.time_slot}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{b.guests}</td>
                    <td className="px-4 py-3 font-semibold">€{(b.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/prenotazione/${b.id}`}
                        className="text-xs font-medium text-[#D4A843] hover:underline"
                      >
                        Dettaglio
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {bookingList.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Nessuna prenotazione
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
