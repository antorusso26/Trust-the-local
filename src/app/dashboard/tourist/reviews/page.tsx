export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { ReviewCard } from "@/components/review/ReviewCard";
import { Star } from "lucide-react";
import Link from "next/link";

export default async function TouristReviewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: reviews } = await db
    .from("reviews")
    .select("id, tourist_name, rating, comment, operator_reply, operator_replied_at, created_at, tours!inner(id, title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type ReviewRow = {
    id: string;
    tourist_name: string;
    rating: number;
    comment?: string;
    operator_reply?: string;
    operator_replied_at?: string;
    created_at: string;
    tours: { id: string; title: string };
  };

  const allReviews = (reviews || []) as unknown as ReviewRow[];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Le Mie Recensioni</h1>
        <p className="text-gray-500 mt-1">Le recensioni che hai lasciato</p>
      </div>

      {allReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Non hai ancora scritto recensioni</p>
          <p className="text-gray-400 text-sm mt-2">Dopo aver completato un tour, potrai lasciare la tua opinione</p>
          <Link href="/esperienze" className="mt-6 inline-block bg-[#D4A843] text-white px-8 py-3 rounded-full font-medium">
            Esplora le esperienze
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allReviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <Link href={`/tour/${review.tours.id}`} className="text-xs text-[#D4A843] font-medium hover:underline px-1">
                Tour: {review.tours.title}
              </Link>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
