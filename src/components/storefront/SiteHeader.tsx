"use client";

import { ShoppingBag } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { shortStatusLabel, statusLabel } from "@/lib/hours";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { HEADER_HEIGHT } from "./layout";
import { useCartSummary } from "./useCartSummary";
import { useStorefrontStatus } from "./useStorefrontStatus";
import LastOrderLink from "./LastOrderLink";

export default function SiteHeader() {
  const status = useStorefrontStatus();
  const openCart = useCartStore((s) => s.openCart);
  const addedSeq = useUiStore((s) => s.addedSeq);
  const { totalItems } = useCartSummary();

  return (
    <header
      style={{ height: HEADER_HEIGHT }}
      className="sticky top-0 z-40 bg-[#790D20] text-[#F5E6CC] border-b-2 border-[#332420] px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md"
    >
      <a href="#" className="flex flex-col justify-center min-w-0" aria-label="burgerash, începutul paginii">
        <BrandLogo className="h-8 w-auto text-[#F5E6CC]" />
        <p className="hidden sm:block text-[10px] tracking-widest font-mono text-[#F5E6CC]/70 mt-0.5">
          HAND CRAFTED SMASH BURGERS
        </p>
      </a>

      <div className="flex items-center gap-4">
        <a
          href="#lightboard"
          className="hidden md:inline-block font-bebas text-lg tracking-wider text-[#F5E6CC]/80 hover:text-[#F5E6CC] transition-colors"
        >
          PANOU MENIU
        </a>
        <a
          href="#location"
          className="hidden md:inline-block font-bebas text-lg tracking-wider text-[#F5E6CC]/80 hover:text-[#F5E6CC] transition-colors"
        >
          LOCAȚIE
        </a>

        <LastOrderLink />

        {status && (
          <div className="flex lg:hidden items-center gap-1.5 text-xs font-nunito font-bold" aria-label="Program">
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${status.open ? "bg-[#F5E6CC]" : "border border-[#F5E6CC]"}`}
            />
            <span>{shortStatusLabel(status)}</span>
          </div>
        )}

        {status && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-nunito font-bold" aria-label="Program">
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${status.open ? "bg-[#F5E6CC]" : "border border-[#F5E6CC]"}`}
            />
            <span>{statusLabel(status)}</span>
          </div>
        )}

        <button
          onClick={openCart}
          aria-label={`Coș, ${totalItems} produse`}
          className="relative bg-[#F5E6CC] text-[#790D20] px-4 py-2 rounded-lg font-bebas text-xl tracking-wide flex items-center gap-2 border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>COȘ</span>
          {totalItems > 0 && (
            <span
              key={addedSeq}
              className={`absolute -top-2 -right-2 bg-[#790D20] text-[#F5E6CC] font-mono text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#F5E6CC] ${
                addedSeq > 0 ? "animate-badge-pop" : ""
              }`}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
