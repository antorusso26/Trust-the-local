import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createAuthClient } from "@/lib/supabase/server";

// POST /api/tours/[id]/images - Upload image for tour
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = createServiceRoleClient();

  // Verify ownership
  const { data: tour } = await db
    .from("tours")
    .select("operator_id, operators!inner(user_id)")
    .eq("id", id)
    .single();

  if (!tour || (tour.operators as unknown as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  // Check image count limit (max 5)
  const { count } = await db
    .from("tour_images")
    .select("id", { count: "exact", head: true })
    .eq("tour_id", id);

  if ((count || 0) >= 5) {
    return NextResponse.json({ error: "Massimo 5 foto per tour" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Nessun file fornito" }, { status: 400 });
  }

  // Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG o WebP" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File troppo grande. Max 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `tours/${id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await db.storage
    .from("tour-images")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: `Upload fallito: ${uploadError.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = db.storage
    .from("tour-images")
    .getPublicUrl(storagePath);

  // Save to tour_images table
  const { data: image, error: dbError } = await db
    .from("tour_images")
    .insert({
      tour_id: id,
      image_url: publicUrl,
      storage_path: storagePath,
      sort_order: (count || 0),
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Set as main image if first upload
  if ((count || 0) === 0) {
    await db.from("tours").update({ image_url: publicUrl }).eq("id", id);
  }

  return NextResponse.json({ image }, { status: 201 });
}

// DELETE /api/tours/[id]/images - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const db = createServiceRoleClient();
  const { imageId } = await request.json();

  const { data: image } = await db
    .from("tour_images")
    .select("storage_path")
    .eq("id", imageId)
    .eq("tour_id", id)
    .single();

  if (!image) {
    return NextResponse.json({ error: "Immagine non trovata" }, { status: 404 });
  }

  // Delete from storage
  await db.storage.from("tour-images").remove([image.storage_path]);

  // Delete from DB
  await db.from("tour_images").delete().eq("id", imageId);

  return NextResponse.json({ success: true });
}
