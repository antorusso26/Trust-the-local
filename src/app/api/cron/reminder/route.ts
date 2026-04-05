import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { bookingReminderEmail } from "@/lib/email/templates";

// GET /api/cron/reminder - Send 24h reminders (called by external cron)
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const db = createServiceRoleClient();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const { data: bookings, error } = await db
    .from("bookings")
    .select(`
      id, customer_email, customer_name, booking_date, time_slot, guests,
      tours!inner(title, meeting_point),
      operators!inner(company_name)
    `)
    .eq("status", "confirmed")
    .eq("booking_date", tomorrowDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const booking of bookings || []) {
    const tourData = booking.tours as unknown as { title: string; meeting_point?: string };
    const operatorData = booking.operators as unknown as { company_name: string };

    const emailContent = bookingReminderEmail({
      customerName: booking.customer_name || "Viaggiatore",
      tourTitle: tourData.title,
      bookingDate: booking.booking_date,
      timeSlot: booking.time_slot || undefined,
      operatorName: operatorData.company_name,
      meetingPoint: tourData.meeting_point || undefined,
      bookingId: booking.id,
    });

    try {
      await sendEmail({ to: booking.customer_email, ...emailContent });
      sent++;
    } catch (err) {
      console.error(`[Reminder] Failed for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ sent, total: bookings?.length || 0 });
}
