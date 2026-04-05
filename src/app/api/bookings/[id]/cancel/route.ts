import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { sendEmail } from "@/lib/email/client";
import { bookingCancelledTouristEmail, bookingCancelledOperatorEmail } from "@/lib/email/templates";
import { auditLog } from "@/lib/logger";

function calculateRefund(bookingDate: string, timeSlot: string | null): { percentage: number } {
  const tourDateTime = new Date(`${bookingDate}T${timeSlot || "12:00"}:00`);
  const now = new Date();
  const hoursUntilTour = (tourDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilTour >= 48) return { percentage: 100 };
  if (hoursUntilTour >= 24) return { percentage: 50 };
  return { percentage: 0 };
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// POST /api/bookings/[id]/cancel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { cancel_token, reason } = body as { cancel_token?: string; reason?: string };

  const db = createServiceRoleClient();

  // Fetch booking with tour and operator info
  const { data: booking, error } = await db
    .from("bookings")
    .select(`
      *,
      tours!inner(title, meeting_point),
      operators!inner(email, company_name)
    `)
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
  }

  // Verify access: either by cancel_token or authenticated user
  if (cancel_token && booking.cancel_token !== cancel_token) {
    return NextResponse.json({ error: "Token non valido" }, { status: 403 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "La prenotazione non può essere cancellata" }, { status: 400 });
  }

  // Calculate refund
  const { percentage } = calculateRefund(booking.booking_date, booking.time_slot);
  const refundAmountCents = Math.round(booking.amount_cents * (percentage / 100));

  // Process Stripe refund if applicable
  if (refundAmountCents > 0 && booking.stripe_payment_intent_id) {
    try {
      const stripe = getStripe();
      await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: refundAmountCents,
      });
    } catch (stripeError) {
      console.error("[Cancel] Stripe refund failed:", stripeError);
      return NextResponse.json({ error: "Errore durante il rimborso" }, { status: 500 });
    }
  }

  // Update booking
  await db
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || null,
      refund_amount_cents: refundAmountCents,
      refund_percentage: percentage,
    })
    .eq("id", id);

  // Update transaction
  if (booking.stripe_payment_intent_id) {
    await db
      .from("transactions")
      .update({ status: percentage === 100 ? "refunded" : "captured" })
      .eq("stripe_payment_intent_id", booking.stripe_payment_intent_id);
  }

  // Update availability (free up spots)
  await db.rpc("decrement_booked_guests", {
    p_tour_id: booking.tour_id,
    p_date: booking.booking_date,
    p_guests: booking.guests,
  }).then(() => {}).catch(() => {
    // RPC may not exist yet, manually update
    db.from("tour_availability")
      .select("booked_guests")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.booking_date)
      .single()
      .then(({ data: avail }: { data: { booked_guests: number } | null }) => {
        if (avail) {
          db.from("tour_availability")
            .update({ booked_guests: Math.max(0, avail.booked_guests - booking.guests) })
            .eq("tour_id", booking.tour_id)
            .eq("date", booking.booking_date);
        }
      });
  });

  const tourData = booking.tours as { title: string };
  const operatorData = booking.operators as { email: string; company_name: string };
  const refundFormatted = formatCents(refundAmountCents, "EUR");

  // Send emails
  try {
    const touristEmail = bookingCancelledTouristEmail({
      customerName: booking.customer_name || "Cliente",
      tourTitle: tourData.title,
      bookingDate: booking.booking_date,
      refundAmount: refundFormatted,
      refundPercentage: percentage,
    });
    await sendEmail({ to: booking.customer_email, ...touristEmail });

    const opEmail = bookingCancelledOperatorEmail({
      operatorName: operatorData.company_name,
      tourTitle: tourData.title,
      customerName: booking.customer_name || "Cliente",
      bookingDate: booking.booking_date,
      refundAmount: refundFormatted,
    });
    await sendEmail({ to: operatorData.email, ...opEmail });
  } catch (emailError) {
    console.error("[Cancel] Email failed:", emailError);
  }

  await auditLog({
    eventType: "booking.cancelled",
    actorType: "tourist",
    actorId: booking.customer_email,
    resourceType: "booking",
    resourceId: id,
    metadata: { refund_percentage: percentage, refund_amount_cents: refundAmountCents },
  });

  return NextResponse.json({
    success: true,
    refund_percentage: percentage,
    refund_amount_cents: refundAmountCents,
    refund_amount: refundFormatted,
  });
}
