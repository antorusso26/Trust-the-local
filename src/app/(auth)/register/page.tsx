"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    vatNumber: "",
    phone: "",
  });
  const [vatValidation, setVatValidation] = useState<{
    valid: boolean;
    name?: string;
  } | null>(null);
  const [vatLoading, setVatLoading] = useState(false);
  const [clickwrapAccepted, setClickwrapAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateVAT = async () => {
    if (!formData.vatNumber) return;
    setVatLoading(true);

    try {
      const res = await fetch("/api/integrations/vies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vatNumber: formData.vatNumber, countryCode: "IT" }),
      });
      const data = await res.json();
      setVatValidation({ valid: data.valid, name: data.name });
      if (data.name && !formData.companyName) {
        setFormData((prev) => ({ ...prev, companyName: data.name }));
      }
    } catch {
      setVatValidation({ valid: false });
    } finally {
      setVatLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!clickwrapAccepted) {
      setError("Devi accettare i Termini e Condizioni per procedere.");
      setLoading(false);
      return;
    }

    if (vatValidation && !vatValidation.valid) {
      setError("La Partita IVA non è valida. Verificala e riprova.");
      setLoading(false);
      return;
    }

    // 1. Create auth user
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Registrazione fallita.");
      setLoading(false);
      return;
    }

    // 2. Create operator profile (via API to use service role)
    const res = await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authData.user.id,
        companyName: formData.companyName,
        vatNumber: formData.vatNumber,
        email: formData.email,
        phone: formData.phone || null,
        clickwrapAcceptedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Errore nella creazione del profilo operatore.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/operator/kyc");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80"
            alt="Costiera Amalfitana"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/80 to-navy/60" />
        </div>
        <div className="relative z-10 px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold">
              <svg className="h-6 w-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-2xl font-heading font-bold text-white">Trust the Local</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-white leading-tight">
            Unisciti alla rete di operatori della Costiera
          </h2>
          <p className="mt-4 text-gray-300 max-w-md mx-auto">
            Registra la tua azienda e inizia a vendere le tue esperienze ai turisti di tutta la Costiera Amalfitana.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold">
                <svg className="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-lg font-heading font-bold text-navy">Trust the Local</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-heading font-bold text-navy">Registrazione Operatore</h1>
              <p className="mt-1 text-sm text-warm-gray">
                Registra la tua azienda su Trust the Local
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* VAT Number with validation */}
              <div>
                <Label htmlFor="vatNumber" className="text-navy font-medium">Partita IVA</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="vatNumber"
                    type="text"
                    required
                    value={formData.vatNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, vatNumber: e.target.value });
                      setVatValidation(null);
                    }}
                    placeholder="IT12345678901"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validateVAT}
                    disabled={vatLoading || !formData.vatNumber}
                    className="border-gold text-gold hover:bg-gold hover:text-white shrink-0"
                  >
                    {vatLoading ? "..." : "Verifica"}
                  </Button>
                </div>
                {vatValidation && (
                  <p className={`mt-1.5 text-sm ${vatValidation.valid ? "text-green-600" : "text-red-600"}`}>
                    {vatValidation.valid
                      ? `✓ P.IVA valida${vatValidation.name ? ` - ${vatValidation.name}` : ""}`
                      : "✗ P.IVA non valida"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="companyName" className="text-navy font-medium">Ragione Sociale</Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  className="mt-1"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Tour Sorrento S.r.l."
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-navy font-medium">Email aziendale</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@toursorrento.it"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-navy font-medium">Telefono (opzionale)</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+39 081 1234567"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-navy font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 8 caratteri"
                />
              </div>

              {/* Clickwrap T&C */}
              <div className="rounded-lg border border-gray-200 p-4 bg-cream">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clickwrapAccepted}
                    onChange={(e) => setClickwrapAccepted(e.target.checked)}
                    className="mt-1 accent-gold"
                  />
                  <span className="text-sm text-warm-gray leading-relaxed">
                    Accetto i{" "}
                    <a href="/terms" className="font-medium text-navy underline" target="_blank">
                      Termini e Condizioni
                    </a>{" "}
                    e confermo che la mia azienda è l&apos;unica responsabile
                    dell&apos;erogazione dei servizi turistici venduti tramite la piattaforma
                    Trust the Local. La piattaforma agisce esclusivamente come
                    fornitore tecnologico.
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-full"
                disabled={loading || !clickwrapAccepted}
              >
                {loading ? "Registrazione in corso..." : "Registrati e procedi alla verifica KYC"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-warm-gray">
              Hai già un account?{" "}
              <Link href="/login" className="font-semibold text-navy hover:text-gold transition-colors">
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
