import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/logger";

// GET /api/tours - Public list or operator's tours
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operatorOnly = searchParams.get("mine") === "true";

  if (operatorOnly) {
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { data: operator } = await supabase
      .from("operators")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!operator) {
      return NextResponse.json({ error: "Operatore non trovato" }, { status: 404 });
    }

    const db = createServiceRoleClient();
    const { data: tours, error } = await db
      .from("tours")
      .select("*, tour_images(id, image_url, sort_order)")
      .eq("operator_id", operator.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ tours });
  }

  // Public listing
  const supabase = createServiceRoleClient();
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("tours")
    .select("*, operators!inner(company_name), tour_images(id, image_url, sort_order)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category && category !== "tutte") {
    query = query.eq("category", category);
  }
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: tours, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tours });
}

// POST /api/tours - Operator creates a tour
export async function POST(request: NextRequest) {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { data: operator } = await supabase
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!operator) {
    return NextResponse.json({ error: "Operatore non trovato" }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, category, price_cents, currency, duration_minutes, max_guests, meeting_point, includes, highlights } = body;

  if (!title || !price_cents) {
    return NextResponse.json({ error: "Titolo e prezzo sono obbligatori" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const { data: tour, error } = await db
    .from("tours")
    .insert({
      operator_id: operator.id,
      external_id: `manual-${Date.now()}`,
      external_provider: "fareharbor",
      title,
      description: description || null,
      category: category || "tour",
      price_cents,
      currency: currency || "EUR",
      duration_minutes: duration_minutes || null,
      max_guests: max_guests || 10,
      meeting_point: meeting_point || null,
      includes: includes || [],
      highlights: highlights || [],
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await auditLog({
    eventType: "tour.created",
    actorType: "operator",
    actorId: user.id,
    resourceType: "tour",
    resourceId: tour.id,
    metadata: { title },
  });

  return NextResponse.json({ tour }, { status: 201 });
}
