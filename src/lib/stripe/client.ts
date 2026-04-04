import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Get Stripe client (lazy-initialized).
 * Avoids build-time errors when STRIPE_SECRET_KEY is not set.
 */
export function stripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}
