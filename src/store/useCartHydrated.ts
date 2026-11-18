import { useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cartStore";

const subscribe = (notify: () => void) => useCartStore.persist.onFinishHydration(notify);
const getSnapshot = () => useCartStore.persist.hasHydrated();
const getServerSnapshot = () => false;

/** False on the server and during hydration, true once the persisted cart is loaded. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
