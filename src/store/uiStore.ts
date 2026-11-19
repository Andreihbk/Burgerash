import { create } from "zustand";
import type { Product } from "@/types/database";

interface UiState {
  /** Product open in the customize modal (null = closed). */
  customizing: Product | null;
  /** Last product added to the cart (drives the toast). */
  lastAdded: { name: string } | null;
  /** Bumps on every add: restarts the toast and the cart badge animation. */
  addedSeq: number;
  openCustomize: (product: Product) => void;
  closeCustomize: () => void;
  notifyAdded: (name: string) => void;
  clearAdded: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  customizing: null,
  lastAdded: null,
  addedSeq: 0,
  openCustomize: (product) => set({ customizing: product }),
  closeCustomize: () => set({ customizing: null }),
  notifyAdded: (name) => set((s) => ({ lastAdded: { name }, addedSeq: s.addedSeq + 1 })),
  clearAdded: () => set({ lastAdded: null }),
}));
