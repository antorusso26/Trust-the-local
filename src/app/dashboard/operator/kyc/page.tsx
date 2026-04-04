"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KYCPage() {
  const [operator, setOperator] = useState<{
    onboarding_status: string;
    stripe_account_id: string | null;
    company_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    loadOperator();
  }, []);

  const loadOperator = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("operators")
      .select("onboarding_status, stripe_account_id, company_name")
      .eq("user_id", user.id)
      .single();

    setOperator(data);
    setLoading(false);
  };

  const startOnboarding = async () => {
    setRedirecting(true);
    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setRedirecting(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: "default" | "secondary" | "destructive" }> = {
    pending: { label: "Non avviato", color: "secondary" },
    in_review: { label: "In revisione", color: "default" },
    verified: { label: "Verificato", color: "default" },
    rejected: { label: "Rifiutato", color: "destructive" },
  };

  if (loading) {
    return <div className="animate-pulse h-64 rounded-lg bg-gray-100" />;
  }

  const status = operator?.onboarding_status || "pending";
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verifica KYC</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Stato Verifica</h2>
            <Badge variant={config.color}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verified" ? (
            <div className="rounded-md bg-green-50 p-4 text-green-800">
              <p className="font-medium">Verifica completata!</p>
              <p className="mt-1 text-sm">
                Il tuo account è verificato e puoi ricevere pagamenti.
              </p>
            </div>
          ) : status === "rejected" ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800">
              <p className="font-medium">Verifica non superata</p>
              <p className="mt-1 text-sm">
                Contattaci per assistenza nella verifica del tuo account.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Per ricevere pagamenti, è necessario completare la verifica KYC
                (Know Your Customer) tramite Stripe Identity. Questo processo
                richiede:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Documento d&apos;identità del rappresentante legale</li>
                <li>Dati aziendali (già inseriti in fase di registrazione)</li>
                <li>Coordinate bancarie per ricevere i pagamenti</li>
              </ul>
              <Button
                onClick={startOnboarding}
                disabled={redirecting}
                className="w-full"
                size="lg"
              >
                {redirecting
                  ? "Reindirizzamento a Stripe..."
                  : status === "in_review"
                    ? "Completa la verifica su Stripe"
                    : "Avvia verifica KYC"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Verrai reindirizzato su Stripe per completare la verifica in sicurezza.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
