export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[#1B2A4A] mb-6">Impostazioni Piattaforma</h1>

      <div className="space-y-6">
        {/* Platform Fee */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1B2A4A] mb-4">Commissioni</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operatore</label>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#1B2A4A]">80</span>
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Quota operatore su ogni prenotazione</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop</label>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#D4A843]">10</span>
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Commissione shop per referral QR</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Piattaforma</label>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-green-600">10</span>
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Revenue piattaforma</p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1B2A4A] mb-4">Politica di Cancellazione</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
              <div>
                <p className="font-medium text-[#1B2A4A]">≥ 48 ore prima</p>
                <p className="text-xs text-gray-500">Cancellazione anticipata</p>
              </div>
              <span className="text-2xl font-bold text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-4">
              <div>
                <p className="font-medium text-[#1B2A4A]">24-48 ore prima</p>
                <p className="text-xs text-gray-500">Cancellazione tardiva</p>
              </div>
              <span className="text-2xl font-bold text-yellow-600">50%</span>
            </div>
            <div className="flex items-center justify-between bg-red-50 rounded-lg p-4">
              <div>
                <p className="font-medium text-[#1B2A4A]">&lt; 24 ore</p>
                <p className="text-xs text-gray-500">Ultima ora</p>
              </div>
              <span className="text-2xl font-bold text-red-600">0%</span>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1B2A4A] mb-4">Integrazioni</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Stripe Connect", status: "Attivo", icon: "💳", desc: "Direct Charges + Split pagamenti" },
              { name: "Supabase", status: "Attivo", icon: "🟢", desc: "Database + Auth + Storage" },
              { name: "Resend", status: process.env.RESEND_API_KEY ? "Attivo" : "Da configurare", icon: "📧", desc: "Email transazionali" },
              { name: "Vercel", status: "Attivo", icon: "▲", desc: "Hosting + CDN + Edge Functions" },
            ].map((int) => (
              <div key={int.name} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <span className="text-2xl">{int.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1B2A4A]">{int.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      int.status === "Attivo" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {int.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{int.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1B2A4A] mb-4">Ambiente</h2>
          <div className="space-y-2 text-sm font-mono">
            {[
              { key: "NEXT_PUBLIC_SUPABASE_URL", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
              { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
              { key: "SUPABASE_SERVICE_ROLE_KEY", set: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
              { key: "STRIPE_SECRET_KEY", set: !!process.env.STRIPE_SECRET_KEY },
              { key: "STRIPE_WEBHOOK_SECRET", set: !!process.env.STRIPE_WEBHOOK_SECRET },
              { key: "RESEND_API_KEY", set: !!process.env.RESEND_API_KEY },
            ].map((env) => (
              <div key={env.key} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span className="text-gray-700">{env.key}</span>
                <span className={`text-xs font-medium ${env.set ? "text-green-600" : "text-red-500"}`}>
                  {env.set ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
