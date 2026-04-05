import { StarRating } from "./StarRating";

interface Review {
  id: string;
  tourist_name: string;
  rating: number;
  comment?: string;
  operator_reply?: string;
  operator_replied_at?: string;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.created_at).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {review.tourist_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm">{review.tourist_name}</p>
            <p className="text-gray-400 text-xs">{date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      )}

      {review.operator_reply && (
        <div className="bg-[#FBF8F1] border-l-4 border-[#D4A843] pl-4 py-3 rounded-r-xl">
          <p className="text-xs font-semibold text-[#D4A843] mb-1">Risposta dell&apos;operatore</p>
          <p className="text-gray-700 text-sm">{review.operator_reply}</p>
        </div>
      )}
    </div>
  );
}
