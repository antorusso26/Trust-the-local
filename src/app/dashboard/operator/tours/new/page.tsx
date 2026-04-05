import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TourForm } from "../TourForm";

export default async function NewTourPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Crea Nuovo Tour</h1>
        <p className="text-gray-500 mt-1">Aggiungi una nuova esperienza al tuo catalogo</p>
      </div>
      <TourForm />
    </div>
  );
}
