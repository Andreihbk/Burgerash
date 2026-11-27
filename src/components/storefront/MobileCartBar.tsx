"use client";

import { ArrowRight } from "lucide-react";
import { formatLei } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useCartSummary } from "./useCartSummary";
import { BOTTOM_NAV_HEIGHT } from "./BottomNav";
import { Display } from "@/components/Display";

/** Cart bar, mobile only (<768px): sits right above the bottom tab bar. */
export default function MobileCartBar() {
  const openCart = useCartStore((s) => s.openCart);
  const addedSeq = useUiStore((s) => s.addedSeq);
  const { totalItems, grandTotal } = useCartSummary();

  if (totalItems === 0) return null;

  return (
    <div
      className="md:hidden fixed inset-x-0 z-40 bg-[#F5E6CC] border-t-2 border-[#332420] px-4 py-3"
      style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }}
    >
      <button
        type="button"
        onClick={openCart}
        className="w-full flex items-center justify-between gap-3 bg-[#790D20] text-[#F5E6CC] font-display text-xl px-4 py-3 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] active:translate-y-[1px] transition-all"
      >
        <span>
          <Display>COȘ</Display> (
          <span key={addedSeq} className={`inline-block ${addedSeq > 0 ? "animate-badge-pop" : ""}`}>
            <Display>{totalItems}</Display>
          </span>
          ) · <Display>{formatLei(grandTotal)}</Display>
        </span>
        <ArrowRight className="w-6 h-6 stroke-[3]" aria-hidden="true" />
      </button>
    </div>
  );
}
