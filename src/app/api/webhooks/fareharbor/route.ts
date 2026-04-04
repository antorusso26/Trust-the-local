import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { refundPayment } from "@/lib/stripe/connect";
import { auditLog } from "@/lib/logger";

/**
 * POST /api/webhooks/fareharbor
 * Handles FareHarbor webhooks (e.g., booking_cancelled due to bad weather).
 * Automatically triggers Stripe refund.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, booking } = body;

    await auditLog({
      eventType: `webhook.fareharbor.${event}`,
      actorType: "webhook",
      metadata: { event, booking_uuid: booking?.uuid },
    });

    if (event === "booking_cancelled" || event === "booking.cancelled") {
      if (!booking?.uuid) {
        return NextResponse.json({ error: "Missing booking UUID" }, { status: 400 });
      }

      const supabase = createServiceRoleClient();

      // Find our booking by external_booking_id
      const { data: localBooking, error } = await supabase
        .from("bookings")
        .select(`
          *,
          operators!inner(stripe_account_id)
        `)
        .eq("external_booking_id", booking.uuid)
        .single();

      if (error || !localBooking) {
        await auditLog({
          eventType: "webhook.fareharbor.booking_not_found",
          actorType: "webhook",
          metadata: { external_booking_id: booking.uuid },
        });
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const operator = (localBooking as Record<string, unknown>).operators as {
        stripe_account_id: string;
      };

      // Trigger Stripe refund if payment was captured
      if (localBooking.stripe_payment_intent_id && operator.stripe_account_id) {
        try {
          await refundPayment(
            localBooking.stripe_payment_intent_id,
            operator.stripe_account_id,
            "Booking cancelled by operator (e.g., bad weather)"
          );

          await supabase
            .from("bookings")
            .update({ status: "refunded" })
            .eq("id", localBooking.id);

          await supabase
            .from("transactions")
            .update({ status: "refunded", updated_at: new Date().toISOString() })
            .eq("booking_id", localBooking.id);

          await auditLog({
            eventType: "refund.auto_triggered",
            actorType: "webhook",
            resourceType: "booking",
            resourceId: localBooking.id,
            metadata: {
              reason: "fareharbor_cancellation",
              stripe_pi: localBooking.stripe_payment_intent_id,
            },
          });
        } catch (refundErr) {
          await auditLog({
            eventType: "refund.auto_failed",
            actorType: "webhook",
            resourceType: "booking",
            resourceId: localBooking.id,
            metadata: {
              error: refundErr instanceof Error ? refundErr.message : "Unknown",
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[FAREHARBOR_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
