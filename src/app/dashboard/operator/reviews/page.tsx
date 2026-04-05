export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { ReviewCard } from "@/components/review/ReviewCard";
import { Star } from "lucide-react";

export default async function OperatorReviewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();

  const { data: operator } = await db.from("operators").select("id").eq("user_id", user.id).single();
  if (!operator) redirect("/dashboard/operator");

  const { data: tours } = await db.from("tours").select("id").eq("operator_id", operator.id);
  const tourIds = (tours || []).map((t: { id: string }) => t.id);

  let reviews: Array<{ id: string; tourist_name: string; rating: number; comment?: string; operator_reply?: string; created_at: string; tours: { title: string } }> = [];

  if (tourIds.length > 0) {
    const { data } = await db
      .from("reviews")
      .select("*, tours!inner(title)")
      .in("tour_id", tourIds)
      .order("created_at", { ascending: false });
    reviews = (data || []) as typeof reviews;
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Recensioni</h1>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-5 h-5 text-[#D4A843] fill-[#D4A843]" />
            <span className="font-bold text-[#1B2A4A]">{avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({reviews.length} recensioni)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">Nessuna recensione ancora</p>
          <p className="text-gray-400 text-sm mt-1">Le recensioni appariranno qui dopo che i turisti hanno completato un tour</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <p className="text-xs text-gray-400 px-1">Tour: <span className="font-medium text-gray-600">{review.tours.title}</span></p>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
