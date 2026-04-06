export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminToursPage() {
  const supabase = createServiceRoleClient();

  const { data: tours } = await supabase
    .from("tours")
    .select(`
      id,
      title,
      category,
      price_cents,
      currency,
      active,
      created_at,
      operators!inner(company_name)
    `)
    .order("created_at", { ascending: false });

  type Tour = {
    id: string;
    title: string;
    category: string;
    price_cents: number;
    currency: string;
    active: boolean;
    created_at: string;
    operators: { company_name: string };
  };

  const tourList = ((tours || []) as unknown as Tour[]);

  const categoryLabels: Record<string, string> = {
    tour: "Tour",
    barca: "Barca",
    food: "Food & Wine",
    esperienze: "Esperienza",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1B2A4A]">Moderazione Tour</h1>
          <p className="text-sm text-gray-500 mt-1">{tourList.length} tour totali</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Tour</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Operatore</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Categoria</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Prezzo</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stato</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Data</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tourList.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/tour/${tour.id}`} className="font-medium text-[#1B2A4A] hover:text-[#D4A843]">
                      {tour.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tour.operators.company_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {categoryLabels[tour.category] || tour.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    €{(tour.price_cents / 100).toFixed(0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      tour.active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tour.active ? "bg-green-500" : "bg-red-500"}`} />
                      {tour.active ? "Attivo" : "Disattivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(tour.created_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tour/${tour.id}`}
                      className="text-xs font-medium text-[#D4A843] hover:underline"
                    >
                      Vedi
                    </Link>
                  </td>
                </tr>
              ))}
              {tourList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Nessun tour presente
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
