import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function FavoritesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();
  const { data: favorites } = await db
    .from("favorites")
    .select("tour_id, created_at, tours!inner(id, title, image_url, price_cents, currency, duration_minutes, category, operators!inner(company_name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Tour Salvati</h1>
          <p className="text-gray-500 mt-0.5">Le esperienze che hai messo nel cuore</p>
        </div>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Non hai ancora salvato nessun tour</p>
          <p className="text-gray-400 text-sm mt-2">Clicca sul cuore per salvare le esperienze che ti piacciono</p>
          <Link href="/esperienze" className="mt-6 inline-block bg-[#D4A843] text-white px-8 py-3 rounded-full font-medium">
            Esplora le esperienze
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(favorites as unknown as Array<{ tour_id: string; tours: { id: string; title: string; image_url?: string; price_cents: number; currency: string; duration_minutes?: number; category?: string; operators: { company_name: string } } }>).map((fav) => {
            const tour = fav.tours as { id: string; title: string; image_url?: string; price_cents: number; currency: string; duration_minutes?: number; category?: string; operators: { company_name: string } };
            return (
              <Link key={fav.tour_id} href={`/tour/${tour.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-[#1B2A4A] to-[#2d4070] relative">
                  {tour.image_url && (
                    <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-[#D4A843] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {formatEur(tour.price_cents)} / persona
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1B2A4A] group-hover:text-[#D4A843] transition-colors">{tour.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{tour.operators.company_name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
