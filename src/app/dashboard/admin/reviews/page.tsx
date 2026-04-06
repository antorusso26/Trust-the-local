export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { AdminActionButton } from "@/components/dashboard/AdminActionButton";

export default async function AdminReviewsPage() {
  const supabase = createServiceRoleClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      tourist_name,
      tourist_email,
      rating,
      comment,
      operator_reply,
      published,
      created_at,
      tours!inner(title),
      bookings!inner(id)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  type Review = {
    id: string;
    tourist_name: string;
    tourist_email: string;
    rating: number;
    comment: string | null;
    operator_reply: string | null;
    published: boolean;
    created_at: string;
    tours: { title: string };
    bookings: { id: string };
  };

  const reviewList = ((reviews || []) as unknown as Review[]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1B2A4A]">Moderazione Recensioni</h1>
          <p className="text-sm text-gray-500 mt-1">{reviewList.length} recensioni</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviewList.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-xl border p-5 transition-colors ${
              review.published ? "border-gray-200" : "border-red-200 bg-red-50/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-sm">
                    {review.tourist_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A] text-sm">{review.tourist_name}</h3>
                    <p className="text-xs text-gray-400">{review.tourist_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={`w-4 h-4 ${s <= review.rating ? "text-[#D4A843]" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    per <span className="font-medium text-[#1B2A4A]">{review.tours.title}</span>
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                )}

                {review.operator_reply && (
                  <div className="bg-amber-50 border-l-2 border-[#D4A843] rounded-r-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-[#D4A843] mb-1">Risposta operatore</p>
                    <p className="text-sm text-gray-700">{review.operator_reply}</p>
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0 space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  review.published ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {review.published ? "Pubblicata" : "Nascosta"}
                </span>
                <p className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("it-IT")}
                </p>
                <div className="pt-1">
                  {review.published ? (
                    <AdminActionButton targetId={review.id} targetType="review" action="hide" label="Nascondi" color="red" />
                  ) : (
                    <AdminActionButton targetId={review.id} targetType="review" action="show" label="Pubblica" color="green" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {reviewList.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Nessuna recensione
          </div>
        )}
      </div>
    </div>
  );
}
