/**
 * FattureInCloud API Client
 * For automatic invoice generation (autofattura art. 21 DPR 633/72).
 * https://developers.fattureincloud.it/
 */

const BASE_URL = "https://api-v2.fattureincloud.it";
const API_KEY = process.env.FATTUREINCLOUD_API_KEY || "";
const COMPANY_ID = process.env.FATTUREINCLOUD_COMPANY_ID || "";

function getHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  grossPrice: number;
  vatPercentage: number;
}

export interface AutoInvoiceResult {
  invoiceId: number;
  invoiceNumber: string;
  status: string;
  pdfUrl?: string;
}

/**
 * Create an auto-invoice (autofattura) for shop commission payout.
 * The platform generates this on behalf of the shop (procacciamento d'affari).
 */
export async function createAutoInvoice(params: {
  shopName: string;
  shopVatNumber: string;
  shopAddress?: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  totalCommissionCents: number;
  currency?: string;
}): Promise<AutoInvoiceResult> {
  if (!API_KEY || !COMPANY_ID) {
    throw new Error("FattureInCloud not configured. Set FATTUREINCLOUD_API_KEY and FATTUREINCLOUD_COMPANY_ID.");
  }

  const grossAmount = params.totalCommissionCents / 100;

  const body = {
    data: {
      type: "issued_document",
      entity: {
        name: params.shopName,
        vat_number: params.shopVatNumber,
        address_street: params.shopAddress || "",
        country: "Italia",
      },
      date: new Date().toISOString().split("T")[0],
      currency: {
        id: params.currency === "EUR" ? "EUR" : params.currency || "EUR",
      },
      items_list: [
        {
          name: `Provvigione procacciamento d'affari - Periodo ${params.periodStart} / ${params.periodEnd}`,
          description: `Commissioni per segnalazione clienti tramite piattaforma Trust the Local`,
          qty: 1,
          net_price: grossAmount,
          vat: {
            id: 0, // Will need actual VAT rate ID from FattureInCloud
          },
        },
      ],
      notes: `Autofattura ai sensi dell'art. 21 DPR 633/72. Periodo di riferimento: ${params.periodStart} - ${params.periodEnd}.`,
    },
  };

  const res = await fetch(`${BASE_URL}/c/${COMPANY_ID}/issued_documents`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`FattureInCloud createAutoInvoice failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();

  return {
    invoiceId: data.data.id,
    invoiceNumber: data.data.number?.toString() || "",
    status: "created",
    pdfUrl: data.data.url || undefined,
  };
}

/**
 * Get invoice PDF URL for download.
 */
export async function getInvoicePdf(invoiceId: number): Promise<string> {
  if (!API_KEY || !COMPANY_ID) {
    throw new Error("FattureInCloud not configured.");
  }

  const res = await fetch(
    `${BASE_URL}/c/${COMPANY_ID}/issued_documents/${invoiceId}`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    throw new Error(`FattureInCloud getInvoicePdf failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data.url || "";
}
