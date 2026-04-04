"use client";

import { useState, useEffect } from "react";
import { getShopRef } from "@/lib/tracking";

/**
 * Hook to read the current shop reference from localStorage.
 * Used in checkout to attribute the sale to the referring shop.
 */
export function useShopTracking() {
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    setShopId(getShopRef());
  }, []);

  return { shopId };
}
