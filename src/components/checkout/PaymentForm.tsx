"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "./Disclaimer";

interface PaymentFormProps {
  bookingId: string;
  operatorName: string;
  totalAmount: number;
  currency: string;
}

export function PaymentForm({
  bookingId,
  operatorName,
  totalAmount,
  currency,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: paymentError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?bookingId=${bookingId}`,
      },
    });

    if (paymentError) {
      setError(paymentError.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(totalAmount / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Disclaimer operatorName={operatorName} />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        {isProcessing ? "Elaborazione..." : `Paga ${formattedAmount}`}
      </Button>
    </form>
  );
}
