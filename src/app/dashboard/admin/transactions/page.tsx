export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  authorized: "bg-blue-100 text-blue-800",
  captured: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
  failed: "bg-gray-100 text-gray-700",
};

export default async function AdminTransactionsPage() {
  const db = createServiceRoleClient();

  const { data: transactions } = await db
    .from("transactions")
    .select("*, operators!inner(company_name), shops(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  type Tx = { id: string; status: string; amount_total: number; operator_net: number; shop_commission: number; platform_fee: number; stripe_payment_intent_id?: string; created_at: string; operators: { company_name: string }; shops: { name: string } | null };
  const txList = (transactions || []) as Tx[];
  const totalRevenue = txList.filter((t) => t.status === "captured").reduce((s, t) => s + t.amount_total, 0);
  const totalPlatformFee = txList.filter((t) => t.status === "captured").reduce((s, t) => s + t.platform_fee, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Transazioni</h1>
          <p className="text-gray-500 mt-1">Ultime 100 transazioni</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Volume totale</p>
          <p className="text-xl font-bold text-[#1B2A4A]">{formatEur(totalRevenue)}</p>
          <p className="text-sm text-[#D4A843]">Platform fee: {formatEur(totalPlatformFee)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Operatore", "Shop", "Totale", "Netto Op.", "Comm. Shop", "Fee Piatt.", "Stato", "Data"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {txList.map((tx) => {
                const op = tx.operators as { company_name: string };
                const shop = tx.shops as { name: string } | null;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-3 font-medium text-[#1B2A4A] text-xs">{op.company_name}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{shop?.name || "—"}</td>
                    <td className="px-3 py-3 font-semibold text-[#1B2A4A]">{formatEur(tx.amount_total)}</td>
                    <td className="px-3 py-3 text-green-700">{formatEur(tx.operator_net)}</td>
                    <td className="px-3 py-3 text-amber-700">{formatEur(tx.shop_commission)}</td>
                    <td className="px-3 py-3 text-blue-700">{formatEur(tx.platform_fee)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[tx.status]}`}>{tx.status}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleDateString("it-IT")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
