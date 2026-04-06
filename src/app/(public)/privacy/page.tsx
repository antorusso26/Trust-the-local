export const metadata = {
  title: "Privacy Policy | Trust the Local",
  description: "Informativa sulla privacy di Trust the Local. Come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.",
};

export default function PrivacyPage() {
  return (
    <div>
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 to-navy" />
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">Documenti legali</span>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-3 text-gray-300">Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</p>
        </div>
      </section>

      <div className="maiolica-band" />

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 prose prose-gray">
          <h2 className="font-heading text-xl font-bold text-navy">1. Titolare del Trattamento</h2>
          <p className="text-warm-gray leading-relaxed">
            Il titolare del trattamento dei dati personali è Trust the Local, con sede in Costiera Amalfitana, Italia.
            Per qualsiasi domanda relativa al trattamento dei dati, contattare: <strong>privacy@trustthelocal.it</strong>
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">2. Dati Raccolti</h2>
          <p className="text-warm-gray leading-relaxed">Raccogliamo le seguenti categorie di dati:</p>
          <ul className="text-warm-gray space-y-2">
            <li><strong>Dati di identificazione:</strong> nome, cognome, indirizzo email, numero di telefono (opzionale)</li>
            <li><strong>Dati di pagamento:</strong> elaborati tramite Stripe (non conserviamo dati carta di credito)</li>
            <li><strong>Dati di navigazione:</strong> indirizzo IP (hashato), user agent, pagine visitate</li>
            <li><strong>Dati di prenotazione:</strong> date, tour selezionati, preferenze</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">3. Finalità del Trattamento</h2>
          <ul className="text-warm-gray space-y-2">
            <li>Gestione delle prenotazioni e dei pagamenti</li>
            <li>Comunicazioni transazionali (conferme, promemoria, cancellazioni)</li>
            <li>Miglioramento del servizio e analisi aggregate</li>
            <li>Adempimento degli obblighi di legge</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">4. Base Giuridica</h2>
          <p className="text-warm-gray leading-relaxed">
            Il trattamento dei dati si basa su: esecuzione del contratto (prenotazione), consenso dell&apos;utente,
            legittimo interesse del titolare e adempimento di obblighi legali (GDPR Art. 6).
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">5. Condivisione dei Dati</h2>
          <p className="text-warm-gray leading-relaxed">I dati possono essere condivisi con:</p>
          <ul className="text-warm-gray space-y-2">
            <li><strong>Operatori turistici:</strong> nome ed email per gestire la prenotazione</li>
            <li><strong>Stripe:</strong> per l&apos;elaborazione dei pagamenti</li>
            <li><strong>Supabase:</strong> per l&apos;hosting del database</li>
            <li><strong>Resend:</strong> per l&apos;invio delle email transazionali</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">6. Conservazione dei Dati</h2>
          <p className="text-warm-gray leading-relaxed">
            I dati personali sono conservati per il tempo necessario alle finalità per cui sono stati raccolti,
            e comunque non oltre 5 anni dall&apos;ultima interazione. I dati contabili sono conservati per 10 anni.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">7. Diritti dell&apos;Utente</h2>
          <p className="text-warm-gray leading-relaxed">Ai sensi del GDPR, hai diritto a:</p>
          <ul className="text-warm-gray space-y-2">
            <li>Accedere ai tuoi dati personali</li>
            <li>Rettificare dati inesatti</li>
            <li>Richiedere la cancellazione dei dati</li>
            <li>Opporti al trattamento</li>
            <li>Portabilità dei dati</li>
            <li>Revocare il consenso in qualsiasi momento</li>
          </ul>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">8. Cookie</h2>
          <p className="text-warm-gray leading-relaxed">
            Utilizziamo esclusivamente cookie tecnici necessari al funzionamento del servizio (sessione, preferenza lingua).
            Non utilizziamo cookie di profilazione o di terze parti per finalità pubblicitarie.
          </p>

          <h2 className="font-heading text-xl font-bold text-navy mt-8">9. Contatti</h2>
          <p className="text-warm-gray leading-relaxed">
            Per esercitare i tuoi diritti o per qualsiasi domanda: <strong>privacy@trustthelocal.it</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
