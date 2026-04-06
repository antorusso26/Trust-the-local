import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceRoleClient();
  const { data: operator } = await db
    .from("operators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!operator) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ operator });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { company_name, email, phone, description, website, address } = body;

  const db = createServiceRoleClient();
  const { data: operator } = await db
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!operator) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (company_name) updates.company_name = company_name;
  if (email) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (description !== undefined) updates.description = description;
  if (website !== undefined) updates.website = website;
  if (address !== undefined) updates.address = address;

  const { error } = await db
    .from("operators")
    .update(updates)
    .eq("id", operator.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
