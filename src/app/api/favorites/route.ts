import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";

// GET /api/favorites - Get user's favorites
export async function GET() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = createServiceRoleClient();
  const { data: favorites, error } = await db
    .from("favorites")
    .select(`
      tour_id,
      created_at,
      tours!inner(
        id, title, description, image_url, price_cents, currency,
        duration_minutes, category, operators!inner(company_name)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: favorites || [] });
}

// POST /api/favorites - Toggle favorite
export async function POST(request: NextRequest) {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { tour_id } = await request.json();
  if (!tour_id) {
    return NextResponse.json({ error: "tour_id richiesto" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Check if already favorited
  const { data: existing } = await db
    .from("favorites")
    .select("tour_id")
    .eq("user_id", user.id)
    .eq("tour_id", tour_id)
    .single();

  if (existing) {
    // Remove favorite
    await db
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("tour_id", tour_id);

    return NextResponse.json({ favorited: false });
  } else {
    // Add favorite
    await db
      .from("favorites")
      .insert({ user_id: user.id, tour_id });

    return NextResponse.json({ favorited: true });
  }
}
