"use client";

import { Plus } from "lucide-react";
import { BurgerStamp } from "../BurgerStamp";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { isOrderingEnabled } from "@/lib/ordering";
import { useIsSoldOut } from "@/lib/useSoldOut";
import type { Product } from "@/types/database";
import { Display } from "@/components/Display";

/** Phone menu row: sticker thumbnail, name, short description, price. Tap the row = product detail (customize modal); "+" = quick add. */
export default function ProductRow({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const notifyAdded = useUiStore((s) => s.notifyAdded);
  const openCustomize = useUiStore((s) => s.openCustomize);
  const soldOut = useIsSoldOut(product.id);
  const orderingOff = !isOrderingEnabled();

  return (
    <li className={`flex items-center gap-3 bg-[#F5E6CC] border-2 border-[#332420] rounded-xl p-2.5 pr-3 shadow-[3px_3px_0px_0px_#332420] ${soldOut ? "opacity-60" : ""}`}>
      <button
        type="button"
        onClick={() => openCustomize(product)}
        className="flex flex-1 min-w-0 items-center gap-3 text-left rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
        aria-label={`Vezi ${product.name}, ${product.price} lei`}
      >
        <span className="shrink-0 grid place-items-center w-[4.5rem] h-[4.5rem] rounded-lg bg-[#790D20]/10 border border-[#790D20]/20">
          <BurgerStamp product={product} className="h-16 w-16 -rotate-6" />
        </span>
        <span className="min-w-0">
          <span className="block font-bebas text-xl leading-tight tracking-wide text-[#332420]">
            <Display>{product.name}</Display>
          </span>
          {product.description && (
            <span className="block font-nunito font-semibold text-xs leading-snug text-[#332420]/70 line-clamp-2">{product.description}</span>
          )}
          <span className="block mt-1 font-nunito font-black text-base text-[#790D20]">
            {product.price} <span className="text-xs font-bold">LEI</span>
            {product.weight_label && <span className="ml-2 font-mono text-[10px] font-normal text-[#332420]/60">{product.weight_label}</span>}
          </span>
        </span>
      </button>

      {soldOut ? (
        <span className="shrink-0 font-bebas text-sm tracking-wide text-[#790D20] border-2 border-dashed border-[#790D20] rounded-md px-2 py-1">
          <Display>EPUIZAT</Display>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (orderingOff) return;
            addItem(product);
            notifyAdded(product.name);
          }}
          disabled={orderingOff}
          aria-label={`Adaugă ${product.name} în coș`}
          className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] shadow-[2px_2px_0px_0px_#332420] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
      )}
    </li>
  );
}
