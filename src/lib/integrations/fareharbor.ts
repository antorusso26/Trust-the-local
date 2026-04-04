/**
 * FareHarbor API Client
 * Docs: https://fareharbor.com/api/external/v1/
 */

const BASE_URL = process.env.FAREHARBOR_BASE_URL || "https://fareharbor.com/api/external/v1";
const API_KEY = process.env.FAREHARBOR_API_KEY || "";

function getHeaders(): Record<string, string> {
  return {
    "X-FareHarbor-API-App": API_KEY,
    "X-FareHarbor-API-User": API_KEY,
    "Content-Type": "application/json",
  };
}

export interface FareHarborItem {
  pk: number;
  name: string;
  headline: string;
  description: string;
  image_cdn_url: string;
  price: number;
  currency: string;
  duration: string;
}

export interface FareHarborAvailability {
  pk: number;
  start_at: string;
  end_at: string;
  capacity: number;
  available_capacity: number;
  price: number;
}

export interface FareHarborBooking {
  pk: number;
  uuid: string;
  status: string;
  confirmation_url: string;
}

/**
 * Get all items (tours) for a company.
 */
export async function getItems(companyShortname: string): Promise<FareHarborItem[]> {
  const res = await fetch(
    `${BASE_URL}/companies/${companyShortname}/items/`,
    { headers: getHeaders(), next: { revalidate: 300 } }
  );

  if (!res.ok) {
    throw new Error(`FareHarbor getItems failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.items;
}

/**
 * Get availabilities for a specific item on a date range.
 */
export async function getAvailabilities(
  companyShortname: string,
  itemPk: number,
  date: string // YYYY-MM-DD
): Promise<FareHarborAvailability[]> {
  const res = await fetch(
    `${BASE_URL}/companies/${companyShortname}/items/${itemPk}/minimal/availabilities/date/${date}/`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`FareHarbor getAvailabilities failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.availabilities;
}

/**
 * Create a booking on FareHarbor.
 * MUST be called AFTER Stripe payment pre-authorization.
 */
export async function createBooking(
  companyShortname: string,
  availabilityPk: number,
  params: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    guests: number;
    voucherNumber?: string;
  }
): Promise<FareHarborBooking> {
  const body = {
    availability: availabilityPk,
    contact: {
      name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone || "",
    },
    customers: Array.from({ length: params.guests }, () => ({
      customer_type_rate: null,
    })),
    voucher_number: params.voucherNumber || "",
  };

  const res = await fetch(
    `${BASE_URL}/companies/${companyShortname}/availabilities/${availabilityPk}/bookings/`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`FareHarbor createBooking failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.booking;
}

/**
 * Cancel a booking on FareHarbor.
 */
export async function cancelBooking(
  companyShortname: string,
  bookingUuid: string
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/companies/${companyShortname}/bookings/${bookingUuid}/`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error(`FareHarbor cancelBooking failed: ${res.status} ${res.statusText}`);
  }
}
