"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  cancelToken?: string;
  refundAmount: string;
  refundPercent: number;
}

export function CancelBookingButton({ bookingId, cancelToken, refundAmount, refundPercent }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancel_token: cancelToken }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore durante la cancellazione");
      return;
    }

    router.refresh();
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full border border-red-200 text-red-600 py-3 rounded-full font-medium hover:bg-red-50 transition-colors text-sm"
      >
        Cancella prenotazione
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
        <p className="font-semibold mb-1">Confermi la cancellazione?</p>
        <p>Riceverai un rimborso di <strong>{refundAmount}</strong> ({refundPercent}%).</p>
        {refundPercent === 0 && <p className="mt-1 font-medium">⚠️ Nessun rimborso previsto per cancellazioni tardive.</p>}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-full text-sm hover:bg-gray-50 transition-colors"
        >
          Indietro
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading ? "Cancellazione..." : "Sì, cancella"}
        </button>
      </div>
    </div>
  );
}
