import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shop_id");
  const shopSlug = searchParams.get("slug");
  const format = searchParams.get("format") || "png"; // png or svg

  if (!shopId && !shopSlug) {
    return NextResponse.json({ error: "shop_id or slug required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trustthelocal.it";
  const trackingUrl = `${baseUrl}/?shop=${shopSlug || shopId}`;

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(trackingUrl, {
        type: "svg",
        width: 400,
        margin: 2,
        color: {
          dark: "#1B2A4A",
          light: "#FFFFFF",
        },
      });

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="trustthelocal-qr-${shopSlug || shopId}.svg"`,
        },
      });
    }

    // PNG
    const pngBuffer = await QRCode.toBuffer(trackingUrl, {
      type: "png",
      width: 800,
      margin: 2,
      color: {
        dark: "#1B2A4A",
        light: "#FFFFFF",
      },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="trustthelocal-qr-${shopSlug || shopId}.png"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
