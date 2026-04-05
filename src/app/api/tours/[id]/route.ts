import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";

// GET /api/tours/[id] - Public tour detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: tour, error } = await supabase
    .from("tours")
    .select(`
      *,
      operators!inner(id, company_name, logo_url, email, phone),
      tour_images(id, image_url, storage_path, sort_order, alt_text)
    `)
    .eq("id", id)
    .single();

  if (error || !tour) {
    return NextResponse.json({ error: "Tour non trovato" }, { status: 404 });
  }

  // Get reviews summary
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("tour_id", id)
    .eq("published", true);

  const reviews = reviewData || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({
    tour: {
      ...tour,
      review_count: reviews.length,
      avg_rating: Math.round(avgRating * 10) / 10,
    },
  });
}

// PUT /api/tours/[id] - Operator updates tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = createServiceRoleClient();

  // Verify ownership
  const { data: tour } = await db
    .from("tours")
    .select("operator_id, operators!inner(user_id)")
    .eq("id", id)
    .single();

  if (!tour || (tour.operators as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = ["title", "description", "category", "price_cents", "currency", "duration_minutes", "max_guests", "meeting_point", "includes", "highlights", "active", "image_url"];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data: updated, error } = await db
    .from("tours")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tour: updated });
}

// DELETE /api/tours/[id] - Soft delete (set active = false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = createServiceRoleClient();

  const { data: tour } = await db
    .from("tours")
    .select("operator_id, operators!inner(user_id)")
    .eq("id", id)
    .single();

  if (!tour || (tour.operators as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { error } = await db
    .from("tours")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
