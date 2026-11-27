"use client";

import { useEffect, useState } from "react";
import { INITIAL_PRODUCTS } from "@/lib/catalog";
import { heroStatusLine } from "@/lib/hours";
import { isOrderingEnabled } from "@/lib/ordering";
import { useUiStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { Bike, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import { BurgerStamp } from "../BurgerStamp";
import { ALL_TAB, prefersReducedMotion, scrollToTab } from "./layout";
import { useStorefrontStatus } from "./useStorefrontStatus";
import { Display } from "@/components/Display";

// The interactive parts of the hero (audit R9). HeroBoard itself is a server component.

// Hero: 3 stickers overlapping the photo's bottom-left corner.
const HERO_PRODUCTS = ["prod-classic", "prod-hot-boy", "prod-crispy"]
  .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
  .filter((p): p is Product => !!p && p.is_available && p.price > 0);

// Fan layout per stack position (0 = top). Offsets are % of the sticker's own size,
// so the same layout works at any sticker size.
const STICKER_SLOTS = [
  { x: 52, y: 14, r: -4, z: 30, s: 1 },
  { x: 0, y: 0, r: -10, z: 20, s: 0.9 },
  { x: 104, y: 2, r: 8, z: 10, s: 0.88 },
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
      style={{ width: size * 2.04, height: size * 1.16 }}
      onMouseEnter={() => onPause(true)}
      onMouseLeave={() => onPause(false)}
      onFocus={() => onPause(true)}
      onBlur={() => onPause(false)}
    >
      {HERO_PRODUCTS.map((product, i) => {
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
            className="absolute left-0 top-0 rounded-full drop-shadow-[4px_4px_0px_var(--color-charcoal)] hero-sticker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
          >
            <span className="sticker-spin block h-full w-full">
              <span className="sticker-roll-in block h-full w-full" style={{ animationDelay: `${150 + i * 140}ms` }}>
                <BurgerStamp product={product} className="h-full w-full" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Owns the shuffle state so a 4s tick re-renders only the stickers, never the page.
export function HeroStickerStack({ size }: { size: number }) {
  const modalOpen = useUiStore((s) => !!s.customizing);
  const onPick = useUiStore((s) => s.openCustomize);
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

/** Phones: pick the order type first (owner's app concept), then the menu. */
export function HeroFulfillmentButtons() {
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType);
  return (
    <div className="md:hidden mt-6 grid w-full grid-cols-2 gap-3">
      {([
        { type: "pickup", label: "PICK UP", sub: "Ridici din restaurant", Icon: ShoppingBag },
        { type: "delivery", label: "DELIVERY", sub: "Livrare la adresă", Icon: Bike },
      ] as const).map(({ type, label, sub, Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            setFulfillmentType(type);
            scrollToTab(ALL_TAB);
          }}
          className="flex flex-col items-start gap-2 rounded-xl bg-wine text-sand border-2 border-charcoal p-4 text-left shadow-[4px_4px_0px_0px_var(--color-charcoal)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0px_0px_var(--color-charcoal)]"
        >
          <Icon className="w-7 h-7" aria-hidden />
          <span className="font-display text-2xl leading-none tracking-wide"><Display>{label}</Display></span>
          <span className="font-nunito font-bold text-xs text-sand/80">{sub}</span>
        </button>
      ))}
    </div>
  );
}

/** md+: the big COMANDĂ button that scrolls to the menu. */
export function HeroOrderButton() {
  return (
    <button
      type="button"
      onClick={() => scrollToTab(ALL_TAB)}
      className="hidden md:block mt-2 md:mt-8 min-h-[60px] bg-wine text-sand font-display text-3xl tracking-wider px-12 py-4 rounded-lg border-2 border-charcoal shadow-[6px_6px_0px_0px_var(--color-charcoal)] hover:bg-charcoal active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0px_0px_var(--color-charcoal)] transition-colors duration-200"
    >
      <Display>COMANDĂ</Display>
    </button>
  );
}

/**
 * One status line with an LED dot. Empty until the client knows the time (no false "open" claim in SSR).
 * Pre-launch: not shown at all (the red band + "Azi la Burgerash" card already say we open soon).
 */
export function HeroStatusLine() {
  const status = useStorefrontStatus();
  if (!isOrderingEnabled()) return null;
  return (
    <p
      className="mt-4 min-h-8 flex items-center gap-2 font-nunito font-bold text-sm sm:text-base text-charcoal"
      aria-live="polite"
    >
      {status && (
        <>
          <span
            aria-hidden
            className={`w-3 h-3 rounded-full shrink-0 border-2 border-wine ${
              status.open ? "bg-wine status-led-on" : "bg-transparent opacity-50"
            }`}
          />
          {heroStatusLine(status)}
        </>
      )}
    </p>
  );
}
