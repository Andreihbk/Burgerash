"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { INITIAL_PRODUCTS } from "@/lib/catalog";
import { heroStatusLine } from "@/lib/hours";
import { useUiStore } from "@/store/uiStore";
import type { Product } from "@/types/database";
import { BurgerStamp } from "../BurgerStamp";
import MenuBoardBase from "../MenuBoard";
import { ALL_TAB, prefersReducedMotion, scrollToTab } from "./layout";
import { useStorefrontStatus } from "./useStorefrontStatus";

// Hero fan: 5 stickers (CRISPY BACON is on the board and cards, not in the fan).
const HERO_PRODUCTS = ["prod-classic", "prod-double", "prod-hot-boy", "prod-hot-honey", "prod-crispy"]
  .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
  .filter((p): p is Product => !!p && p.is_available && p.price > 0);

const PRODUCT_BY_NAME = new Map(INITIAL_PRODUCTS.map((p) => [p.name, p]));

// Menu board line name -> hero sticker product id.
const BOARD_LINE_TO_ID: Record<string, string> = {
  CLASIC: "prod-classic",
  "HOT BOY": "prod-hot-boy",
  DOUBLE: "prod-double",
  "HOT HONEY": "prod-hot-honey",
  CRISPY: "prod-crispy",
};

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


// Board is memoized: nothing in the storefront's own state can re-render it. Only `lit` changes it.
const MenuBoard = memo(MenuBoardBase);
const BOARD_LINKED_NAMES = Object.keys(BOARD_LINE_TO_ID);

export interface StickerStackHandle {
  /** Board line hovered/focused: pause the shuffle and bring that product's sticker to the top. */
  hover: (productId: string | null, active: boolean) => void;
}

// Owns the shuffle state so a 4s tick re-renders only the stickers, never the board or the page.
const StickerStack = forwardRef<StickerStackHandle, { size: number; modalOpen: boolean; onPick: (p: Product) => void }>(
  function StickerStack({ size, modalOpen, onPick }, ref) {
    const [order, setOrder] = useState<string[]>(() => HERO_PRODUCTS.map((p) => p.id));
    const [paused, setPaused] = useState(false);

    useImperativeHandle(ref, () => ({
      hover: (id, active) => {
        setPaused(active);
        if (id) setOrder((prev) => [id, ...prev.filter((x) => x !== id)]);
      },
    }), []);

    // Every ~4s the top sticker goes to the back. Off with reduced motion, while hovering/focusing, and while the modal is open.
    useEffect(() => {
      if (paused || modalOpen || prefersReducedMotion()) return;
      const id = setInterval(() => setOrder(([top, ...rest]) => [...rest, top]), 4000);
      return () => clearInterval(id);
    }, [paused, modalOpen]);

    return <HeroStickers order={order} size={size} onPick={onPick} onPause={setPaused} />;
  },
);

/** Hero: title + stickers + COMANDĂ; the lightbox menu board sits on the right (below on mobile), then the stripe. */
export default function HeroBoard() {
  const status = useStorefrontStatus();
  const customizing = useUiStore((s) => s.customizing);
  const openCustomize = useUiStore((s) => s.openCustomize);
  const stickersRef = useRef<StickerStackHandle>(null);

  const handleBoardSelect = useCallback(
    (name: string) => {
      const product = PRODUCT_BY_NAME.get(name);
      if (product) openCustomize(product);
    },
    [openCustomize],
  );

  const handleBoardLine = useCallback((name: string | null) => {
    stickersRef.current?.hover(name ? BOARD_LINE_TO_ID[name] ?? null : null, name !== null);
  }, []);

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6 md:pt-16 lg:pt-20 grid grid-cols-1 md:grid-cols-2 md:items-center gap-6 md:gap-8 lg:gap-14 md:min-h-[min(calc(100svh-9rem),52rem)]">
        <div className="flex flex-col items-start">
          <h1 className="font-bebas text-4xl sm:text-6xl md:text-4xl lg:text-6xl xl:text-7xl leading-[0.95] text-[#332420]">
            NU FACEM MEDIUM.
            <br />
            FACEM <span className="text-[#790D20]">CRUSTĂ.</span>
          </h1>
          <p className="font-nunito font-semibold text-base sm:text-lg text-[#332420] mt-4 max-w-md">
            Carne. Foc. Chiflă. Atât. Comanzi direct de aici, fără aplicații și fără comisioane.
          </p>

          {/* Mobile sticker stack (pure SVG, no cart state) */}
          <div className="self-center my-5 md:hidden">
            <StickerStack size={112} modalOpen={!!customizing} onPick={openCustomize} />
          </div>

          <button
            type="button"
            onClick={() => scrollToTab(ALL_TAB)}
            className="mt-2 md:mt-6 lg:mt-8 min-h-[52px] bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl tracking-wider px-10 py-3 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] active:translate-y-px transition-colors duration-200"
          >
            COMANDĂ
          </button>

          <ul className="mt-5 flex flex-wrap gap-2">
            {["Livrare proprie", "Ridicare în 15 min", "Plata la livrare"].map((f) => (
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

        <div className="relative">
          <MenuBoard lit={status ? status.open : false} linkedNames={BOARD_LINKED_NAMES} onLineActive={handleBoardLine} onSelect={handleBoardSelect} />
          {/* md+: stickers slapped over the board's top corner (scaled down at md) */}
          <div className="hidden md:block absolute -top-14 -right-4 lg:-top-16 lg:-right-4 xl:-right-10 z-10 origin-top-right md:scale-[0.65] lg:scale-100">
            <StickerStack ref={stickersRef} size={104} modalOpen={!!customizing} onPick={openCustomize} />
          </div>
        </div>
      </section>

      {/* Curved double red stripe (from the board) closes the hero */}
      <div aria-hidden className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-3 border-y-[3px] border-[#790D20] rounded-tr-3xl rounded-bl-3xl" />
      </div>
      <div className="h-4 lg:h-6" />

    </>
  );
}
