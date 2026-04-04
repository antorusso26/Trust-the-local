import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createBooking as createFareHarborBooking } from "@/lib/integrations/fareharbor";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * POST /api/bookings
 * Confirm a booking after payment succeeded.
 * Creates the booking on FareHarbor/Bokun.
 * Called by the frontend after payment confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentIntentId } = body;

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Missing bookingId or paymentIntentId" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get booking with tour and operator info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        tours!inner(*, operators!inner(*))
      `)
      .eq("id", bookingId)
      .eq("stripe_payment_intent_id", paymentIntentId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const tour = (booking as Record<string, unknown>).tours as {
      external_id: string;
      external_provider: string;
      operators: {
        id: string;
        fareharbor_id: string | null;
        bokun_id: string | null;
      };
    };
    const operator = tour.operators;

    // Create external booking based on provider
    let externalBookingId: string | null = null;

    if (tour.external_provider === "fareharbor" && operator.fareharbor_id) {
      try {
        const fhBooking = await createFareHarborBooking(
          operator.fareharbor_id,
          parseInt(tour.external_id),
          {
            customerName: booking.customer_name || booking.customer_email,
            customerEmail: booking.customer_email,
            guests: booking.guests,
            voucherNumber: booking.id,
          }
        );
        externalBookingId = fhBooking.uuid;
      } catch (err) {
        await auditLog({
          eventType: "booking.external_create_failed",
          actorType: "system",
          resourceType: "booking",
          resourceId: booking.id,
          metadata: {
            provider: "fareharbor",
            error: err instanceof Error ? err.message : "Unknown",
          },
          ipAddress: getClientIp(request),
        });
        // Don't fail the booking - payment was already captured.
        // The operator will need to manually confirm.
      }
    }

    // Update booking with external ID
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        external_booking_id: externalBookingId,
      })
      .eq("id", bookingId);

    await auditLog({
      eventType: "booking.confirmed",
      actorType: "system",
      resourceType: "booking",
      resourceId: bookingId,
      metadata: {
        external_booking_id: externalBookingId,
        provider: tour.external_provider,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({
      bookingId,
      status: "confirmed",
      externalBookingId,
    });
  } catch (error) {
    console.error("[BOOKING_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
