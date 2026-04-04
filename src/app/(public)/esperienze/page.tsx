import { createServiceRoleClient } from "@/lib/supabase/server";
import { TourGrid } from "@/components/tour/TourGrid";
import { CategoryFilter } from "@/components/tour/CategoryFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Le Nostre Esperienze",
  description: "Scopri tutte le esperienze autentiche della Costiera Amalfitana: tour guidati, gite in barca, food & limoncello e molto altro.",
};

interface EsperienzePageProps {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}

export default async function EsperienzePage({ searchParams }: EsperienzePageProps) {
  const { categoria, q } = await searchParams;
  const supabase = createServiceRoleClient();

  // Try with category column, fallback without it
  let tours: unknown[] | null = null;

  const selectWithCategory = `
    id,
    title,
    description,
    image_url,
    price_cents,
    currency,
    duration_minutes,
    category,
    operators!inner(company_name)
  `;
  const selectWithoutCategory = `
    id,
    title,
    description,
    image_url,
    price_cents,
    currency,
    duration_minutes,
    operators!inner(company_name)
  `;

  let query = supabase
    .from("tours")
    .select(selectWithCategory)
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Filter by category
  if (categoria && categoria !== "tutte") {
    query = query.eq("category", categoria);
  }

  // Search by title
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: toursData, error: toursError } = await query;

  if (toursError) {
    // Fallback without category column
    let fallbackQuery = supabase
      .from("tours")
      .select(selectWithoutCategory)
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (q) {
      fallbackQuery = fallbackQuery.ilike("title", `%${q}%`);
    }
    const { data: fallbackData } = await fallbackQuery;
    tours = fallbackData;
  } else {
    tours = toursData;
  }

  const tourList = ((tours || []) as unknown[]) as Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    price_cents: number;
    currency: string;
    duration_minutes: number | null;
    category?: string;
    operators: { company_name: string };
  }>;

  const categories = [
    { slug: "tutte", label: "Tutte", icon: "✨" },
    { slug: "tour", label: "Tour", icon: "⭐" },
    { slug: "barca", label: "Barca", icon: "🚤" },
    { slug: "esperienze", label: "Esperienze", icon: "🎭" },
    { slug: "food", label: "Food & Wine", icon: "🍋" },
  ];

  return (
    <div>
      {/* Header Banner */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1612698093158-e07ac200d44e?w=1600&q=80"
            alt="Costiera Amalfitana"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 to-navy/90" />
        </div>
        <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-gold">
              Costiera Amalfitana
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white leading-tight">
            Le Nostre Esperienze
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">
            Scopri tutte le esperienze autentiche della Costiera Amalfitana
          </p>
        </div>
      </section>

      {/* Maiolica Band */}
      <div className="maiolica-band" />

      {/* Filters + Content */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          {/* Search + Filter */}
          <CategoryFilter
            categories={categories}
            activeCategory={categoria || "tutte"}
            searchQuery={q || ""}
          />

          {/* Results count */}
          <p className="mt-6 mb-6 text-sm text-warm-gray">
            {tourList.length} esperienz{tourList.length === 1 ? "a" : "e"} trovat{tourList.length === 1 ? "a" : "e"}
          </p>

          {/* Tour Grid */}
          <TourGrid tours={tourList} />
        </div>
      </section>
    </div>
  );
}
