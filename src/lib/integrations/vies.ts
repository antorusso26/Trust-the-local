/**
 * VIES VAT Number Validation
 * EU Commission service for validating VAT numbers.
 * https://ec.europa.eu/taxation_customs/vies/
 */

export interface ViesValidationResult {
  valid: boolean;
  countryCode: string;
  vatNumber: string;
  requestDate: string;
  name?: string;
  address?: string;
}

/**
 * Validate a European VAT number via VIES.
 * Accepts format: "IT12345678901" or just "12345678901" with separate country code.
 */
export async function validateVAT(
  vatNumber: string,
  countryCode: string = "IT"
): Promise<ViesValidationResult> {
  // Clean VAT number: remove spaces, dashes, country prefix if present
  let cleanVat = vatNumber.replace(/[\s-]/g, "").toUpperCase();

  // If VAT starts with country code, extract it
  if (/^[A-Z]{2}/.test(cleanVat)) {
    countryCode = cleanVat.substring(0, 2);
    cleanVat = cleanVat.substring(2);
  }

  // Use the VIES REST API (newer, simpler than SOAP)
  const res = await fetch(
    `https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode,
        vatNumber: cleanVat,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`VIES validation failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return {
    valid: data.valid === true,
    countryCode: data.countryCode || countryCode,
    vatNumber: data.vatNumber || cleanVat,
    requestDate: data.requestDate || new Date().toISOString(),
    name: data.name || undefined,
    address: data.address || undefined,
  };
}
