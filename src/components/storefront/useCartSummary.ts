"use client";

import { useCartStore } from "@/store/cartStore";
import { useCartHydrated } from "@/store/useCartHydrated";

/** Cart count/total, zero until the store has hydrated (server and first client render must match). */
export function useCartSummary() {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.getTotalItemsCount());
  const total = useCartStore((s) => s.getGrandTotal());
  return { totalItems: hydrated ? items : 0, grandTotal: hydrated ? total : 0 };
}
