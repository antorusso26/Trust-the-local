import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * GET /api/shops
 * List all active shops (admin only).
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ shops: data });
  } catch (error) {
    console.error("[SHOPS_LIST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/shops
 * Create a new affiliated shop (admin action).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, partitaIva, email, phone, iban, address, splitPercentage } = body;

    if (!name || !partitaIva || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name, partitaIva, email" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: shop, error } = await supabase
      .from("shops")
      .insert({
        name,
        partita_iva: partitaIva,
        email,
        phone: phone || null,
        iban: iban || null,
        address: address || null,
        split_percentage_default: splitPercentage || 10.0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Shop with this P.IVA already exists" }, { status: 409 });
      }
      throw error;
    }

    await auditLog({
      eventType: "shop.created",
      actorType: "admin",
      resourceType: "shop",
      resourceId: shop.id,
      metadata: { name, partita_iva: partitaIva },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ shop }, { status: 201 });
  } catch (error) {
    console.error("[SHOP_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
