export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout with auth guard (no middleware).
 * Checks auth via server component.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <a href="/dashboard/operator" className="text-lg font-bold">
            Trust the Local
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/dashboard/operator" className="text-gray-600 hover:text-black">
              Dashboard
            </a>
            <a href="/dashboard/operator/products" className="text-gray-600 hover:text-black">
              Prodotti
            </a>
            <a href="/dashboard/operator/kyc" className="text-gray-600 hover:text-black">
              KYC
            </a>
            <a href="/dashboard/operator/settings" className="text-gray-600 hover:text-black">
              Impostazioni
            </a>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-gray-400 hover:text-red-600">
                Esci
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
