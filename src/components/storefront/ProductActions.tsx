"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { isOrderingEnabled } from "@/lib/ordering";
import { useIsSoldOut } from "@/lib/useSoldOut";
import type { Product } from "@/types/database";
import { Display } from "@/components/Display";

// The only client part of a product card: add to cart / open the customize modal.
export default function ProductActions({ product, customizable }: { product: Product; customizable: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const notifyAdded = useUiStore((s) => s.notifyAdded);
  const openCustomize = useUiStore((s) => s.openCustomize);

  const soldOut = useIsSoldOut(product.id);
  const orderingOff = !isOrderingEnabled();

  if (soldOut) {
    return (
      <span className="inline-flex min-h-11 items-center border-2 border-dashed border-[#790D20] px-4 py-2.5 rounded-lg font-bebas text-lg tracking-wide text-[#790D20]">
        <Display>EPUIZAT</Display>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {customizable && (
        <button
          type="button"
          onClick={() => openCustomize(product)}
          disabled={orderingOff}
          className="disabled:opacity-50 disabled:pointer-events-none bg-[#F5E6CC] text-[#332420] border-2 border-[#332420] px-3 py-2.5 rounded-lg font-bebas text-base flex items-center gap-1 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors"
          title="Personalizează ingredientele"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span><Display>EXTRA</Display></span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          if (orderingOff) return;
          addItem(product);
          notifyAdded(product.name);
        }}
        disabled={orderingOff}
        className="disabled:opacity-50 disabled:pointer-events-none bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] px-4 py-2.5 rounded-lg font-bebas text-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#332420] hover:bg-[#332420] active:translate-y-[1px] transition-all"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span><Display>ADAUGĂ</Display></span>
      </button>
    </div>
  );
}
