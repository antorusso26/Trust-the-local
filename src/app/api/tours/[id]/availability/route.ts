import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";

// GET /api/tours/[id]/availability?month=2026-04
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // format: YYYY-MM

  const db = createServiceRoleClient();

  let query = db
    .from("tour_availability")
    .select("*")
    .eq("tour_id", id)
    .eq("blocked", false)
    .order("date", { ascending: true });

  if (month) {
    const start = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", start).lte("date", end);
  } else {
    // Default: next 60 days
    const today = new Date().toISOString().split("T")[0];
    const future = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];
    query = query.gte("date", today).lte("date", future);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter out fully booked dates
  const available = (data || []).map((slot: { max_guests: number; booked_guests: number; [key: string]: unknown }) => ({
    ...slot,
    spots_left: slot.max_guests - slot.booked_guests,
    is_available: slot.max_guests > slot.booked_guests,
  }));

  return NextResponse.json({ availability: available });
}

// POST /api/tours/[id]/availability - Operator sets availability
export async function POST(
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

  if (!tour || (tour.operators as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await request.json();
  const { dates } = body as {
    dates: Array<{
      date: string;
      time_slots: string[];
      max_guests: number;
      blocked?: boolean;
    }>;
  };

  if (!dates || !Array.isArray(dates)) {
    return NextResponse.json({ error: "dates array richiesto" }, { status: 400 });
  }

  const rows = dates.map((d) => ({
    tour_id: id,
    date: d.date,
    time_slots: d.time_slots || [],
    max_guests: d.max_guests || 10,
    blocked: d.blocked || false,
  }));

  const { data, error } = await db
    .from("tour_availability")
    .upsert(rows, { onConflict: "tour_id,date" })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ availability: data });
}
