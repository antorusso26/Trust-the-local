"use client";

import { useState } from "react";

interface CheckoutParams {
  tourId: string;
  customerEmail: string;
  customerName?: string;
  guests: number;
  bookingDate: string;
  timeSlot?: string;
  shopId?: string | null;
}

interface CheckoutResult {
  clientSecret: string;
  bookingId: string;
  stripeAccountId: string;
  split: {
    total: number;
    operatorNet: number;
    shopCommission: number;
    platformFee: number;
  };
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (
    params: CheckoutParams
  ): Promise<CheckoutResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading, error };
}
