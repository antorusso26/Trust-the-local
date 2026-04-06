export const metadata = {
  title: "Termini e Condizioni | Trust the Local",
  description: "Termini e condizioni d'uso della piattaforma Trust the Local per tour ed esperienze in Costiera Amalfitana.",
};

export default function TerminiPage() {
  return (
    <div>
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 to-navy" />
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">Documenti legali</span>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white">Termini e Condizioni</h1>
          <p className="mt-3 text-gray-300">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</p>
        </div>
      </section>

      <div className="maiolica-band" />

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 prose prose-gray">
          <h2 className="font-heading text-xl font-bold text-navy">1. Definizioni</h2>
          <ul className="text-warm-gray space-y-2">
            <li><strong>&quot;Piattaforma&quot;</strong>: il sito web trustthelocal.it e i relativi servizi</li>
            <li><strong>&quot;Operatore&quot;</strong>: il fornitore di tour ed esperienze registrato sulla piattaforma</li>
            <li><strong>&quot;Turista&quot;</strong>: l&apos;utente che prenota un&apos;esperienza</li>
            <li><strong>&quot;Shop&quot;</strong>: l&apos;esercizio commerciale che espone il QR code</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">2. Oggetto del Servizio</h2>
          <p className="text-warm-gray leading-relaxed">
            Trust the Local è un marketplace che facilita la connessione tra turisti e operatori turistici della
            Costiera Amalfitana. La piattaforma non è un tour operator e non eroga direttamente i servizi turistici.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">3. Prenotazione e Pagamento</h2>
          <ul className="text-warm-gray space-y-2">
            <li>La prenotazione è confermata solo dopo il pagamento completo</li>
            <li>I pagamenti sono elaborati tramite Stripe in modo sicuro</li>
            <li>Il prezzo indicato è comprensivo di tutte le tasse applicabili</li>
            <li>La piattaforma trattiene una commissione di servizio inclusa nel prezzo</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">4. Politica di Cancellazione</h2>
          <div className="bg-cream rounded-xl p-6 my-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-warm-gray">≥ 48 ore prima dell&apos;esperienza</span>
                <span className="font-bold text-green-600">Rimborso 100%</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-warm-gray">Tra 48 e 24 ore prima</span>
                <span className="font-bold text-yellow-600">Rimborso 50%</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-warm-gray">Meno di 24 ore prima</span>
                <span className="font-bold text-red-600">Nessun rimborso</span>
              </div>
            </div>
          </div>
          <p className="text-warm-gray leading-relaxed">
            Le cancellazioni possono essere effettuate tramite il link nell&apos;email di conferma o dalla dashboard del turista.
            I rimborsi vengono elaborati entro 5-10 giorni lavorativi.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">5. Obblighi dell&apos;Operatore</h2>
          <ul className="text-warm-gray space-y-2">
            <li>Fornire informazioni accurate sui tour offerti</li>
            <li>Mantenere aggiornata la disponibilità</li>
            <li>Garantire la sicurezza dei partecipanti</li>
            <li>Possedere tutte le licenze e assicurazioni necessarie</li>
            <li>Completare la verifica dell&apos;identità (KYC) tramite Stripe Connect</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">6. Obblighi del Turista</h2>
          <ul className="text-warm-gray space-y-2">
            <li>Fornire dati veritieri al momento della prenotazione</li>
            <li>Presentarsi puntualmente al punto d&apos;incontro</li>
            <li>Seguire le istruzioni dell&apos;operatore durante l&apos;esperienza</li>
            <li>Rispettare l&apos;ambiente e le comunità locali</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">7. Limitazione di Responsabilità</h2>
          <p className="text-warm-gray leading-relaxed">
            Trust the Local agisce come intermediario tecnologico. Non è responsabile per l&apos;esecuzione dei
            servizi turistici. In caso di problemi con un&apos;esperienza, l&apos;utente deve contattare direttamente l&apos;operatore.
            La piattaforma si impegna a mediare eventuali controversie.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">8. Proprietà Intellettuale</h2>
          <p className="text-warm-gray leading-relaxed">
            Tutti i contenuti della piattaforma (testi, immagini, design, codice) sono di proprietà di Trust the Local
            e protetti dalla legge sul diritto d&apos;autore. È vietata la riproduzione senza autorizzazione.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">9. Legge Applicabile</h2>
          <p className="text-warm-gray leading-relaxed">
            I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Salerno.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">10. Contatti</h2>
          <p className="text-warm-gray leading-relaxed">
            Per domande sui presenti termini: <strong>info@trustthelocal.it</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
