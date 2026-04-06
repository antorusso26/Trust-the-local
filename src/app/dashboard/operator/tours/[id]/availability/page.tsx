export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvailabilityCalendar } from "@/components/tour/AvailabilityCalendar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AvailabilityPageProps {
  params: Promise<{ id: string }>;
}

export default async function AvailabilityPage({ params }: AvailabilityPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify tour ownership
  const { data: tour } = await supabase
    .from("tours")
    .select("id, title, operator_id")
    .eq("id", id)
    .single();

  if (!tour) redirect("/dashboard/operator/tours");

  // Verify ownership via operator
  const { data: operator } = await supabase
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!operator || operator.id !== tour.operator_id) redirect("/dashboard/operator/tours");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/operator/tours"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1B2A4A]">Disponibilità</h1>
          <p className="text-sm text-gray-500">{tour.title}</p>
        </div>
      </div>

      <AvailabilityCalendar tourId={id} />
    </div>
  );
}
