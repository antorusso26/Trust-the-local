import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const db = createServiceRoleClient();
  const { data: roleRow } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ role: roleRow?.role || "tourist" });
}
