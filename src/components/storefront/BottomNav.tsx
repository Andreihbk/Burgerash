"use client";

import { useEffect, useState } from "react";
import { House, MapPin, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCartSummary } from "./useCartSummary";
import { ALL_TAB, MENU_TOP_ID, prefersReducedMotion, scrollToTab } from "./layout";
import { Display } from "@/components/Display";

export const BOTTOM_NAV_HEIGHT = 64;
const LOCATION_ID = "locatie";

type Tab = "home" | "menu" | "location";

/** App-style tab bar, phones only (<768px): Acasă / Meniu / Coș / Locație. */
export default function BottomNav() {
  const openCart = useCartStore((s) => s.openCart);
  const { totalItems } = useCartSummary();
  const [active, setActive] = useState<Tab>("home");

  // Which part of the page is on screen: before the menu = home, after the location top = location.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      const menuTop = document.getElementById(MENU_TOP_ID)?.getBoundingClientRect().top ?? Infinity;
      const locTop = document.getElementById(LOCATION_ID)?.getBoundingClientRect().top ?? Infinity;
      setActive(locTop < line ? "location" : menuTop < line ? "menu" : "home");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  const item = (on: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-0.5 font-display text-[13px] tracking-wider transition-colors ${
      on ? "text-sand" : "text-sand/60"
    }`;
  const dot = (on: boolean) => (on ? <span aria-hidden className="absolute top-1.5 h-1 w-6 rounded-full bg-sand" /> : null);

  return (
    <nav
      aria-label="Navigare rapidă"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-wine border-t-2 border-charcoal"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex" style={{ height: BOTTOM_NAV_HEIGHT }}>
        <button type="button" className={item(active === "home")} aria-current={active === "home" ? "page" : undefined} onClick={() => window.scrollTo({ top: 0, behavior })}>
          {dot(active === "home")}
          <House className="w-5 h-5" aria-hidden />
          <Display>ACASĂ</Display>
        </button>
        <button type="button" className={item(active === "menu")} aria-current={active === "menu" ? "page" : undefined} onClick={() => scrollToTab(ALL_TAB)}>
          {dot(active === "menu")}
          <UtensilsCrossed className="w-5 h-5" aria-hidden />
          <Display>MENIU</Display>
        </button>
        <button type="button" className={item(false)} onClick={openCart} aria-label={`Coș, ${totalItems} produse`}>
          <span className="relative">
            <ShoppingBag className="w-5 h-5" aria-hidden />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-sand text-wine font-nunito font-black text-[11px] border-2 border-charcoal">
                {totalItems}
              </span>
            )}
          </span>
          <Display>COȘ</Display>
        </button>
        <button
          type="button"
          className={item(active === "location")}
          aria-current={active === "location" ? "page" : undefined}
          onClick={() => document.getElementById(LOCATION_ID)?.scrollIntoView({ behavior })}
        >
          {dot(active === "location")}
          <MapPin className="w-5 h-5" aria-hidden />
          <Display>LOCAȚIE</Display>
        </button>
      </div>
    </nav>
  );
}
