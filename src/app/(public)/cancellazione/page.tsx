import Link from "next/link";

export const metadata = {
  title: "Politica di Cancellazione | Trust the Local",
  description: "Politica di cancellazione e rimborso per le prenotazioni su Trust the Local.",
};

export default function CancellazionePage() {
  return (
    <div>
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 to-navy" />
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">Per i turisti</span>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white">Politica di Cancellazione</h1>
        </div>
      </section>

      <div className="maiolica-band" />

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Policy Cards */}
          <div className="space-y-4 mb-12">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-green-800">Cancellazione fino a 48h prima</h2>
                  <p className="text-green-700 mt-1">Rimborso completo del 100% dell&apos;importo pagato</p>
                </div>
                <span className="text-4xl font-heading font-bold text-green-600">100%</span>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl">⚠️</div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-yellow-800">Cancellazione tra 48h e 24h prima</h2>
                  <p className="text-yellow-700 mt-1">Rimborso parziale del 50% dell&apos;importo pagato</p>
                </div>
                <span className="text-4xl font-heading font-bold text-yellow-600">50%</span>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">❌</div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-red-800">Meno di 24h prima</h2>
                  <p className="text-red-700 mt-1">Nessun rimborso disponibile</p>
                </div>
                <span className="text-4xl font-heading font-bold text-red-600">0%</span>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="font-heading text-2xl font-bold text-navy mb-6">Domande frequenti</h2>
          <div className="space-y-4">
            {[
              {
                q: "Come posso cancellare una prenotazione?",
                a: "Puoi cancellare dalla tua dashboard turista o dal link nell'email di conferma. Il sistema calcolerà automaticamente il rimborso in base alla politica."
              },
              {
                q: "Quanto tempo ci vuole per ricevere il rimborso?",
                a: "Il rimborso viene elaborato immediatamente tramite Stripe. A seconda della tua banca, potrebbe impiegare 5-10 giorni lavorativi per apparire sul tuo conto."
              },
              {
                q: "Posso modificare la data della prenotazione?",
                a: "Al momento non è possibile modificare la data. Puoi cancellare e riprenotare. Se cancelli entro 48h dalla data originale, riceverai il rimborso completo."
              },
              {
                q: "Cosa succede in caso di maltempo?",
                a: "Se l'operatore cancella l'esperienza per maltempo, riceverai un rimborso completo del 100% indipendentemente dalla tempistica."
              },
              {
                q: "Posso cancellare solo per alcuni partecipanti?",
                a: "No, la cancellazione si applica all'intera prenotazione. Per ridurre il numero di partecipanti, contatta direttamente l'operatore."
              },
            ].map((faq, i) => (
              <div key={i} className="bg-cream rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-navy mb-2">{faq.q}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-navy rounded-2xl p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-white mb-3">Hai bisogno di aiuto?</h2>
            <p className="text-gray-300 mb-4">Contattaci per qualsiasi domanda sulle cancellazioni</p>
            <Link
              href="mailto:info@trustthelocal.it"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-semibold text-white hover:bg-gold-dark transition-colors"
            >
              Contattaci
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
