import { NextRequest, NextResponse } from "next/server";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";

// PUT /api/auth/tourist/profile - Update tourist profile
export async function PUT(request: NextRequest) {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, phone, preferred_language } = body;

  if (!full_name?.trim()) {
    return NextResponse.json({ error: "Nome obbligatorio" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  const { error } = await db
    .from("tourist_profiles")
    .upsert({
      user_id: user.id,
      full_name,
      email: user.email!,
      phone: phone || null,
      preferred_language: preferred_language || "it",
    }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
