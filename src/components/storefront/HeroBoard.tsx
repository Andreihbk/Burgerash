"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import heroPhoto from "../../../public/images/marketing/hero-tray-fries.jpg";
import { INITIAL_PRODUCTS } from "@/lib/catalog";
import { heroStatusLine } from "@/lib/hours";
import { isOrderingEnabled, OPENING_SOON } from "@/lib/ordering";
import { useUiStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { Bike, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import { BurgerStamp } from "../BurgerStamp";
import { ALL_TAB, prefersReducedMotion, scrollToTab } from "./layout";
import { useStorefrontStatus } from "./useStorefrontStatus";
import { Display } from "@/components/Display";
import Ticker from "./Ticker";
import PhotoStrip from "./PhotoStrip";

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
            className="absolute left-0 top-0 rounded-full drop-shadow-[4px_4px_0px_#332420] hero-sticker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
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
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType);

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
            Burgeri din carne proaspătă, făcuți pe loc în Sector 6. Comanzi direct de aici, fără comisioane.
          </p>

          {/* Phones: pick the order type first (owner's app concept), then the menu. */}
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
                className="flex flex-col items-start gap-2 rounded-xl bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] p-4 text-left shadow-[4px_4px_0px_0px_#332420] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0px_0px_#332420]"
              >
                <Icon className="w-7 h-7" aria-hidden />
                <span className="font-bebas text-2xl leading-none tracking-wide"><Display>{label}</Display></span>
                <span className="font-nunito font-bold text-xs text-[#F5E6CC]/80">{sub}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToTab(ALL_TAB)}
            className="hidden md:block mt-2 md:mt-8 min-h-[60px] bg-[#790D20] text-[#F5E6CC] font-bebas text-3xl tracking-wider px-12 py-4 rounded-lg border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420] hover:bg-[#332420] active:translate-x-px active:translate-y-px active:shadow-[3px_3px_0px_0px_#332420] transition-colors duration-200"
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
            {!isOrderingEnabled() ? (
              <>
                <span aria-hidden className="w-3 h-3 rounded-full shrink-0 border-2 border-[#790D20] opacity-50" />
                {OPENING_SOON}
              </>
            ) : status && (
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

        {/* Photo + stickers: right column on md+, under the COMANDĂ block on mobile (ordering stays above the fold). */}
        <div className="relative w-full max-w-md md:max-w-[30rem] mx-auto mb-14 md:mb-10">
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl border-2 border-[#332420] shadow-[6px_6px_0px_0px_#332420]">
            <Image
              src={heroPhoto}
              alt="Burger cu cartofi prăjiți pe tavă, în fața faianței roșii burgerash"
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1152px) 480px, (min-width: 768px) 45vw, 100vw"
              className="object-cover object-[50%_60%]"
            />
          </div>
          <div className="absolute -left-3 -bottom-14 md:-left-8 md:-bottom-12">
            <div className="md:hidden"><StickerStack size={88} modalOpen={!!customizing} onPick={openCustomize} /></div>
            <div className="hidden md:block"><StickerStack size={120} modalOpen={!!customizing} onPick={openCustomize} /></div>
          </div>
        </div>
      </section>

      <Ticker />
      <PhotoStrip />
      <div aria-hidden className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-3 border-y-[3px] border-[#790D20] rounded-tr-3xl rounded-bl-3xl" />
      </div>
      <div className="h-4 lg:h-6" />

    </>
  );
}
