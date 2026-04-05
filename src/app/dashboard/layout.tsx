export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const db = createServiceRoleClient();

  // Get user role
  const { data: roleRow } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (roleRow?.role as "tourist" | "operator" | "admin") || "tourist";

  // Enforce role-based routing: redirect if accessing wrong dashboard
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || headersList.get("x-invoke-path") || "";

  // If we can detect the pathname, enforce role boundaries
  if (pathname) {
    if (pathname.startsWith("/dashboard/operator") && role === "tourist") {
      redirect("/dashboard/tourist");
    }
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      redirect(`/dashboard/${role}`);
    }
    if (pathname.startsWith("/dashboard/tourist") && role === "operator") {
      redirect("/dashboard/operator");
    }
  }

  // Get display name
  let userName = user.email?.split("@")[0] || "Utente";

  if (role === "tourist") {
    const { data: profile } = await db
      .from("tourist_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();
    if (profile?.full_name) userName = profile.full_name;
  } else if (role === "operator" || role === "admin") {
    const { data: op } = await db
      .from("operators")
      .select("company_name")
      .eq("user_id", user.id)
      .single();
    if (op?.company_name) userName = op.company_name;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
