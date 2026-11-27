"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useIsSoldOut } from "@/lib/useSoldOut";
import type { Product } from "@/types/database";
import { Display } from "@/components/Display";

// The only client part of a product card: add to cart / open the customize modal.
export default function ProductActions({ product, customizable }: { product: Product; customizable: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const notifyAdded = useUiStore((s) => s.notifyAdded);
  const openCustomize = useUiStore((s) => s.openCustomize);

  const soldOut = useIsSoldOut(product.id);

  if (soldOut) {
    return (
      <span className="inline-flex min-h-11 items-center border-2 border-dashed border-wine px-4 py-2.5 rounded-lg font-display text-lg tracking-wide text-wine">
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
          className="disabled:opacity-50 disabled:pointer-events-none bg-sand text-charcoal border-2 border-charcoal px-3 py-2.5 rounded-lg font-display text-base flex items-center gap-1 hover:bg-charcoal hover:text-sand transition-colors"
          title="Personalizează ingredientele"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span><Display>EXTRA</Display></span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          addItem(product);
          notifyAdded(product.name);
        }}
        className="disabled:opacity-50 disabled:pointer-events-none bg-wine text-sand border-2 border-charcoal px-4 py-2.5 rounded-lg font-display text-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--color-charcoal)] hover:bg-charcoal active:translate-y-[1px] transition-all"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span><Display>ADAUGĂ</Display></span>
      </button>
    </div>
  );
}
