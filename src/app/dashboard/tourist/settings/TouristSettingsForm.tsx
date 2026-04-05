"use client";

import { useState } from "react";

interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  preferred_language: string;
}

interface Props {
  profile: Profile | null;
  userId: string;
  email: string;
}

const LANGUAGES = [
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
];

export function TouristSettingsForm({ profile, userId, email }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [lang, setLang] = useState(profile?.preferred_language || "it");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/tourist/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone, preferred_language: lang }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Errore durante il salvataggio");
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Nome completo *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">L&apos;email non può essere modificata qui</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Telefono</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+39 320 123 4567"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Lingua preferita</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">✓ Profilo aggiornato con successo!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D4A843] hover:bg-[#c49938] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
      >
        {loading ? "Salvataggio..." : "Salva Modifiche"}
      </button>
    </form>
  );
}
