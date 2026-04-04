import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createAutoInvoice } from "@/lib/integrations/fattureincloud";
import { auditLog } from "@/lib/logger";

/**
 * POST /api/integrations/invoicing
 * Generate auto-invoices for shop commissions (monthly).
 * Protected: requires admin auth or cron secret.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { periodStart, periodEnd } = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Missing periodStart or periodEnd (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get shops with commissions in the period
    const { data: commissions, error } = await supabase
      .from("transactions")
      .select(`
        shop_id,
        shops!inner(id, name, partita_iva, address),
        shop_commission,
        currency
      `)
      .eq("status", "captured")
      .not("shop_id", "is", null)
      .gt("shop_commission", 0)
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd);

    if (error) throw error;

    // Aggregate per shop
    const shopTotals = new Map<string, {
      shopId: string;
      shopName: string;
      shopVat: string;
      shopAddress: string;
      totalCommission: number;
      currency: string;
    }>();

    for (const tx of commissions || []) {
      if (!tx.shop_id) continue;
      const shop = tx.shops as unknown as { id: string; name: string; partita_iva: string; address: string };
      const existing = shopTotals.get(tx.shop_id);
      if (existing) {
        existing.totalCommission += tx.shop_commission;
      } else {
        shopTotals.set(tx.shop_id, {
          shopId: tx.shop_id,
          shopName: shop.name,
          shopVat: shop.partita_iva,
          shopAddress: shop.address || "",
          totalCommission: tx.shop_commission,
          currency: tx.currency,
        });
      }
    }

    const results = [];

    for (const [, shopData] of shopTotals) {
      try {
        const invoice = await createAutoInvoice({
          shopName: shopData.shopName,
          shopVatNumber: shopData.shopVat,
          shopAddress: shopData.shopAddress,
          periodStart,
          periodEnd,
          totalCommissionCents: shopData.totalCommission,
          currency: shopData.currency,
        });

        // Save invoice record
        await supabase.from("invoices").insert({
          shop_id: shopData.shopId,
          period_start: periodStart,
          period_end: periodEnd,
          total_commission: shopData.totalCommission,
          external_invoice_id: invoice.invoiceId.toString(),
          invoice_provider: "fattureincloud",
          status: "sent",
        });

        results.push({
          shopId: shopData.shopId,
          shopName: shopData.shopName,
          invoiceId: invoice.invoiceId,
          status: "success",
        });

        await auditLog({
          eventType: "invoice.created",
          actorType: "system",
          resourceType: "invoice",
          metadata: {
            shop_id: shopData.shopId,
            amount: shopData.totalCommission,
            external_id: invoice.invoiceId,
          },
        });
      } catch (err) {
        results.push({
          shopId: shopData.shopId,
          shopName: shopData.shopName,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown",
        });

        await auditLog({
          eventType: "invoice.create_failed",
          actorType: "system",
          resourceType: "shop",
          resourceId: shopData.shopId,
          metadata: { error: err instanceof Error ? err.message : "Unknown" },
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[INVOICING_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
