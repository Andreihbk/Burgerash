"use client";

import { ShoppingBag } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { shortStatusLabel, statusLabel } from "@/lib/hours";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { HEADER_HEIGHT } from "./layout";
import { useCartSummary } from "./useCartSummary";
import { useStorefrontStatus } from "./useStorefrontStatus";
import { isOrderingEnabled, OPENING_SOON } from "@/lib/ordering";
import LastOrderLink from "./LastOrderLink";
import { Display } from "@/components/Display";

export default function SiteHeader() {
  const status = useStorefrontStatus();
  const openCart = useCartStore((s) => s.openCart);
  const addedSeq = useUiStore((s) => s.addedSeq);
  const { totalItems } = useCartSummary();

  return (
    <header
      style={{ height: HEADER_HEIGHT }}
      className="sticky top-0 z-40 bg-wine text-sand border-b-2 border-charcoal px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md"
    >
      <a href="#" className="flex items-center min-w-0" aria-label="burgerash, începutul paginii">
        <BrandLogo variant="horizontal" tone="sand" className="h-10 w-auto" />
      </a>

      <div className="flex items-center gap-4">
        <a
          href="#meniu"
          className="hidden md:inline-block font-display text-lg tracking-wider text-sand/80 hover:text-sand transition-colors"
        >
          <Display>MENIU</Display>
        </a>
        <a
          href="#locatie"
          className="hidden md:inline-block font-display text-lg tracking-wider text-sand/80 hover:text-sand transition-colors"
        >
          <Display>LOCAȚIE</Display>
        </a>

        <LastOrderLink />

        {!isOrderingEnabled() ? (
          <div className="flex items-center gap-1.5 lg:gap-2 text-xs font-nunito font-bold" aria-label="Program">
            <span aria-hidden className="w-2 h-2 rounded-full border border-sand" />
            <span className="whitespace-nowrap">{OPENING_SOON}</span>
          </div>
        ) : status && (
          <div className="flex lg:hidden items-center gap-1.5 text-xs font-nunito font-bold" aria-label="Program">
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${status.open ? "bg-sand" : "border border-sand"}`}
            />
            <span>{shortStatusLabel(status)}</span>
          </div>
        )}

        {isOrderingEnabled() && status && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-nunito font-bold" aria-label="Program">
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${status.open ? "bg-sand" : "border border-sand"}`}
            />
            <span>
              {statusLabel(status)}
            </span>
          </div>
        )}

        <button
          onClick={openCart}
          aria-label={`Coș, ${totalItems} produse`}
          className="relative bg-sand text-wine px-4 py-2 rounded-lg font-display text-xl tracking-wide flex items-center gap-2 border-2 border-charcoal shadow-[3px_3px_0px_0px_var(--color-charcoal)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span><Display>COȘ</Display></span>
          {totalItems > 0 && (
            <span
              key={addedSeq}
              className={`absolute -top-2 -right-2 bg-wine text-sand font-mono text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-sand ${
                addedSeq > 0 ? "animate-badge-pop" : ""
              }`}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>
      {/* Page progress (ScrollEffects writes the scaleX transform on scroll). */}
      <div
        aria-hidden
        data-page-progress
        className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[3px] origin-left bg-sand"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
