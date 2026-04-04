"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShopTracking } from "@/hooks/useShopTracking";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

interface TourBookingFormProps {
  tourId: string;
  priceCents: number;
  currency: string;
  operatorName: string;
}

export function TourBookingForm({
  tourId,
  priceCents,
  currency,
  operatorName,
}: TourBookingFormProps) {
  const router = useRouter();
  const { shopId } = useShopTracking();
  const { createCheckoutSession, loading, error } = useStripeCheckout();

  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    guests: 1,
    bookingDate: "",
    timeSlot: "",
  });

  const totalAmount = priceCents * formData.guests;
  const formattedTotal = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalAmount / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createCheckoutSession({
      tourId,
      customerEmail: formData.customerEmail,
      customerName: formData.customerName,
      guests: formData.guests,
      bookingDate: formData.bookingDate,
      timeSlot: formData.timeSlot || undefined,
      shopId,
    });

    if (result) {
      const params = new URLSearchParams({
        clientSecret: result.clientSecret,
        bookingId: result.bookingId,
        stripeAccountId: result.stripeAccountId,
        operatorName,
        amount: totalAmount.toString(),
        currency,
      });
      router.push(`/checkout?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-heading font-semibold text-navy">Prenota Ora</h2>

      <div>
        <Label htmlFor="customerName" className="text-navy text-sm font-medium">Nome completo</Label>
        <Input
          id="customerName"
          type="text"
          required
          className="mt-1"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Mario Rossi"
        />
      </div>
      <div>
        <Label htmlFor="customerEmail" className="text-navy text-sm font-medium">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          required
          className="mt-1"
          value={formData.customerEmail}
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          placeholder="mario@email.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bookingDate" className="text-navy text-sm font-medium">Data</Label>
          <Input
            id="bookingDate"
            type="date"
            required
            className="mt-1"
            min={new Date().toISOString().split("T")[0]}
            value={formData.bookingDate}
            onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="guests" className="text-navy text-sm font-medium">Persone</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={20}
            required
            className="mt-1"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-gold-bg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-warm-gray">Totale</span>
          <span className="text-xl font-heading font-bold text-navy">{formattedTotal}</span>
        </div>
        <p className="mt-1 text-xs text-warm-gray">
          {formData.guests} {formData.guests === 1 ? "persona" : "persone"} &times;{" "}
          {new Intl.NumberFormat("it-IT", { style: "currency", currency, minimumFractionDigits: 0 }).format(priceCents / 100)}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-full text-base"
        size="lg"
        disabled={loading}
      >
        {loading ? "Preparazione pagamento..." : "Prenota Ora"}
      </Button>
    </form>
  );
}
