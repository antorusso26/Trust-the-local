import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { calculateSplit, createDirectCharge } from "@/lib/stripe/connect";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe PaymentIntent with Direct Charge model.
 * The Operator is the Merchant of Record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourId, customerEmail, customerName, guests, bookingDate, timeSlot, shopId } = body;

    if (!tourId || !customerEmail || !guests || !bookingDate) {
      return NextResponse.json(
        { error: "Missing required fields: tourId, customerEmail, guests, bookingDate" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch tour and operator info
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("*, operators(*)")
      .eq("id", tourId)
      .eq("active", true)
      .single();

    if (tourError || !tour) {
      return NextResponse.json({ error: "Tour not found or inactive" }, { status: 404 });
    }

    const operator = (tour as Record<string, unknown>).operators as {
      id: string;
      stripe_account_id: string | null;
      onboarding_status: string;
      company_name: string;
      email: string;
    };

    if (!operator?.stripe_account_id || operator.onboarding_status !== "verified") {
      return NextResponse.json(
        { error: "Operator is not verified for payments" },
        { status: 400 }
      );
    }

    // Get shop info if ref tracking provided
    let shop = null;
    let shopCommissionPct: number | undefined;
    if (shopId) {
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("qr_code_id", shopId)
        .eq("active", true)
        .single();

      if (shopData) {
        shop = shopData;
        shopCommissionPct = shopData.split_percentage_default;
      }
    }

    // Calculate split
    const totalAmount = tour.price_cents * guests;
    const split = calculateSplit(totalAmount, shopCommissionPct);

    // Create Direct Charge on Operator's connected account
    const paymentIntent = await createDirectCharge({
      amountCents: split.amountTotal,
      currency: tour.currency,
      operatorStripeAccountId: operator.stripe_account_id,
      applicationFeeCents: split.applicationFee,
      customerEmail,
      metadata: {
        tour_id: tourId,
        operator_id: operator.id,
        shop_id: shop?.id || "",
        booking_date: bookingDate,
        guests: guests.toString(),
      },
    });

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        tour_id: tourId,
        operator_id: operator.id,
        shop_id: shop?.id || null,
        customer_email: customerEmail,
        customer_name: customerName || null,
        booking_date: bookingDate,
        time_slot: timeSlot || null,
        guests,
        status: "pending",
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: split.amountTotal,
      })
      .select()
      .single();

    if (bookingError) {
      await auditLog({
        eventType: "booking.create_failed",
        actorType: "tourist",
        metadata: { error: bookingError.message, tourId },
        ipAddress: getClientIp(request),
      });
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      booking_id: booking.id,
      operator_id: operator.id,
      shop_id: shop?.id || null,
      amount_total: split.amountTotal,
      operator_net: split.operatorNet,
      shop_commission: split.shopCommission,
      platform_fee: split.platformRetained,
      status: "pending",
      stripe_payment_intent_id: paymentIntent.id,
      currency: tour.currency,
    });

    await auditLog({
      eventType: "payment.intent_created",
      actorType: "tourist",
      resourceType: "booking",
      resourceId: booking.id,
      metadata: {
        amount: split.amountTotal,
        operator_net: split.operatorNet,
        shop_commission: split.shopCommission,
        platform_fee: split.platformRetained,
        stripe_pi: paymentIntent.id,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      stripeAccountId: operator.stripe_account_id,
      split: {
        total: split.amountTotal,
        operatorNet: split.operatorNet,
        shopCommission: split.shopCommission,
        platformFee: split.platformRetained,
      },
    });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    await auditLog({
      eventType: "payment.checkout_error",
      actorType: "system",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      ipAddress: getClientIp(request),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
