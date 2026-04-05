import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// POST /api/auth/tourist - Register tourist account
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, full_name, phone, preferred_language } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Email, password e nome sono obbligatori" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La password deve avere almeno 6 caratteri" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Create auth user
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already")) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // Set role
  await db.from("user_roles").insert({
    user_id: userId,
    role: "tourist",
  });

  // Create tourist profile
  await db.from("tourist_profiles").insert({
    user_id: userId,
    full_name,
    email,
    phone: phone || null,
    preferred_language: preferred_language || "it",
  });

  return NextResponse.json({
    success: true,
    user_id: userId,
  }, { status: 201 });
}
