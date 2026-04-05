export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { TourForm } from "../TourForm";
import { TourImageManager } from "./TourImageManager";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTourPage({ params }: Props) {
  const { id } = await params;
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

  const { data: tour } = await db
    .from("tours")
    .select("*, tour_images(id, image_url, storage_path, sort_order)")
    .eq("id", id)
    .eq("operator_id", operator.id)
    .single();

  if (!tour) notFound();

  type TourImage = { id: string; image_url: string; storage_path: string; sort_order: number };
  const images = ((tour.tour_images as TourImage[]) || []).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/operator/tours"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Torna ai tour
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Modifica Tour</h1>
        <p className="text-gray-500 mt-1">{tour.title}</p>
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1B2A4A] mb-4">Galleria Foto</h2>
        <TourImageManager
          tourId={id}
          initialImages={images.map((img) => ({ id: img.id, image_url: img.image_url, sort_order: img.sort_order }))}
        />
      </div>

      {/* Tour Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <TourForm
          initialData={{
            id: tour.id,
            title: tour.title,
            description: tour.description || "",
            category: tour.category,
            price_cents: tour.price_cents,
            duration_minutes: tour.duration_minutes || undefined,
            max_guests: (tour as Record<string, unknown>).max_guests as number || 10,
            meeting_point: (tour as Record<string, unknown>).meeting_point as string || "",
            includes: ((tour as Record<string, unknown>).includes as string[]) || [],
            highlights: ((tour as Record<string, unknown>).highlights as string[]) || [],
            active: tour.active,
          }}
        />
      </div>
    </div>
  );
}
