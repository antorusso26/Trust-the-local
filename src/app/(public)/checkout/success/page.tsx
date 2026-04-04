"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    // Confirm booking on backend after payment success
    if (bookingId && paymentIntent) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentIntentId: paymentIntent }),
      }).catch(console.error);
    }
  }, [bookingId, paymentIntent]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-bold">Prenotazione confermata!</h1>
      <p className="mt-2 text-gray-600">
        Riceverai una email di conferma con tutti i dettagli del tuo tour.
      </p>

      {bookingId && (
        <p className="mt-4 text-sm text-gray-500">
          Codice prenotazione: <code className="font-mono">{bookingId.slice(0, 8)}</code>
        </p>
      )}

      <p className="mt-6 text-sm text-gray-500">
        Per modifiche o cancellazioni, contatta direttamente l&apos;operatore
        rispondendo alla email di conferma.
      </p>

      <a href="/">
        <Button className="mt-8">Torna alla Home</Button>
      </a>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
