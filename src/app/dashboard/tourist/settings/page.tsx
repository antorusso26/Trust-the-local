import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { TouristSettingsForm } from "./TouristSettingsForm";

export const dynamic = "force-dynamic";

export default async function TouristSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceRoleClient();
  const { data: profile } = await db
    .from("tourist_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Impostazioni Profilo</h1>
        <p className="text-gray-500 mt-1">Aggiorna i tuoi dati personali</p>
      </div>
      <TouristSettingsForm profile={profile} userId={user.id} email={user.email || ""} />
    </div>
  );
}
