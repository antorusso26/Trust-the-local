"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/operator");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1200&q=80"
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
            Bentornato nella tua Costiera
          </h2>
          <p className="mt-4 text-gray-300 max-w-md mx-auto">
            Gestisci le tue esperienze, monitora le prenotazioni e fai crescere il tuo business.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-cream px-4 py-8">
        <div className="w-full max-w-md">
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
              <h1 className="text-2xl font-heading font-bold text-navy">Accedi</h1>
              <p className="mt-1 text-sm text-warm-gray">
                Accedi al portale operatore
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-navy font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operatore@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-navy font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La tua password"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-full"
                disabled={loading}
              >
                {loading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-warm-gray">
              Non hai un account?{" "}
              <Link href="/register" className="font-semibold text-navy hover:text-gold transition-colors">
                Registrati come operatore
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
