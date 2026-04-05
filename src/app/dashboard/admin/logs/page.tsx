export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";

const actorColors: Record<string, string> = {
  tourist: "bg-blue-100 text-blue-700",
  operator: "bg-amber-100 text-amber-700",
  admin: "bg-red-100 text-red-700",
  system: "bg-gray-100 text-gray-600",
  webhook: "bg-purple-100 text-purple-700",
};

export default async function AdminLogsPage() {
  const db = createServiceRoleClient();

  const { data: logs } = await db
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Audit Log</h1>
        <p className="text-gray-500 mt-1">Ultime 200 azioni registrate</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Evento", "Attore", "ID Attore", "Risorsa", "ID Risorsa", "Data"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide font-sans">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(logs || []).map((log: { id: string; event_type: string; actor_type?: string; actor_id?: string; resource_type?: string; resource_id?: string; created_at: string }) => (
                <tr key={log.id} className="hover:bg-gray-50/50 text-xs">
                  <td className="px-4 py-2.5 text-[#1B2A4A] font-semibold">{log.event_type}</td>
                  <td className="px-4 py-2.5">
                    {log.actor_type && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${actorColors[log.actor_type] || "bg-gray-100 text-gray-600"}`}>
                        {log.actor_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 max-w-[140px] truncate">{log.actor_id || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-600">{log.resource_type || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-400 max-w-[120px] truncate">{log.resource_id || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-400">
                    {new Date(log.created_at).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
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
