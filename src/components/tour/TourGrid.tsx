import { TourCard } from "./TourCard";

interface Tour {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  currency: string;
  duration_minutes: number | null;
  category?: string;
  operators: {
    company_name: string;
  };
}

interface TourGridProps {
  tours: Tour[];
}

export function TourGrid({ tours }: TourGridProps) {
  if (tours.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-bg mb-4">
          <svg className="h-10 w-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-lg font-heading font-semibold text-navy">Nessun tour disponibile al momento.</p>
        <p className="mt-1 text-sm text-warm-gray">Torna a trovarci presto!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          id={tour.id}
          title={tour.title}
          description={tour.description}
          imageUrl={tour.image_url}
          priceCents={tour.price_cents}
          currency={tour.currency}
          durationMinutes={tour.duration_minutes}
          operatorName={tour.operators.company_name}
          category={tour.category}
        />
      ))}
    </div>
  );
}
