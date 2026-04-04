import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateQrPng, generateQrSvg, generateQrDataUrl } from "@/lib/qr";

/**
 * GET /api/shops/qr?shopId=xxx&format=png|svg|dataurl
 * Generate a QR code for a shop.
 * Default format: PNG (high-res for printing).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId");
  const format = searchParams.get("format") || "png";

  if (!shopId) {
    return NextResponse.json({ error: "Missing shopId parameter" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Verify shop exists
  const { data: shop, error } = await supabase
    .from("shops")
    .select("id, name, qr_code_id")
    .eq("id", shopId)
    .single();

  if (error || !shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  try {
    switch (format) {
      case "svg": {
        const svg = await generateQrSvg(shop.qr_code_id);
        return new NextResponse(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Content-Disposition": `attachment; filename="qr-${shop.name.replace(/\s+/g, "-")}.svg"`,
          },
        });
      }
      case "dataurl": {
        const dataUrl = await generateQrDataUrl(shop.qr_code_id);
        return NextResponse.json({ dataUrl, shopName: shop.name, qrCodeId: shop.qr_code_id });
      }
      case "png":
      default: {
        const png = await generateQrPng(shop.qr_code_id);
        return new NextResponse(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `attachment; filename="qr-${shop.name.replace(/\s+/g, "-")}.png"`,
          },
        });
      }
    }
  } catch (error) {
    console.error("[QR_GENERATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
