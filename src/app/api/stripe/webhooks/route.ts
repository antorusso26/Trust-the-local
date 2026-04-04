import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe/connect";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/logger";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhooks
 * Handles Stripe webhook events.
 * Must use raw body for signature verification.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    await auditLog({
      eventType: "webhook.signature_failed",
      actorType: "webhook",
      metadata: { error: err instanceof Error ? err.message : "Signature verification failed" },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from("transactions")
          .update({ status: "captured", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", pi.id);

        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("stripe_payment_intent_id", pi.id);

        await auditLog({
          eventType: "payment.succeeded",
          actorType: "webhook",
          resourceType: "transaction",
          metadata: {
            stripe_pi: pi.id,
            amount: pi.amount,
            currency: pi.currency,
          },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from("transactions")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", pi.id);

        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("stripe_payment_intent_id", pi.id);

        await auditLog({
          eventType: "payment.failed",
          actorType: "webhook",
          resourceType: "transaction",
          metadata: {
            stripe_pi: pi.id,
            error: pi.last_payment_error?.message || "Unknown",
          },
        });
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;

        if (account.charges_enabled && account.details_submitted) {
          await supabase
            .from("operators")
            .update({ onboarding_status: "verified" })
            .eq("stripe_account_id", account.id);

          await auditLog({
            eventType: "operator.verified",
            actorType: "webhook",
            resourceType: "operator",
            metadata: { stripe_account_id: account.id },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (piId) {
          await supabase
            .from("transactions")
            .update({ status: "refunded", updated_at: new Date().toISOString() })
            .eq("stripe_payment_intent_id", piId);

          await supabase
            .from("bookings")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", piId);

          await auditLog({
            eventType: "payment.refunded",
            actorType: "webhook",
            resourceType: "transaction",
            metadata: { stripe_pi: piId },
          });
        }
        break;
      }

      default:
        // Unhandled event type - log for monitoring
        await auditLog({
          eventType: "webhook.unhandled",
          actorType: "webhook",
          metadata: { event_type: event.type, event_id: event.id },
        });
    }
  } catch (error) {
    await auditLog({
      eventType: "webhook.processing_error",
      actorType: "webhook",
      metadata: {
        event_type: event.type,
        error: error instanceof Error ? error.message : "Unknown",
      },
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
