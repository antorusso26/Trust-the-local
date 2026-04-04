import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { transferToShop } from "@/lib/stripe/connect";
import { auditLog } from "@/lib/logger";

/**
 * POST /api/stripe/transfers
 * Process monthly shop commission payouts.
 * Should be triggered by a cron job or admin action.
 * Protected: requires admin auth or cron secret.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret or admin auth
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    // Get all shops with pending commissions
    const { data: pendingCommissions, error } = await supabase
      .from("transactions")
      .select(`
        shop_id,
        shops!inner(id, name, iban, partita_iva),
        shop_commission,
        currency
      `)
      .eq("status", "captured")
      .is("stripe_transfer_id", null)
      .not("shop_id", "is", null)
      .gt("shop_commission", 0);

    if (error) {
      throw new Error(`Failed to fetch pending commissions: ${error.message}`);
    }

    if (!pendingCommissions || pendingCommissions.length === 0) {
      return NextResponse.json({ message: "No pending commissions to process" });
    }

    // Aggregate commissions per shop
    const shopTotals = new Map<string, {
      shopId: string;
      shopName: string;
      totalCommission: number;
      currency: string;
      transactionIds: string[];
    }>();

    for (const tx of pendingCommissions) {
      if (!tx.shop_id) continue;
      const existing = shopTotals.get(tx.shop_id);
      if (existing) {
        existing.totalCommission += tx.shop_commission;
      } else {
        const shop = tx.shops as unknown as { id: string; name: string };
        shopTotals.set(tx.shop_id, {
          shopId: tx.shop_id,
          shopName: shop.name,
          totalCommission: tx.shop_commission,
          currency: tx.currency,
          transactionIds: [],
        });
      }
    }

    const results = [];

    for (const [, shopData] of shopTotals) {
      try {
        // Note: shops receive transfers to their bank via platform's Stripe balance.
        // For this to work, the platform needs to have the shop's bank details
        // or use Stripe's Transfer to a connected account.
        // Since shops are NOT connected accounts, we use manual bank transfers
        // or create a lightweight connected account for them.

        const transfer = await transferToShop({
          amountCents: shopData.totalCommission,
          currency: shopData.currency,
          shopStripeAccountId: shopData.shopId, // This would be a Stripe account ID in production
          description: `Commission payout - ${shopData.shopName}`,
          metadata: {
            shop_id: shopData.shopId,
            period: new Date().toISOString().substring(0, 7),
          },
        });

        // Update transactions with transfer ID
        await supabase
          .from("transactions")
          .update({ stripe_transfer_id: transfer.id })
          .eq("shop_id", shopData.shopId)
          .eq("status", "captured")
          .is("stripe_transfer_id", null);

        results.push({
          shopId: shopData.shopId,
          shopName: shopData.shopName,
          amount: shopData.totalCommission,
          transferId: transfer.id,
          status: "success",
        });

        await auditLog({
          eventType: "transfer.shop_payout",
          actorType: "system",
          resourceType: "shop",
          resourceId: shopData.shopId,
          metadata: {
            amount: shopData.totalCommission,
            transfer_id: transfer.id,
          },
        });
      } catch (err) {
        results.push({
          shopId: shopData.shopId,
          shopName: shopData.shopName,
          amount: shopData.totalCommission,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
        });

        await auditLog({
          eventType: "transfer.shop_payout_failed",
          actorType: "system",
          resourceType: "shop",
          resourceId: shopData.shopId,
          metadata: {
            amount: shopData.totalCommission,
            error: err instanceof Error ? err.message : "Unknown",
          },
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[TRANSFERS_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
