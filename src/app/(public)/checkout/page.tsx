"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const clientSecret = searchParams.get("clientSecret");
  const bookingId = searchParams.get("bookingId");
  const stripeAccountId = searchParams.get("stripeAccountId");
  const operatorName = searchParams.get("operatorName") || "Operatore";
  const amount = parseInt(searchParams.get("amount") || "0");
  const currency = searchParams.get("currency") || "EUR";

  if (!clientSecret || !bookingId || !stripeAccountId) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-bg mb-4">
          <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-navy">Sessione scaduta</h1>
        <p className="mt-2 text-warm-gray">
          Torna alla pagina del tour e riprova.
        </p>
        <Link
          href="/esperienze"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark transition-colors"
        >
          Torna alle Esperienze
        </Link>
      </div>
    );
  }

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    { stripeAccount: stripeAccountId }
  );

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-bg mb-3">
          <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold text-navy">Pagamento Sicuro</h1>
        <p className="mt-1 text-sm text-warm-gray">Esperienza di {operatorName}</p>
      </div>

      {/* Stripe Elements */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#D4A843",
                colorBackground: "#FFFFFF",
                colorText: "#1B2A4A",
                borderRadius: "8px",
                fontFamily: "Inter, system-ui, sans-serif",
              },
            },
            locale: "it",
          }}
        >
          <PaymentForm
            bookingId={bookingId}
            operatorName={operatorName}
            totalAmount={amount}
            currency={currency}
          />
        </Elements>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-warm-gray">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          SSL Protetto
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Stripe Verified
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Rimborso 48h
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gold mx-auto" />
        <p className="mt-4 text-warm-gray">Caricamento...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
