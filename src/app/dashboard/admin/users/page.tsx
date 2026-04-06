export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = createServiceRoleClient();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .order("user_id");

  const { data: tourists } = await supabase
    .from("tourist_profiles")
    .select("user_id, full_name, email, phone, preferred_language, created_at");

  type Role = { user_id: string; role: string };
  type Tourist = { user_id: string; full_name: string; email: string; phone: string | null; preferred_language: string; created_at: string };

  const roleList = (roles || []) as Role[];
  const touristList = (tourists || []) as Tourist[];

  const touristMap = new Map(touristList.map((t) => [t.user_id, t]));

  const roleBadge: Record<string, { label: string; color: string }> = {
    tourist: { label: "Turista", color: "bg-blue-50 text-blue-700" },
    operator: { label: "Operatore", color: "bg-purple-50 text-purple-700" },
    admin: { label: "Admin", color: "bg-red-50 text-red-700" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1B2A4A]">Gestione Utenti</h1>
          <p className="text-sm text-gray-500 mt-1">{roleList.length} utenti registrati</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(roleBadge).map(([key, { label, color }]) => {
            const count = roleList.filter((r) => r.role === key).length;
            return (
              <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}: {count}
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">Utente</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ruolo</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Lingua</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Registrazione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roleList.map((role) => {
                const tourist = touristMap.get(role.user_id);
                const badge = roleBadge[role.role] || roleBadge.tourist;
                return (
                  <tr key={role.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-xs">
                          {(tourist?.full_name || role.role).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#1B2A4A]">
                          {tourist?.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tourist?.email || role.user_id.slice(0, 8) + "..."}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 uppercase text-xs">
                      {tourist?.preferred_language || "it"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {tourist?.created_at
                        ? new Date(tourist.created_at).toLocaleDateString("it-IT")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
              {roleList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Nessun utente
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
