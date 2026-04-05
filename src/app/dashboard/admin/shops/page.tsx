export const dynamic = "force-dynamic";

import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminShopsPage() {
  const db = createServiceRoleClient();

  const { data: shops } = await db
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Shop & QR Code</h1>
          <p className="text-gray-500 mt-1">{(shops || []).length} negozi affiliati</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Nome", "P.IVA", "Email", "Commissione", "QR ID", "Dashboard", "Stato"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(shops || []).map((shop: { id: string; name: string; address?: string; partita_iva: string; email: string; split_percentage_default: number; qr_code_id: string; active: boolean }) => (
                <tr key={shop.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1B2A4A]">{shop.name}</p>
                    {shop.address && <p className="text-xs text-gray-400">{shop.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{shop.partita_iva}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.email}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.split_percentage_default}%</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{shop.qr_code_id?.slice(0, 12)}...</code>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/shops/${shop.id}`} className="text-xs text-[#D4A843] font-medium hover:underline">
                      Scansioni →
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${shop.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {shop.active ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
