export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  pending: "In attesa",
  in_review: "In revisione",
  verified: "Verificato",
  rejected: "Rifiutato",
};

export default async function AdminOperatorsPage() {
  const db = createServiceRoleClient();

  const { data: operators } = await db
    .from("operators")
    .select("*, tours(id)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Operatori</h1>
        <p className="text-gray-500 mt-1">{(operators || []).length} operatori registrati</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Azienda", "P.IVA", "Email", "Stripe KYC", "Tour", "Stato", "Registrato"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(operators || []).map((op: { id: string; company_name: string; vat_number: string; email: string; stripe_account_id?: string; onboarding_status: string; created_at: string; tours: Array<{ id: string }> }) => (
                <tr key={op.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[#1B2A4A]">{op.company_name}</td>
                  <td className="px-4 py-3 text-gray-600">{op.vat_number}</td>
                  <td className="px-4 py-3 text-gray-600">{op.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${op.stripe_account_id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {op.stripe_account_id ? "Connesso" : "Non connesso"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{(op.tours as Array<{ id: string }>)?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[op.onboarding_status]}`}>
                      {statusLabel[op.onboarding_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(op.created_at).toLocaleDateString("it-IT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
