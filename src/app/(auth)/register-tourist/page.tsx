"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterTouristPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/tourist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore durante la registrazione");
      return;
    }

    // Sign in immediately after registration
    const { createBrowserClient } = await import("@supabase/ssr");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithPassword({ email, password });
    router.push("/dashboard/tourist");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#1B2A4A] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-coastal.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative text-center">
          <h1 className="text-[#D4A843] font-bold text-3xl tracking-widest mb-2">Trust the Local</h1>
          <p className="text-white/50 tracking-[0.3em] text-xs mb-12">COSTIERA AMALFITANA</p>
          <p className="text-white text-xl font-light leading-relaxed max-w-sm">
            Crea il tuo account e accedi alle esperienze più autentiche della Costiera
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FBF8F1]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">Crea Account</h2>
            <p className="text-gray-500 mt-1">Registrati per prenotare e gestire le tue esperienze</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Nome completo *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A843] bg-white"
                placeholder="Mario Rossi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A843] bg-white"
                placeholder="mario@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A843] bg-white"
                placeholder="Minimo 6 caratteri"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Telefono (opzionale)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A843] bg-white"
                placeholder="+39 320 123 4567"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A843] hover:bg-[#c49938] text-white py-3.5 rounded-full font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Registrazione..." : "Crea Account"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm text-gray-500">
            <p>
              Hai già un account?{" "}
              <Link href="/login" className="text-[#D4A843] font-medium hover:underline">Accedi</Link>
            </p>
            <p>
              Sei un operatore?{" "}
              <Link href="/register" className="text-[#1B2A4A] font-medium hover:underline">Registra la tua azienda</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
