import Link from "next/link";

export const metadata = {
  title: "Chi Siamo | Trust the Local",
  description: "Scopri la missione di Trust the Local: connettere i turisti con le migliori esperienze autentiche della Costiera Amalfitana.",
};

export default function ChiSiamoPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&q=80"
            alt="Costiera Amalfitana"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 to-navy/90" />
        </div>
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-24">
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">La nostra storia</span>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
            Chi Siamo
          </h1>
        </div>
      </section>

      <div className="maiolica-band" />

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">La nostra missione</h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Trust the Local nasce dall&apos;amore per la Costiera Amalfitana e dalla volontà di offrire ai visitatori
              esperienze autentiche, lontane dai classici percorsi turistici. Crediamo che il modo migliore per
              scoprire un territorio sia attraverso gli occhi di chi lo vive ogni giorno.
            </p>

            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Come funziona</h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Connettiamo turisti curiosi con operatori locali verificati. Ogni esperienza è curata nei minimi dettagli:
              dalle gite in barca lungo la costa, ai tour enogastronomici tra i limoneti, alle escursioni sui sentieri
              nascosti della costiera.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10">
              {[
                { number: "100%", label: "Guide locali verificate" },
                { number: "48h", label: "Cancellazione gratuita" },
                { number: "4", label: "Lingue supportate" },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-cream rounded-xl p-6">
                  <div className="font-heading text-3xl font-bold text-gold">{stat.number}</div>
                  <div className="text-sm text-warm-gray mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Il nostro modello</h2>
            <p className="text-warm-gray leading-relaxed mb-6">
              Collaboriamo con negozi, bar, ristoranti e hotel della Costiera che espongono il nostro QR code.
              I turisti scansionano e scoprono le esperienze disponibili. Un modello win-win: i negozi guadagnano
              una commissione, gli operatori ricevono prenotazioni qualificate, e i turisti vivono esperienze indimenticabili.
            </p>

            <h2 className="font-heading text-2xl font-bold text-navy mb-4">I nostri valori</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "🌊", title: "Autenticità", desc: "Solo esperienze genuine, mai turistiche" },
                { icon: "🤝", title: "Fiducia", desc: "Guide verificate, pagamenti sicuri" },
                { icon: "🌍", title: "Sostenibilità", desc: "Turismo responsabile e rispettoso" },
                { icon: "❤️", title: "Passione", desc: "Amore per il territorio e le sue tradizioni" },
              ].map((value) => (
                <div key={value.title} className="flex gap-3 bg-cream rounded-xl p-5">
                  <span className="text-2xl">{value.icon}</span>
                  <div>
                    <h3 className="font-semibold text-navy">{value.title}</h3>
                    <p className="text-sm text-warm-gray">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy rounded-2xl p-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-white mb-3">Diventa un operatore</h2>
              <p className="text-gray-300 mb-6">Sei un operatore turistico della Costiera? Unisciti a noi e raggiungi nuovi clienti.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-semibold text-white hover:bg-gold-dark transition-colors"
              >
                Registrati come Operatore
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
