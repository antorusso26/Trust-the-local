import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createConnectedAccount, createAccountLink } from "@/lib/stripe/connect";
import { auditLog, getClientIp } from "@/lib/logger";

/**
 * POST /api/stripe/connect/onboard
 * Creates a Stripe Connected Account for an operator and returns the onboarding URL.
 * Requires authenticated operator.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    // Get operator record
    const { data: operator, error: opError } = await serviceClient
      .from("operators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (opError || !operator) {
      return NextResponse.json({ error: "Operator profile not found" }, { status: 404 });
    }

    // If already has a Stripe account, just create a new account link
    let stripeAccountId = operator.stripe_account_id;

    if (!stripeAccountId) {
      // Create new connected account
      const account = await createConnectedAccount({
        email: operator.email,
        companyName: operator.company_name,
        vatNumber: operator.vat_number,
      });

      stripeAccountId = account.id;

      // Save Stripe account ID
      await serviceClient
        .from("operators")
        .update({
          stripe_account_id: account.id,
          onboarding_status: "in_review",
        })
        .eq("id", operator.id);

      await auditLog({
        eventType: "operator.stripe_account_created",
        actorType: "operator",
        actorId: user.id,
        resourceType: "operator",
        resourceId: operator.id,
        metadata: { stripe_account_id: account.id },
        ipAddress: getClientIp(request),
      });
    }

    // Generate onboarding link (redirects to Stripe Identity/KYC)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await createAccountLink(
      stripeAccountId,
      `${appUrl}/dashboard/operator/kyc`
    );

    return NextResponse.json({
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    });
  } catch (error) {
    console.error("[CONNECT_ONBOARD_ERROR]", error);
    await auditLog({
      eventType: "operator.onboard_error",
      actorType: "system",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      ipAddress: getClientIp(request),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
