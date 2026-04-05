export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Plus, Eye, EyeOff, Edit } from "lucide-react";

function formatEur(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

const categoryLabels: Record<string, string> = {
  tour: "Tour", barca: "Barca", food: "Food & Wine", esperienze: "Esperienza",
};

const categoryColors: Record<string, string> = {
  tour: "bg-blue-100 text-blue-800",
  barca: "bg-teal-100 text-teal-800",
  food: "bg-amber-100 text-amber-800",
  esperienze: "bg-purple-100 text-purple-800",
};

export default async function OperatorToursPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: operator } = await db
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!operator) redirect("/dashboard/operator");

  const { data: tours } = await db
    .from("tours")
    .select("*, tour_images(id, image_url, sort_order)")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">I Miei Tour</h1>
          <p className="text-gray-500 mt-1">{(tours || []).length} esperienze nel catalogo</p>
        </div>
        <Link
          href="/dashboard/operator/tours/new"
          className="flex items-center gap-2 bg-[#D4A843] hover:bg-[#c49938] text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo Tour
        </Link>
      </div>

      {!tours || tours.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">⛵</div>
          <p className="text-gray-500 text-lg">Nessun tour ancora</p>
          <p className="text-gray-400 text-sm mt-2">Crea il tuo primo tour e inizia a ricevere prenotazioni</p>
          <Link href="/dashboard/operator/tours/new" className="mt-6 inline-flex items-center gap-2 bg-[#D4A843] text-white px-6 py-3 rounded-full font-medium">
            <Plus className="w-4 h-4" /> Crea Tour
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(tours as unknown as Array<{ id: string; title: string; category: string; price_cents: number; duration_minutes?: number; image_url?: string; active: boolean; tour_images: Array<{ image_url: string; sort_order: number }> }>).map((tour) => {
            const images = (tour.tour_images as Array<{ image_url: string; sort_order: number }> || []).sort((a, b) => a.sort_order - b.sort_order);
            const mainImage = images[0]?.image_url || tour.image_url;

            return (
              <div key={tour.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">
                <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#1B2A4A] to-[#2d4070]">
                  {mainImage && <img src={mainImage} alt={tour.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1B2A4A] truncate">{tour.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[tour.category] || "bg-gray-100 text-gray-700"}`}>
                      {categoryLabels[tour.category] || tour.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-[#D4A843]">{formatEur(tour.price_cents)}</span>
                    {tour.duration_minutes && <span>{Math.floor(tour.duration_minutes / 60)}h {tour.duration_minutes % 60 > 0 ? `${tour.duration_minutes % 60}min` : ""}</span>}
                    <span>{images.length} foto</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${tour.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {tour.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {tour.active ? "Attivo" : "Bozza"}
                  </span>
                  <Link
                    href={`/dashboard/operator/tours/${tour.id}`}
                    className="flex items-center gap-1 text-xs bg-[#1B2A4A]/10 text-[#1B2A4A] px-3 py-1.5 rounded-full hover:bg-[#1B2A4A] hover:text-white transition-colors"
                  >
                    <Edit className="w-3 h-3" /> Modifica
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
