"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { saveShopRef } from "@/lib/tracking";

/**
 * Client component that reads ?ref= from URL and saves to localStorage.
 * Rendered in the public layout - replaces middleware-based tracking.
 * Reads searchParams client-side since layouts don't receive searchParams in Next.js 15.
 */
export function ShopTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      saveShopRef(ref);
    }
  }, [searchParams]);

  return null;
}
