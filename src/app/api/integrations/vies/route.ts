import { NextRequest, NextResponse } from "next/server";
import { validateVAT } from "@/lib/integrations/vies";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * POST /api/integrations/vies
 * Validate a European VAT number via VIES.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vatNumber, countryCode } = body;

    if (!vatNumber) {
      return NextResponse.json({ error: "Missing vatNumber" }, { status: 400 });
    }

    const result = await validateVAT(vatNumber, countryCode || "IT");

    await auditLog({
      eventType: result.valid ? "vies.validation_success" : "vies.validation_failed",
      actorType: "operator",
      metadata: {
        vat_number: `${result.countryCode}${result.vatNumber}`,
        valid: result.valid,
        company_name: result.name,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[VIES_ERROR]", error);
    await auditLog({
      eventType: "vies.validation_error",
      actorType: "system",
      metadata: { error: error instanceof Error ? error.message : "Unknown" },
      ipAddress: getClientIp(request),
    });
    return NextResponse.json(
      { error: "VAT validation service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
