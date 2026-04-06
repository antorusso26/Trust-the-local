export const dynamic = "force-dynamic";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function KycPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();
  const { data: operator } = await db
    .from("operators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!operator) redirect("/dashboard/operator");

  const op = operator as {
    id: string;
    company_name: string;
    vat_number: string;
    email: string;
    phone: string | null;
    stripe_account_id: string | null;
    onboarding_status: string;
    created_at: string;
  };

  const steps = [
    {
      num: 1,
      title: "Registrazione",
      desc: "Crea il tuo account operatore",
      done: true,
    },
    {
      num: 2,
      title: "Verifica Identità",
      desc: "Collega il tuo account Stripe Connect",
      done: !!op.stripe_account_id,
    },
    {
      num: 3,
      title: "Approvazione",
      desc: "Il team Trust the Local verifica il tuo profilo",
      done: op.onboarding_status === "verified",
    },
    {
      num: 4,
      title: "Pubblicazione",
      desc: "Crea il tuo primo tour e inizia a ricevere prenotazioni",
      done: false,
    },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: "In attesa di verifica", color: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: "⏳" },
    in_review: { label: "In revisione", color: "bg-blue-50 border-blue-200 text-blue-800", icon: "🔍" },
    verified: { label: "Verificato", color: "bg-green-50 border-green-200 text-green-800", icon: "✅" },
    rejected: { label: "Rifiutato", color: "bg-red-50 border-red-200 text-red-800", icon: "❌" },
    banned: { label: "Sospeso", color: "bg-red-50 border-red-200 text-red-800", icon: "🚫" },
  };

  const status = statusConfig[op.onboarding_status] || statusConfig.pending;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Verifica KYC</h1>
      <p className="text-gray-500 mb-8">Completa la verifica per iniziare a ricevere pagamenti</p>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-6 mb-8 ${status.color}`}>
        <div className="flex items-center gap-4">
          <span className="text-3xl">{status.icon}</span>
          <div>
            <h2 className="font-semibold text-lg">{status.label}</h2>
            <p className="text-sm opacity-80 mt-0.5">
              {op.onboarding_status === "verified"
                ? "Il tuo account è attivo. Puoi creare tour e ricevere prenotazioni."
                : op.onboarding_status === "rejected"
                ? "La tua richiesta è stata rifiutata. Contatta il supporto per maggiori informazioni."
                : "Stiamo verificando il tuo profilo. Riceverai una notifica al completamento."}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`flex items-center gap-4 rounded-xl border p-5 transition-colors ${
              step.done ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              step.done
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              {step.done ? "✓" : step.num}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${step.done ? "text-green-800" : "text-[#1B2A4A]"}`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stripe Connect CTA */}
      {!op.stripe_account_id && (
        <div className="bg-[#1B2A4A] rounded-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D4A843]/20 flex items-center justify-center mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            Collega Stripe Connect
          </h2>
          <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
            Per ricevere pagamenti, devi verificare la tua identità tramite Stripe Connect.
            Il processo richiede circa 5 minuti.
          </p>
          <Link
            href="/api/stripe/connect/onboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#D4A843] px-8 py-3 text-base font-semibold text-white hover:bg-[#c09535] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.164c0 4.469 2.978 6.2 6.334 7.398 2.35.84 3.178 1.542 3.178 2.585 0 .96-.785 1.538-2.253 1.538-1.742 0-4.778-.89-6.927-2.176l-.89 5.534C5.263 23.18 8.096 24 11.52 24c2.615 0 4.694-.656 6.158-1.879 1.6-1.337 2.424-3.255 2.424-5.544 0-4.508-3.07-6.202-6.126-7.427z" />
            </svg>
            Inizia verifica Stripe
          </Link>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-cream rounded-xl p-6">
        <h3 className="font-semibold text-[#1B2A4A] mb-3">Informazioni sul tuo account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Azienda</span>
            <p className="font-medium text-[#1B2A4A]">{op.company_name}</p>
          </div>
          <div>
            <span className="text-gray-400">P.IVA</span>
            <p className="font-medium text-[#1B2A4A]">{op.vat_number}</p>
          </div>
          <div>
            <span className="text-gray-400">Email</span>
            <p className="font-medium text-[#1B2A4A]">{op.email}</p>
          </div>
          <div>
            <span className="text-gray-400">Stripe ID</span>
            <p className="font-medium text-[#1B2A4A]">{op.stripe_account_id || "Non connesso"}</p>
          </div>
          <div>
            <span className="text-gray-400">Registrato il</span>
            <p className="font-medium text-[#1B2A4A]">{new Date(op.created_at).toLocaleDateString("it-IT")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
