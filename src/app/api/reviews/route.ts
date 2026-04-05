import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";

// GET /api/reviews?tour_id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tourId = searchParams.get("tour_id");

  if (!tourId) {
    return NextResponse.json({ error: "tour_id richiesto" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const { data: reviews, error } = await db
    .from("reviews")
    .select("*")
    .eq("tour_id", tourId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: reviews || [] });
}

// POST /api/reviews - Submit a review
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { booking_id, tour_id, tourist_email, tourist_name, rating, comment } = body;

  if (!tour_id || !tourist_email || !tourist_name || !rating) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating deve essere tra 1 e 5" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Check if already reviewed this booking
  if (booking_id) {
    const { data: existing } = await db
      .from("reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Hai già lasciato una recensione per questa prenotazione" }, { status: 409 });
    }
  }

  // Try to get user_id if authenticated
  let userId: string | null = null;
  try {
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  } catch {
    // Not authenticated, that's fine
  }

  const { data: review, error } = await db
    .from("reviews")
    .insert({
      booking_id: booking_id || null,
      tour_id,
      tourist_email,
      tourist_name,
      user_id: userId,
      rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}

// PUT /api/reviews - Operator replies to review
export async function PUT(request: NextRequest) {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { review_id, operator_reply } = body;

  if (!review_id || !operator_reply) {
    return NextResponse.json({ error: "review_id e operator_reply richiesti" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Verify operator owns the tour
  const { data: review } = await db
    .from("reviews")
    .select("tour_id, tours!inner(operator_id, operators!inner(user_id))")
    .eq("id", review_id)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Recensione non trovata" }, { status: 404 });
  }

  const tourData = review.tours as unknown as { operators: { user_id: string } };
  if (tourData.operators.user_id !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { error } = await db
    .from("reviews")
    .update({
      operator_reply,
      operator_replied_at: new Date().toISOString(),
    })
    .eq("id", review_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
