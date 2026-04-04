const SHOP_REF_KEY = "ttl_shop_ref";
const SHOP_REF_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface StoredRef {
  shopId: string;
  timestamp: number;
}

/**
 * Save shop reference ID to localStorage with 24h TTL.
 */
export function saveShopRef(shopId: string): void {
  if (typeof window === "undefined") return;

  const data: StoredRef = {
    shopId,
    timestamp: Date.now(),
  };
  localStorage.setItem(SHOP_REF_KEY, JSON.stringify(data));
}

/**
 * Get shop reference ID from localStorage.
 * Returns null if expired or not set.
 */
export function getShopRef(): string | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(SHOP_REF_KEY);
  if (!raw) return null;

  try {
    const data: StoredRef = JSON.parse(raw);
    const elapsed = Date.now() - data.timestamp;
    if (elapsed > SHOP_REF_TTL) {
      localStorage.removeItem(SHOP_REF_KEY);
      return null;
    }
    return data.shopId;
  } catch {
    localStorage.removeItem(SHOP_REF_KEY);
    return null;
  }
}

/**
 * Clear shop reference from localStorage.
 */
export function clearShopRef(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SHOP_REF_KEY);
}
