import { stripe } from "./client";

/**
 * Split percentages configuration.
 * Example: Customer pays €100
 *   - Operator receives €80 (Merchant of Record)
 *   - Platform application_fee: €20
 *     - Of which €10 transferred to Shop (end of month)
 *     - Of which €10 retained by Platform
 */
const PLATFORM_FEE_PCT = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || "20");
const SHOP_COMMISSION_PCT = parseInt(process.env.SHOP_COMMISSION_PERCENTAGE || "10");

export interface SplitResult {
  amountTotal: number;
  operatorNet: number;
  applicationFee: number;
  shopCommission: number;
  platformRetained: number;
}

/**
 * Calculate payment split for a Direct Charge.
 * All amounts in cents.
 */
export function calculateSplit(amountCents: number, shopCommissionPct?: number): SplitResult {
  const effectiveShopPct = shopCommissionPct ?? SHOP_COMMISSION_PCT;
  const applicationFee = Math.round(amountCents * (PLATFORM_FEE_PCT / 100));
  const shopCommission = Math.round(amountCents * (effectiveShopPct / 100));
  const operatorNet = amountCents - applicationFee;
  const platformRetained = applicationFee - shopCommission;

  return {
    amountTotal: amountCents,
    operatorNet,
    applicationFee,
    shopCommission,
    platformRetained,
  };
}

/**
 * Create a Stripe Connected Account for a new Operator.
 * Uses Standard accounts (operator manages their own Stripe dashboard).
 */
export async function createConnectedAccount(params: {
  email: string;
  companyName: string;
  vatNumber: string;
}) {
  const account = await stripe().accounts.create({
    type: "standard",
    country: "IT",
    email: params.email,
    company: {
      name: params.companyName,
      tax_id: params.vatNumber,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      platform: "trust_the_local",
      vat_number: params.vatNumber,
    },
  });

  return account;
}

/**
 * Generate Stripe Connect onboarding link.
 * Redirects operator to Stripe for KYC/Identity verification.
 */
export async function createAccountLink(accountId: string, returnUrl: string) {
  const accountLink = await stripe().accountLinks.create({
    account: accountId,
    refresh_url: `${returnUrl}?refresh=true`,
    return_url: `${returnUrl}?success=true`,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Create a Direct Charge PaymentIntent.
 * The Operator is the Merchant of Record.
 * application_fee_amount goes to the Platform.
 */
export async function createDirectCharge(params: {
  amountCents: number;
  currency: string;
  operatorStripeAccountId: string;
  applicationFeeCents: number;
  customerEmail: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await stripe().paymentIntents.create({
    amount: params.amountCents,
    currency: params.currency,
    application_fee_amount: params.applicationFeeCents,
    payment_method_types: ["card"],
    metadata: {
      platform: "trust_the_local",
      ...params.metadata,
    },
    receipt_email: params.customerEmail,
  }, {
    stripeAccount: params.operatorStripeAccountId,
  });

  return paymentIntent;
}

/**
 * Transfer shop commission from Platform balance.
 * Called at end of month for each shop's accumulated commissions.
 */
export async function transferToShop(params: {
  amountCents: number;
  currency: string;
  shopStripeAccountId: string;
  description: string;
  metadata?: Record<string, string>;
}) {
  const transfer = await stripe().transfers.create({
    amount: params.amountCents,
    currency: params.currency,
    destination: params.shopStripeAccountId,
    description: params.description,
    metadata: {
      platform: "trust_the_local",
      ...params.metadata,
    },
  });

  return transfer;
}

/**
 * Issue a refund on the operator's connected account.
 * Used when FareHarbor sends booking_cancelled webhook.
 */
export async function refundPayment(
  paymentIntentId: string,
  operatorStripeAccountId: string,
  reason?: string
) {
  const refund = await stripe().refunds.create({
    payment_intent: paymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      platform: "trust_the_local",
      refund_reason: reason || "booking_cancelled",
    },
  }, {
    stripeAccount: operatorStripeAccountId,
  });

  return refund;
}

/**
 * Verify Stripe webhook signature.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  endpointSecret: string
) {
  return stripe().webhooks.constructEvent(payload, signature, endpointSecret);
}

/**
 * Check if a connected account has completed onboarding.
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe().accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  };
}
