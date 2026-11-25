"use client";

import { useEffect, useState } from "react";
import { INITIAL_PRODUCTS } from "@/lib/catalog";
import { heroStatusLine } from "@/lib/hours";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/types/database";
import { BurgerStamp } from "../BurgerStamp";
import { ALL_TAB, prefersReducedMotion, scrollToTab } from "./layout";
import { useStorefrontStatus } from "./useStorefrontStatus";
import { Display } from "@/components/Display";
import Ticker from "./Ticker";

// Hero fan: 5 stickers (CRISPY BACON is on the board and cards, not in the fan).
const HERO_PRODUCTS = ["prod-classic", "prod-double", "prod-hot-boy", "prod-hot-honey", "prod-crispy"]
  .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
  .filter((p): p is Product => !!p && p.is_available && p.price > 0);

// Fan layout per stack position (0 = top). Offsets are % of the sticker's own size,
// so the same layout works at any sticker size.
const STICKER_SLOTS = [
  { x: 84, y: 30, r: -3, z: 50, s: 1 },
  { x: 0, y: 8, r: -10, z: 40, s: 0.95 },
  { x: 168, y: 20, r: 9, z: 30, s: 0.9 },
  { x: 42, y: 0, r: 6, z: 20, s: 0.88 },
  { x: 126, y: 2, r: -7, z: 10, s: 0.86 },
];

// Fanned round stickers (tap = customize). `order` lists product ids, top first.
function HeroStickers({
  order,
  size,
  onPick,
  onPause,
}: {
  order: string[];
  size: number;
  onPick: (product: Product) => void;
  onPause: (paused: boolean) => void;
}) {
  return (
    <div
      className="relative"
      style={{ width: size * 2.68, height: size * 1.3 }}
      onMouseEnter={() => onPause(true)}
      onMouseLeave={() => onPause(false)}
      onFocus={() => onPause(true)}
      onBlur={() => onPause(false)}
    >
      {HERO_PRODUCTS.map((product) => {
        const slot = STICKER_SLOTS[Math.max(0, order.indexOf(product.id))];
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onPick(product)}
            aria-label={`Personalizează ${product.name}`}
            style={{
              width: size,
              height: size,
              zIndex: slot.z,
              transform: `translate(${slot.x}%, ${slot.y}%) rotate(${slot.r}deg) scale(${slot.s})`,
            }}
            className="absolute left-0 top-0 rounded-full drop-shadow-[4px_4px_0px_#332420] hero-sticker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
          >
            <BurgerStamp product={product} className="h-full w-full" />
          </button>
        );
      })}
    </div>
  );
}

// Owns the shuffle state so a 4s tick re-renders only the stickers, never the page.
function StickerStack({ size, modalOpen, onPick }: { size: number; modalOpen: boolean; onPick: (p: Product) => void }) {
  const [order, setOrder] = useState<string[]>(() => HERO_PRODUCTS.map((p) => p.id));
  const [paused, setPaused] = useState(false);

  // Every ~4s the top sticker goes to the back. Off with reduced motion, while hovering/focusing, and while the modal is open.
  useEffect(() => {
    if (paused || modalOpen || prefersReducedMotion()) return;
    const id = setInterval(() => setOrder(([top, ...rest]) => [...rest, top]), 4000);
    return () => clearInterval(id);
  }, [paused, modalOpen]);

  return <HeroStickers order={order} size={size} onPick={onPick} onPause={setPaused} />;
}

/** Hero: headline + stickers + COMANDĂ, then the ticker and the stripe. The old menu board is archived in components/archive. */
export default function HeroBoard() {
  const status = useStorefrontStatus();
  const customizing = useUiStore((s) => s.customizing);
  const openCustomize = useUiStore((s) => s.openCustomize);

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 md:pt-14 lg:pt-16 grid grid-cols-1 md:grid-cols-2 md:items-center gap-6 md:gap-8 lg:gap-12 md:min-h-[min(calc(100svh-9rem),52rem)]">
        <div className="flex flex-col items-start">
          {/* Each line is skewed on its own from its bottom-left corner, so all lines start on the same left edge. */}
          <h1 className="font-bebas text-[clamp(3.5rem,8.5vw,6.5rem)] leading-[0.88] text-[#332420]">
            {["YOUR", "LOCAL"].map((line) => (
              <span key={line} className="block w-fit -skew-x-6 origin-bottom-left"><Display>{line}</Display></span>
            ))}
            <span className="block w-fit -skew-x-6 origin-bottom-left text-[#790D20]"><Display>BURGER SPOT.</Display></span>
          </h1>
          <p className="font-nunito font-semibold text-xl sm:text-2xl text-[#332420] mt-6 max-w-lg">
            Burgeri făcuți pe loc, în Sector 6. Comanzi direct de aici, fără aplicații și fără comisioane.
          </p>

          {/* Mobile: sticker stack goes under the headline (pure SVG, no cart state) */}
          <div className="self-center my-6 md:hidden">
            <StickerStack size={100} modalOpen={!!customizing} onPick={openCustomize} />
          </div>

          <button
            type="button"
            onClick={() => scrollToTab(ALL_TAB)}
            className="mt-2 md:mt-8 min-h-[60px] bg-[#790D20] text-[#F5E6CC] font-bebas text-3xl tracking-wider px-12 py-4 rounded-lg border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420] hover:bg-[#332420] active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0px_0px_#332420] transition-colors duration-200"
          >
            <Display>COMANDĂ</Display>
          </button>

          <ul className="mt-6 flex flex-wrap gap-2">
            {["Livrare proprie", "Ridicare în 15 min", "Plata online cu cardul"].map((f) => (
              <li
                key={f}
                className="font-nunito font-bold text-xs sm:text-sm leading-none px-3 py-2 rounded-md bg-[#790D20] text-[#F5E6CC]"
              >
                {f}
              </li>
            ))}
          </ul>

          {/* One status line with an LED dot. Empty until the client knows the time (no false "open" claim in SSR) */}
          <p
            className="mt-4 min-h-8 flex items-center gap-2 font-nunito font-bold text-sm sm:text-base text-[#332420]"
            aria-live="polite"
          >
            {status && (
              <>
                <span
                  aria-hidden
                  className={`w-3 h-3 rounded-full shrink-0 border-2 border-[#790D20] ${
                    status.open ? "bg-[#790D20] status-led-on" : "bg-transparent opacity-50"
                  }`}
                />
                {heroStatusLine(status)}
              </>
            )}
          </p>
        </div>

        {/* md+: big sticker fan fills the right column */}
        <div className="hidden md:flex items-center justify-center">
          <div className="origin-center md:scale-[0.62] lg:scale-[0.9] xl:scale-100">
            <StickerStack size={190} modalOpen={!!customizing} onPick={openCustomize} />
          </div>
        </div>
      </section>

      <Ticker />

      <div className="h-6 lg:h-10" />
      <div aria-hidden className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-3 border-y-[3px] border-[#790D20] rounded-tr-3xl rounded-bl-3xl" />
      </div>
      <div className="h-4 lg:h-6" />

    </>
  );
}
