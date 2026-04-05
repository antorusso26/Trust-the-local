import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { monthlyReportEmail } from "@/lib/email/templates";

// GET /api/cron/monthly-report - Send monthly reports to operators
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const db = createServiceRoleClient();
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const periodStart = lastMonth.toISOString().split("T")[0];
  const periodEnd = lastMonthEnd.toISOString().split("T")[0];

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];
  const monthLabel = `${monthNames[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`;

  // Get all verified operators
  const { data: operators } = await db
    .from("operators")
    .select("id, email, company_name")
    .eq("onboarding_status", "verified");

  let sent = 0;
  for (const operator of operators || []) {
    // Get bookings for this operator in the period
    const { data: bookings } = await db
      .from("bookings")
      .select("id, amount_cents, tour_id, tours!inner(title)")
      .eq("operator_id", operator.id)
      .eq("status", "confirmed")
      .gte("booking_date", periodStart)
      .lte("booking_date", periodEnd);

    if (!bookings || bookings.length === 0) continue;

    const totalRevenue = bookings.reduce((sum: number, b: { amount_cents: number }) => sum + b.amount_cents, 0);

    // Get transactions for net amount
    const { data: transactions } = await db
      .from("transactions")
      .select("operator_net")
      .eq("operator_id", operator.id)
      .eq("status", "captured")
      .gte("created_at", `${periodStart}T00:00:00`)
      .lte("created_at", `${periodEnd}T23:59:59`);

    const totalNet = transactions?.reduce((sum: number, t: { operator_net: number }) => sum + t.operator_net, 0) || 0;

    // Find top tour
    const tourCounts: Record<string, { title: string; count: number }> = {};
    for (const b of bookings) {
      const tourTitle = (b.tours as { title: string }).title;
      if (!tourCounts[b.tour_id]) {
        tourCounts[b.tour_id] = { title: tourTitle, count: 0 };
      }
      tourCounts[b.tour_id].count++;
    }
    const topTour = Object.values(tourCounts).sort((a, b) => b.count - a.count)[0];

    const formatEur = (cents: number) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);

    const emailContent = monthlyReportEmail({
      operatorName: operator.company_name,
      month: monthLabel,
      totalBookings: bookings.length,
      totalRevenue: formatEur(totalRevenue),
      totalNet: formatEur(totalNet),
      topTour: topTour?.title || "-",
      topTourBookings: topTour?.count || 0,
    });

    try {
      await sendEmail({ to: operator.email, ...emailContent });
      sent++;
    } catch (err) {
      console.error(`[MonthlyReport] Failed for operator ${operator.id}:`, err);
    }
  }

  return NextResponse.json({ sent, total: operators?.length || 0 });
}
