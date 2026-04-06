import { createServiceRoleClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { WhySection } from "@/components/home/WhySection";
import { CtaSection } from "@/components/home/CtaSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trust the Local - Esperienze autentiche in Costiera Amalfitana",
  description: "Scopri e prenota tour ed esperienze locali a Sorrento e in Costiera Amalfitana. Attività verificate, prenotazione immediata.",
};

export default async function HomePage() {
  const supabase = createServiceRoleClient();

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

  const tourList = ((tours || []) as unknown[]) as Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    price_cents: number;
    currency: string;
    duration_minutes: number | null;
    category: string;
    price_type?: string;
    operators: { company_name: string };
  }>;

  return (
    <div>
      <HeroSection />
      <div className="maiolica-band" />
      <CategoriesSection />
      <FeaturedSection tours={tourList} />
      <WhySection />
      <CtaSection />
    </div>
  );
}
