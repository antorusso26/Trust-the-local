import { createServiceRoleClient } from "@/lib/supabase/server";
import { TourGrid } from "@/components/tour/TourGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trust the Local - Esperienze autentiche in Costiera Amalfitana",
  description: "Scopri e prenota tour ed esperienze locali a Sorrento e in Costiera Amalfitana. Attività verificate, prenotazione immediata.",
};

export default async function HomePage() {
  const supabase = createServiceRoleClient();

  // Try with category first, fallback without it if column doesn't exist yet
  let tours: unknown[] | null = null;
  const { data: toursData, error: toursError } = await supabase
    .from("tours")
    .select(`
      id,
      title,
      description,
      image_url,
      price_cents,
      currency,
      duration_minutes,
      category,
      price_type,
      operators!inner(company_name)
    `)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (toursError) {
    // Fallback: category column may not exist yet
    const { data: fallbackData } = await supabase
      .from("tours")
      .select(`
        id,
        title,
        description,
        image_url,
        price_cents,
        currency,
        duration_minutes,
        operators!inner(company_name)
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6);
    tours = fallbackData;
  } else {
    tours = toursData;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-navy overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80"
            alt="Costiera Amalfitana"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/80" />
        </div>

        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">
              Costiera Amalfitana
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] max-w-3xl">
            Scopri l&apos;Anima
            <br />
            <span className="text-gold">della Costiera</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
            Esperienze indimenticabili tra limoni profumati, maioliche colorate e il mare pi&ugrave; blu d&apos;Italia. Con guide locali vere.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/esperienze"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-gold-dark transition-colors"
            >
              Esplora le Esperienze
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Le Mie Prenotazioni
            </Link>
          </div>
        </div>
      </section>

      {/* Maiolica Band */}
      <div className="maiolica-band" />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
          <span className="section-label">Cosa vuoi vivere</span>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
            Le Nostre Categorie
          </h2>
          <div className="gold-divider" />

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "⭐", name: "Tour Guidati", slug: "tour", count: "4 esperienze", color: "bg-blue-50 text-blue-600" },
              { icon: "🚤", name: "Gite in Barca", slug: "barca", count: "4 esperienze", color: "bg-teal-50 text-teal-600" },
              { icon: "🎭", name: "Esperienze", slug: "esperienze", count: "4 esperienze", color: "bg-orange-50 text-orange-600" },
              { icon: "🍋", name: "Food & Limoncello", slug: "food", count: "4 esperienze", color: "bg-yellow-50 text-yellow-600" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/esperienze?categoria=${cat.slug}`}
                className="group rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${cat.color} text-2xl mb-3`}>
                  {cat.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-navy">{cat.name}</h3>
                <p className="mt-1 text-sm text-warm-gray">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section id="esperienze" className="py-16 bg-cream">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="section-label">Le pi&ugrave; amate</span>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
              Esperienze in Primo Piano
            </h2>
            <div className="gold-divider" />
          </div>

          <TourGrid tours={((tours || []) as unknown[]) as Array<{
            id: string;
            title: string;
            description: string | null;
            image_url: string | null;
            price_cents: number;
            currency: string;
            duration_minutes: number | null;
            category: string;
            operators: { company_name: string };
          }>} />

          <div className="mt-10 text-center">
            <a
              href="/esperienze"
              className="inline-flex items-center gap-2 rounded-full border-2 border-navy px-8 py-3 text-base font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Vedi Tutte le Esperienze
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Why Trust the Local */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
          <span className="section-label">Il nostro impegno</span>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-navy">
            Perch&eacute; Trust the Local
          </h2>
          <div className="gold-divider" />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Guide Locali Esperte",
                desc: "Guide autentiche della costiera che conoscono ogni sentiero, ogni caletta, ogni storia del territorio.",
                color: "bg-navy text-white",
              },
              {
                icon: (
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
                  </svg>
                ),
                title: "Esperienze Autentiche",
                desc: "Vivi la Costiera come un locale. Lontano dai percorsi turistici, immerso nella vera dolce vita.",
                color: "bg-gold text-white",
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Prenotazione Sicura",
                desc: "Pagamento sicuro e cancellazione gratuita fino a 48 ore prima. Zero rischi, zero stress.",
                color: "bg-teal-600 text-white",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${item.color} mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-heading text-xl font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-warm-gray leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-navy py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
            🍋 La dolce vita
            <br />
            <span className="text-gold">inizia adesso</span>
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            Prenota la tua esperienza in Costiera Amalfitana oggi. Cancellazione gratuita fino a 48h prima.
          </p>
          <a
            href="/esperienze"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-10 py-4 text-base font-semibold text-white shadow-lg hover:bg-gold-dark transition-colors"
          >
            Inizia a Esplorare
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
