/**
 * Bokun API Client (Stub)
 * Ready for implementation when Bokun integration is activated.
 * Mirrors the FareHarbor interface for consistent usage.
 */

export interface BokunItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceAmount: number;
  currency: string;
  durationMinutes: number;
}

export interface BokunAvailability {
  id: string;
  startTime: string;
  endTime: string;
  availableSeats: number;
  priceAmount: number;
}

export interface BokunBooking {
  id: string;
  confirmationCode: string;
  status: string;
}

export async function getItems(_vendorId: string): Promise<BokunItem[]> {
  // TODO: Implement when Bokun API keys are available
  // const BASE_URL = process.env.BOKUN_BASE_URL;
  // const API_KEY = process.env.BOKUN_API_KEY;
  throw new Error("Bokun integration not yet activated. Configure BOKUN_API_KEY to enable.");
}

export async function getAvailabilities(
  _vendorId: string,
  _activityId: string,
  _date: string
): Promise<BokunAvailability[]> {
  throw new Error("Bokun integration not yet activated. Configure BOKUN_API_KEY to enable.");
}

export async function createBooking(
  _vendorId: string,
  _availabilityId: string,
  _params: {
    customerName: string;
    customerEmail: string;
    guests: number;
  }
): Promise<BokunBooking> {
  throw new Error("Bokun integration not yet activated. Configure BOKUN_API_KEY to enable.");
}

export async function cancelBooking(
  _vendorId: string,
  _bookingId: string
): Promise<void> {
  throw new Error("Bokun integration not yet activated. Configure BOKUN_API_KEY to enable.");
}
