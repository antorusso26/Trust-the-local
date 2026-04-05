import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import crypto from "crypto";

// POST /api/shops/scans - Track QR scan
export async function POST(request: NextRequest) {
  const { shop_id } = await request.json();
  if (!shop_id) {
    return NextResponse.json({ error: "shop_id richiesto" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  // Verify shop exists
  const { data: shop } = await db
    .from("shops")
    .select("id")
    .eq("id", shop_id)
    .single();

  if (!shop) {
    // Try by qr_code_id
    const { data: shopByQr } = await db
      .from("shops")
      .select("id")
      .eq("qr_code_id", shop_id)
      .single();

    if (!shopByQr) {
      return NextResponse.json({ error: "Shop non trovato" }, { status: 404 });
    }
  }

  const actualShopId = shop?.id || shop_id;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const userAgent = request.headers.get("user-agent") || null;

  await db.from("shop_scans").insert({
    shop_id: actualShopId,
    user_agent: userAgent,
    ip_hash: ipHash,
  });

  return NextResponse.json({ tracked: true });
}

// GET /api/shops/scans?shop_id=xxx&period=month
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shop_id");
  const period = searchParams.get("period") || "month";

  if (!shopId) {
    return NextResponse.json({ error: "shop_id richiesto" }, { status: 400 });
  }

  const db = createServiceRoleClient();

  let startDate: string;
  const now = new Date();
  if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
  } else if (period === "year") {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  const { data: scans, error } = await db
    .from("shop_scans")
    .select("scanned_at")
    .eq("shop_id", shopId)
    .gte("scanned_at", startDate)
    .order("scanned_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get bookings from this shop
  const { data: bookings } = await db
    .from("bookings")
    .select("id, amount_cents, status")
    .eq("shop_id", shopId)
    .gte("created_at", startDate);

  // Get commissions
  const { data: transactions } = await db
    .from("transactions")
    .select("shop_commission, status")
    .eq("shop_id", shopId)
    .gte("created_at", startDate);

  const totalScans = scans?.length || 0;
  const totalBookings = bookings?.filter((b: { status: string }) => b.status !== "cancelled").length || 0;
  const totalCommission = transactions?.reduce((sum: number, t: { shop_commission: number }) => sum + (t.shop_commission || 0), 0) || 0;
  const conversionRate = totalScans > 0 ? ((totalBookings / totalScans) * 100).toFixed(1) : "0";

  return NextResponse.json({
    total_scans: totalScans,
    total_bookings: totalBookings,
    total_commission_cents: totalCommission,
    conversion_rate: conversionRate,
    scans_by_day: groupByDay(scans || []),
  });
}

function groupByDay(scans: Array<{ scanned_at: string }>) {
  const groups: Record<string, number> = {};
  for (const scan of scans) {
    const day = scan.scanned_at.split("T")[0];
    groups[day] = (groups[day] || 0) + 1;
  }
  return Object.entries(groups).map(([date, count]) => ({ date, count }));
}
