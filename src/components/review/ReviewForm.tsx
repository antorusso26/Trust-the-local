"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  tourId: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ tourId, bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Seleziona una valutazione"); return; }
    if (!name.trim()) { setError("Inserisci il tuo nome"); return; }
    if (!email.trim()) { setError("Inserisci la tua email"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tour_id: tourId, booking_id: bookingId, rating, comment, tourist_name: name, tourist_email: email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore durante l'invio");
      return;
    }

    setSuccess(true);
    onSuccess?.();
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">⭐</div>
        <p className="font-semibold text-green-800">Grazie per la tua recensione!</p>
        <p className="text-green-700 text-sm mt-1">La tua opinione aiuta altri viaggiatori.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Valutazione *</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Nome *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
            placeholder="Il tuo nome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
            placeholder="La tua email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Commento (opzionale)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843] resize-none"
          placeholder="Racconta la tua esperienza..."
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D4A843] hover:bg-[#c49938] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
      >
        {loading ? "Invio in corso..." : "Invia Recensione"}
      </button>
    </form>
  );
}
