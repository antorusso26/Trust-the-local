"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TourFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    price_cents?: number;
    duration_minutes?: number;
    max_guests?: number;
    meeting_point?: string;
    includes?: string[];
    highlights?: string[];
    active?: boolean;
  };
}

const CATEGORIES = [
  { value: "tour", label: "Tour Guidato" },
  { value: "barca", label: "Gita in Barca" },
  { value: "esperienze", label: "Esperienza" },
  { value: "food", label: "Food & Wine" },
];

export function TourForm({ initialData }: TourFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "tour");
  const [price, setPrice] = useState(initialData?.price_cents ? (initialData.price_cents / 100).toString() : "");
  const [duration, setDuration] = useState(initialData?.duration_minutes?.toString() || "");
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests?.toString() || "10");
  const [meetingPoint, setMeetingPoint] = useState(initialData?.meeting_point || "");
  const [includesText, setIncludesText] = useState((initialData?.includes || []).join("\n"));
  const [highlightsText, setHighlightsText] = useState((initialData?.highlights || []).join("\n"));
  const [active, setActive] = useState(initialData?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      title,
      description,
      category,
      price_cents: Math.round(parseFloat(price) * 100),
      duration_minutes: duration ? parseInt(duration) : null,
      max_guests: parseInt(maxGuests),
      meeting_point: meetingPoint || null,
      includes: includesText.split("\n").map((s) => s.trim()).filter(Boolean),
      highlights: highlightsText.split("\n").map((s) => s.trim()).filter(Boolean),
      active,
    };

    const url = isEdit ? `/api/tours/${initialData!.id}` : "/api/tours";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore durante il salvataggio");
      return;
    }

    router.push("/dashboard/operator/tours");
    router.refresh();
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843] text-sm";
  const labelClass = "block text-sm font-medium text-[#1B2A4A] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-[#1B2A4A]">Informazioni Base</h2>

        <div>
          <label className={labelClass}>Titolo *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Es. Tour in barca alle Grotte di Positano" />
        </div>

        <div>
          <label className={labelClass}>Descrizione</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass + " resize-none"} placeholder="Descrivi l'esperienza, cosa vedranno i turisti, perché è speciale..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoria *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Prezzo a persona (€) *</label>
            <input type="number" step="0.01" min="1" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} placeholder="45.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Durata (minuti)</label>
            <input type="number" min="30" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} placeholder="120" />
          </div>
          <div>
            <label className={labelClass}>Max persone</label>
            <input type="number" min="1" max="100" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Punto di ritrovo</label>
          <input type="text" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} className={inputClass} placeholder="Es. Piazza Tasso, Sorrento - davanti alla Banca d'Italia" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-[#1B2A4A]">Dettagli Esperienza</h2>

        <div>
          <label className={labelClass}>Cosa include (un punto per riga)</label>
          <textarea
            value={includesText}
            onChange={(e) => setIncludesText(e.target.value)}
            rows={4}
            className={inputClass + " resize-none"}
            placeholder="Guida esperta in italiano/inglese&#10;Trasporto in barca&#10;Snorkeling equipment&#10;Acqua e limoncello"
          />
        </div>

        <div>
          <label className={labelClass}>Punti salienti (un punto per riga)</label>
          <textarea
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
            placeholder="Vista panoramica di Positano&#10;Sosta alle grotte marine&#10;Tramonto sulla costa"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setActive(!active)}
            className={`w-11 h-6 rounded-full transition-colors relative ${active ? "bg-[#D4A843]" : "bg-gray-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <div>
            <p className="font-medium text-[#1B2A4A] text-sm">{active ? "Tour attivo" : "Bozza (non visibile)"}</p>
            <p className="text-gray-400 text-xs">{active ? "Visibile ai turisti sul catalogo" : "Salvato ma non pubblicato"}</p>
          </div>
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#D4A843] hover:bg-[#c49938] text-white py-3 rounded-full font-semibold transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? "Salvataggio..." : isEdit ? "Salva Modifiche" : "Crea Tour"}
        </button>
      </div>
    </form>
  );
}
