"use client";

import { forwardRef, memo, useCallback, useMemo, useEffect, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";
import { INITIAL_MODIFIERS, INITIAL_PRODUCTS, MENU_SECTIONS } from "@/lib/catalog";
import { useCartStore } from "@/store/cartStore";
import { useCartHydrated } from "@/store/useCartHydrated";
import { formatLei } from "@/lib/format";
import { BurgerStamp } from "./BurgerStamp";
import { BrandLogo } from "./BrandLogo";
import MenuBoardBase from "./MenuBoard";
import CartDrawer from "./CartDrawer";
import TodayAtBurgerash from "./TodayAtBurgerash";
import { heroStatusLine, scheduleLines, shortStatusLabel, statusLabel } from "@/lib/hours";
import { useOpeningStatus } from "@/lib/useOpeningStatus";
import type { OpeningStatus } from "@/lib/hours";
import { OrderItemModifier, Product } from "@/types/database";
import { ShoppingBag, Plus, SlidersHorizontal, X, Check, MapPin, ArrowRight } from "lucide-react";

// Header has a fixed height so the category bar can stick right under it.
const HEADER_HEIGHT = 72;
const ALL_TAB = "all";

const sectionDomId = (categoryId: string) => `meniu-${categoryId}`;

const HERO_PRODUCTS = ["prod-classic", "prod-hot-boy", "prod-double"]
  .map((id) => INITIAL_PRODUCTS.find((p) => p.id === id))
  .filter((p): p is Product => !!p);

// Menu board line name -> hero sticker product id.
const BOARD_LINE_TO_ID: Record<string, string> = {
  CLASIC: "prod-classic",
  "HOT BOY": "prod-hot-boy",
  DOUBLE: "prod-double",
};

// Fan layout per stack position (0 = top). Offsets are % of the sticker's own size,
// so the same layout works at any sticker size.
const STICKER_SLOTS = [
  { x: 84, y: 22, r: -3, z: 30, s: 1 },
  { x: 0, y: 0, r: -10, z: 20, s: 0.95 },
  { x: 168, y: 12, r: 9, z: 10, s: 0.9 },
];

// Three fanned round stickers (tap = customize). `order` lists product ids, top first.
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
      style={{ width: size * 2.68, height: size * 1.22 }}
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

// DEV ONLY, visual only: ?preview=open|closed forces the hero/board/status visuals. The NODE_ENV check is
// inlined by Next, so this is dead code in production. The server-side hours check on /api/orders is untouched.
function applyDevPreview(status: OpeningStatus | null): OpeningStatus | null {
  if (process.env.NODE_ENV === "production" || !status) return status;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview === "open") return { open: true, todayHours: status.todayHours, closesAt: status.closesAt ?? "22:00", next: null };
  if (preview === "closed") return { open: false, todayHours: status.todayHours, closesAt: null, next: status.next ?? { when: "mâine", time: "10:00" } };
  return status;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const isCustomizable = (product: Product) =>
  product.category_id === "cat-burgers" || product.category_id === "cat-chicken";

export default function Storefront() {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  const [itemNote, setItemNote] = useState<string>("");
  const [itemQty, setItemQty] = useState<number>(1);
  const [toast, setToast] = useState<{ key: number; name: string } | null>(null);
  const [badgeBump, setBadgeBump] = useState(0);
  const realStatus = useOpeningStatus();
  const status = useMemo(() => applyDevPreview(realStatus), [realStatus]);
  const stickersRef = useRef<StickerStackHandle>(null);

  const barRef = useRef<HTMLDivElement>(null);
  const menuTopRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSeq = useRef(0);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const hydrated = useCartHydrated();
  const storedItems = useCartStore((state) => state.getTotalItemsCount());
  const storedTotal = useCartStore((state) => state.getGrandTotal());
  // Server and first client render must match: no cart-dependent UI before the store has hydrated.
  const totalItems = hydrated ? storedItems : 0;
  const grandTotal = hydrated ? storedTotal : 0;

  // Scroll spy: the active tab is the last section whose top has passed under the sticky bar.
  useEffect(() => {
    const onScroll = () => {
      const offset = HEADER_HEIGHT + (barRef.current?.offsetHeight ?? 0) + 16;
      let current = ALL_TAB;
      for (const { category } of MENU_SECTIONS) {
        const el = document.getElementById(sectionDomId(category.id));
        if (el && el.getBoundingClientRect().top <= offset) current = category.id;
      }
      setActiveTab(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the active tab visible inside the horizontally scrolling bar (mobile).
  useEffect(() => {
    const bar = barRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (!bar || !tab) return;
    bar.scrollTo({
      left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeTab]);

  const handleBoardLine = useCallback((name: string | null) => {
    stickersRef.current?.hover(name ? BOARD_LINE_TO_ID[name] ?? null : null, name !== null);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const scrollToTab = (tabId: string) => {
    const target =
      tabId === ALL_TAB ? menuTopRef.current : document.getElementById(sectionDomId(tabId));
    if (!target) return;
    const offset = HEADER_HEIGHT + (barRef.current?.offsetHeight ?? 0) + 12;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setActiveTab(tabId);
  };

  const handleAdd = (
    product: Product,
    modifiers?: OrderItemModifier[],
    note?: string,
    quantity?: number
  ) => {
    addItem(product, modifiers, note, quantity);
    setBadgeBump((n) => n + 1);
    toastSeq.current += 1;
    setToast({ key: toastSeq.current, name: product.name });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const handleOpenCartFromToast = () => {
    setToast(null);
    openCart();
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    setItemNote("");
    setItemQty(1);
  };

  const toggleModifier = (mod: typeof INITIAL_MODIFIERS[0]) => {
    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.id === mod.id);
      if (exists) return prev.filter((m) => m.id !== mod.id);
      return [
        ...prev,
        {
          id: mod.id,
          name: mod.name,
          price: mod.price,
          ebriza_sku: mod.ebriza_sku,
        },
      ];
    });
  };

  const handleConfirmModal = () => {
    if (!selectedProduct) return;
    handleAdd(selectedProduct, selectedModifiers, itemNote, itemQty);
    setSelectedProduct(null);
  };

  const tabs = [
    { id: ALL_TAB, name: "TOT MENIUL" },
    ...MENU_SECTIONS.map(({ category }) => ({ id: category.id, name: category.name })),
  ];

  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito pb-24">
      {/* TOP HEADER / APP BAR (fixed height: HEADER_HEIGHT) */}
      <header
        style={{ height: HEADER_HEIGHT }}
        className="sticky top-0 z-40 bg-[#332420] text-[#F5E6CC] border-b-2 border-[#332420] px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md"
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
            <div
              className="hidden lg:flex items-center gap-2 text-xs font-nunito font-bold"
              aria-label="Program"
            >
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
            className="relative bg-[#790D20] text-[#F5E6CC] px-4 py-2 rounded-lg font-bebas text-xl tracking-wide flex items-center gap-2 border-2 border-[#F5E6CC] shadow-[3px_3px_0px_0px_#F5E6CC] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
          >
            <ShoppingBag className="w-5 h-5"/>
            <span>COȘ</span>
            {totalItems > 0 && (
              <span
                key={badgeBump}
                className={`absolute -top-2 -right-2 bg-[#F5E6CC] text-[#332420] font-mono text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#332420] ${
                  badgeBump > 0 ? "animate-badge-pop" : ""
                }`}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO: title + stickers + COMANDĂ; the lightbox menu board sits on the right (below on mobile) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6 md:pt-16 lg:pt-20 grid grid-cols-1 md:grid-cols-2 md:items-center gap-6 md:gap-8 lg:gap-14 md:min-h-[min(calc(100svh-9rem),52rem)]">
        <div className="flex flex-col items-start">
          <h1 className="font-bebas text-5xl sm:text-7xl md:text-5xl lg:text-7xl xl:text-8xl leading-[0.9] tracking-wide text-[#332420]">
            NU FACEM MEDIUM.
            <br />
            FACEM <span className="text-[#790D20]">CRUSTĂ.</span>
          </h1>
          <p className="font-nunito font-semibold text-base sm:text-lg text-[#332420] mt-4 max-w-md">
            Smash burgeri din Sector 6. Comanzi aici, fără comisioane.
          </p>

          {/* Mobile sticker stack (pure SVG, no cart state) */}
          <div className="self-center my-5 md:hidden">
            <StickerStack size={112} modalOpen={!!selectedProduct} onPick={handleOpenModal} />
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
          <MenuBoard lit={status ? status.open : false} linkedNames={BOARD_LINKED_NAMES} onLineActive={handleBoardLine} />
          {/* md+: stickers slapped over the board's top corner (scaled down at md) */}
          <div className="hidden md:block absolute -top-14 -right-4 lg:-top-16 lg:-right-4 xl:-right-10 z-10 origin-top-right md:scale-[0.65] lg:scale-100">
            <StickerStack ref={stickersRef} size={104} modalOpen={!!selectedProduct} onPick={handleOpenModal} />
          </div>
        </div>
      </section>

      {/* Curved double red stripe (from the board) closes the hero */}
      <div aria-hidden className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-3 border-y-[3px] border-[#790D20] rounded-tr-3xl rounded-bl-3xl" />
      </div>
      <div className="h-4 lg:h-6" />

      {/* CATEGORIES STICKY BAR: scrolls to each section, highlights the current one */}
      <nav
        ref={barRef}
        aria-label="Categorii meniu"
        style={{ top: HEADER_HEIGHT }}
        className="sticky z-30 bg-[#F5E6CC] border-b-2 border-[#332420] px-4 py-3 shadow-sm overflow-x-auto"
      >
        <div className="w-max mx-auto flex gap-3">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-tab={tab.id}
                aria-current={active ? "true" : undefined}
                onClick={() => scrollToTab(tab.id)}
                className={`font-bebas text-xl tracking-wide px-5 py-2 rounded-lg transition-all whitespace-nowrap border-2 border-[#332420] ${
                  active
                    ? "bg-[#790D20] text-[#F5E6CC] shadow-[3px_3px_0px_0px_#332420]"
                    : "bg-[#F5E6CC] text-[#332420] hover:bg-[#332420]/10"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* FULL MENU: one section per category */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <TodayAtBurgerash status={status} />

        <div ref={menuTopRef} id="meniu" className="mb-8">
          <p className="font-mono text-xs font-bold tracking-widest text-[#790D20]">COMANDĂ ONLINE</p>
          <h2 className="font-bebas text-5xl sm:text-6xl tracking-wide text-[#332420] leading-none">
            MENIU
          </h2>
        </div>

        <div className="space-y-14">
          {MENU_SECTIONS.map(({ category, products }) => (
            <section key={category.id} id={sectionDomId(category.id)} aria-labelledby={`${sectionDomId(category.id)}-title`}>
              <div className="flex items-center gap-4 mb-6">
                <h3
                  id={`${sectionDomId(category.id)}-title`}
                  className="font-bebas text-4xl tracking-wide text-[#332420] shrink-0"
                >
                  {category.name}
                </h3>
                <div className="flex-1 h-2 border-y-2 border-[#332420]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAdd(product)}
                    onCustomize={isCustomizable(product) ? () => handleOpenModal(product) : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* SECȚIUNEA LOCAȚIE & PROGRAM */}
        <section
          id="location"
          className="mt-20 grid grid-cols-1 md:grid-cols-2 border-4 border-[#332420] rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#332420]"
        >
          <div className="bg-[#332420] text-[#F5E6CC] p-8 md:p-10">
            <div className="inline-flex items-center gap-2 text-[#F5E6CC] font-mono text-xs font-bold mb-2">
              <MapPin className="w-4 h-4"/>
              <span>CARTIERUL CRUSTEI</span>
            </div>
            <h3 className="font-bebas text-5xl tracking-wide mb-4 text-[#F5E6CC]">
              UNDE GĂSEȘTI CRUSTA
            </h3>
            <p className="font-nunito font-bold text-base text-[#F5E6CC]/80 mb-6">
              Fix lângă liceu, în Sector 6, București. Urmărește mirosul de vită Black Angus caramelizată pe plită.
            </p>
            <div className="font-mono text-sm space-y-1.5 border-t border-[#F5E6CC]/20 pt-4">
              <p className="text-[#F5E6CC] font-bold">PROGRAMUL DE FOC:</p>
              {scheduleLines().map((l) => (
                <p key={l.label}>
                  {l.label}: {l.hours}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-[#790D20] text-[#F5E6CC] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h3 className="font-bebas text-5xl tracking-wide mb-4">
                LIVRARE PROPRIE & PICKUP
              </h3>
              <p className="font-nunito font-bold text-base text-[#F5E6CC]/90 mb-6">
                Comandă direct de pe site fără comisioane ascunse. Livrare gratuită în cartier la comenzi de peste 120 LEI sau ridicare direct de la geam în 15 minute.
              </p>
            </div>
            <button
              onClick={openCart}
              className="self-start bg-[#F5E6CC] text-[#332420] font-bebas text-2xl px-8 py-3.5 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-white transition-all"
            >
              DESCHIDE COȘUL DE COMANDĂ
            </button>
          </div>
        </section>
      </main>

      {/* MODAL PERSONALIZARE BURGER (MODIFIERS) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F5E6CC] border-4 border-[#332420] rounded-xl max-w-lg w-full shadow-[8px_8px_0px_0px_#332420] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="brand-scroll flex-1 min-h-0 overflow-y-auto p-6">
              <div className="flex justify-between items-start border-b-2 border-[#332420] pb-3 mb-4">
                <div>
                  <span className="font-mono text-xs text-[#790D20] font-bold">
                    PERSONALIZEAZĂ BURGERUL
                  </span>
                  <h3 className="font-bebas text-4xl text-[#332420]">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  aria-label="Închide"
                  className="p-1 text-[#332420] hover:text-[#790D20]"
                >
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <div className="flex justify-center mb-4">
                <BurgerStamp product={selectedProduct} className="h-36 w-36 rotate-[-6deg]" />
              </div>
              {selectedProduct.description && (
                <p className="font-nunito text-sm text-[#332420]/80 text-center max-w-sm mx-auto mb-4">
                  {selectedProduct.description}
                </p>
              )}

              <div className="space-y-4">
                {(
                  [
                    { title: "EXTRA", mods: INITIAL_MODIFIERS.filter((m) => m.price > 0) },
                    { title: "FĂRĂ", mods: INITIAL_MODIFIERS.filter((m) => m.price === 0) },
                  ] as const
                ).map((group) => (
                  <div key={group.title}>
                    <p className="font-bebas text-xl text-[#332420] mb-2">{group.title}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {group.mods.map((mod) => {
                        const checked = selectedModifiers.some((m) => m.id === mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModifier(mod)}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 border-[#332420] font-nunito font-bold text-sm transition-all ${
                              checked
                                ? "bg-[#790D20] text-white"
                                : "bg-white text-[#332420] hover:bg-white/80"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded flex items-center justify-center border ${
                                  checked
                                    ? "bg-white text-[#790D20] border-white"
                                    : "border-[#332420]"
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]"/>}
                              </span>
                              {mod.name}
                            </span>
                            {mod.price > 0 && (
                              <span className="font-mono text-xs">+{formatLei(mod.price)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">
                    NOTĂ PENTRU BUCĂTĂRIE:
                  </label>
                  <input
                    type="text"
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="Ex: bine făcut, sosul separat..."
                    className="w-full border-2 border-[#332420] rounded-lg p-2.5 bg-white font-nunito font-semibold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 p-4 border-t-4 border-[#332420] bg-[#F5E6CC]">
              <div className="flex items-center gap-3 bg-white border-2 border-[#332420] rounded-lg px-3 py-1.5">
                <button
                  type="button"
                  aria-label="Scade cantitatea"
                  onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                  className="font-mono font-black text-lg px-2"
                >
                  −
                </button>
                <span className="font-mono font-bold text-base">{itemQty}</span>
                <button
                  type="button"
                  aria-label="Crește cantitatea"
                  onClick={() => setItemQty(itemQty + 1)}
                  className="font-mono font-black text-lg px-2"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmModal}
                className="bg-[#790D20] text-white font-bebas text-2xl px-5 py-3 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-[#332420] transition-all whitespace-nowrap"
              >
                ADAUGĂ ·{" "}
                {formatLei(
                  (selectedProduct.price + selectedModifiers.reduce((sum, m) => sum + m.price, 0)) * itemQty,
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER + ACCES RAPID PANOURI OPERAȚIONALE */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t-2 border-[#332420]/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#332420]/70">
        <div>
          <p className="font-bold text-[#332420]">
            GOOD BURGERS /// GOOD PEOPLE /// ALWAYS
          </p>
          <p className="mt-1">© 2026 Burgerash. Toate drepturile rezervate.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider opacity-60 mr-1">
            Staff Apps:
          </span>
          <Link className="px-2.5 py-1 rounded border border-[#332420]/40 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors" href="/kitchen">
            /kitchen
          </Link>
          <Link className="px-2.5 py-1 rounded border border-[#332420]/40 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors" href="/dispatch">
            /dispatch
          </Link>
          <Link className="px-2.5 py-1 rounded border border-[#332420]/40 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors" href="/rider">
            /rider
          </Link>
          <Link className="px-2.5 py-1 rounded border border-[#332420]/40 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors" href="/admin">
            /admin
          </Link>
        </div>
      </footer>

      {/* TOAST: added to cart (does not open the drawer) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed z-50 left-4 right-4 bottom-24 md:left-auto md:right-6 md:bottom-6 pointer-events-none flex justify-center md:justify-end"
      >
        {toast && (
          <div
            key={toast.key}
            className="animate-toast-in pointer-events-auto flex items-center gap-4 bg-[#332420] text-[#F5E6CC] border-2 border-[#F5E6CC] rounded-lg px-4 py-3 shadow-[4px_4px_0px_0px_#790D20]"
          >
            <Check className="w-5 h-5 shrink-0 stroke-[3]" />
            <div className="min-w-0">
              <p className="font-nunito font-black text-sm leading-tight">Adăugat în coș</p>
              <p className="font-mono text-[11px] text-[#F5E6CC]/70 truncate">{toast.name}</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCartFromToast}
              className="font-nunito font-extrabold text-sm underline underline-offset-4 whitespace-nowrap hover:text-[#F5E6CC]/80"
            >
              Vezi coșul
            </button>
          </div>
        )}
      </div>

      {/* MOBILE STICKY CART BAR (<768px) */}
      {totalItems > 0 && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#F5E6CC] border-t-2 border-[#332420] px-4 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={openCart}
            className="w-full flex items-center justify-between gap-3 bg-[#790D20] text-[#F5E6CC] font-bebas text-2xl tracking-wide px-5 py-3 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] active:translate-y-[1px] transition-all"
          >
            <span>
              COȘ (
              <span key={badgeBump} className={`inline-block ${badgeBump > 0 ? "animate-badge-pop" : ""}`}>
                {totalItems}
              </span>
              ) · {formatLei(grandTotal)}
            </span>
            <ArrowRight className="w-6 h-6 stroke-[3]" aria-hidden="true" />
          </button>
        </div>
      )}

      <CartDrawer/>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  onCustomize,
}: {
  product: Product;
  onAdd: () => void;
  onCustomize?: () => void;
}) {
  return (
    <div className="bg-white border-2 border-[#332420] rounded-xl p-5 flex flex-col justify-between shadow-[5px_5px_0px_0px_#332420] hover:translate-y-[-3px] transition-all relative group">
      <div>
        {/* Sticker instead of photo (photos kept in public/images/menu for later) */}
        <div className="w-full h-52 mb-4 flex items-center justify-center bg-[#F5E6CC]/50 rounded-lg border border-[#332420]/15">
          <BurgerStamp
            product={product}
            className="h-44 w-44 rotate-[-6deg] group-hover:rotate-0 transition-transform duration-300 drop-shadow-[4px_4px_0px_rgba(51,36,32,0.25)]"
          />
        </div>

        <h4 className="font-bebas text-3xl tracking-wide text-[#332420] mb-2">{product.name}</h4>

        <p className="font-nunito font-bold text-sm text-[#332420]/75 mb-6">{product.description}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-[#332420]/10 mt-auto gap-2">
        <div>
          <span className="text-[10px] font-mono text-[#332420]/60 block">
            {product.weight_grams ? `GRAMAJ ${product.weight_grams}G` : "PREȚ"}
          </span>
          <span className="font-nunito font-black text-2xl text-[#332420]">
            {product.price} <span className="text-sm font-bold">LEI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCustomize && (
            <button
              type="button"
              onClick={onCustomize}
              className="bg-[#F5E6CC] text-[#332420] border-2 border-[#332420] px-3 py-2.5 rounded-lg font-bebas text-base flex items-center gap-1 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors"
              title="Personalizează ingredientele"
            >
              <SlidersHorizontal className="w-4 h-4"/>
              <span>EXTRA</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAdd}
            className="bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] px-4 py-2.5 rounded-lg font-bebas text-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#332420] hover:bg-[#332420] active:translate-y-[1px] transition-all"
          >
            <Plus className="w-5 h-5 stroke-[3]"/>
            <span>ADAUGĂ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
