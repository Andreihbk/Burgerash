"use client";

import { useState } from "react";
import Link from "next/link";
import { INITIAL_CATEGORIES, INITIAL_MODIFIERS, INITIAL_PRODUCTS } from "@/lib/catalog";
import { useCartStore } from "@/store/cartStore";
import { BurgerStamp } from "./BurgerStamp";
import CartDrawer from "./CartDrawer";
import { OrderItemModifier, Product } from "@/types/database";
import { ShoppingBag, Plus, Clock, SlidersHorizontal, X, Check, MapPin, Flame } from "lucide-react";

export default function Storefront() {
  const [activeCategory, setActiveCategory] = useState<string>("cat-burgers");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  const [itemNote, setItemNote] = useState<string>("");
  const [itemQty, setItemQty] = useState<number>(1);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartStore((state) => state.getTotalItemsCount());

  const filteredProducts = INITIAL_PRODUCTS.filter(
    (p) => p.category_id === activeCategory && p.is_available
  );

  const isCustomizable = (product: Product) =>
    product.category_id === "cat-burgers" || product.category_id === "cat-chicken";

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
    addItem(selectedProduct, selectedModifiers, itemNote, itemQty);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] font-nunito pb-24">
      {/* TOP HEADER / APP BAR */}
      <header className="sticky top-0 z-40 bg-[#332420] text-[#F5E6CC] border-b-2 border-[#332420] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#790D20] border-2 border-[#F5E6CC] flex items-center justify-center font-bebas text-2xl text-white">
            B
          </div>
          <div>
            <h1 className="font-bebas tracking-wider text-2xl leading-none">
              BURGERASH
            </h1>
            <p className="text-[10px] tracking-widest font-mono text-[#F5E6CC]/70 mt-0.5">
              HAND CRAFTED SMASH BURGERS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#lightboard"
            className="hidden md:inline-block font-bebas text-lg tracking-wider text-[#F5E6CC]/80 hover:text-white transition-colors"
          >
            PANOU MENIU
          </a>
          <a
            href="#location"
            className="hidden md:inline-block font-bebas text-lg tracking-wider text-[#F5E6CC]/80 hover:text-white transition-colors"
          >
            LOCAȚIE
          </a>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-[#F5E6CC]/10 px-3 py-1.5 rounded-full border border-[#F5E6CC]/20">
            <Clock className="w-3.5 h-3.5 text-[#E23D28]"/>
            <span>Gata în ~15 min</span>
          </div>

          <button
            onClick={openCart}
            className="relative bg-[#790D20] text-white px-4 py-2 rounded-lg font-bebas text-xl tracking-wide flex items-center gap-2 border-2 border-[#F5E6CC] shadow-[3px_3px_0px_0px_#121212] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
          >
            <ShoppingBag className="w-5 h-5"/>
            <span>COȘ</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F5E6CC] text-[#332420] font-mono text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#332420]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO SPLIT: TEXT + VIDEO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-[#332420] bg-[#F5E6CC]">
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-[#332420]">
          <div className="inline-flex items-center gap-2 self-start bg-[#790D20] text-[#F5E6CC] font-mono text-xs font-bold tracking-widest px-3 py-1.5 mb-6 shadow-[3px_3px_0px_0px_#332420]">
            <Flame className="w-4 h-4"/>
            <span>100% VITĂ BLACK ANGUS PRESATĂ PE PLITĂ</span>
          </div>

          <h2 className="font-bebas text-6xl sm:text-8xl leading-[0.88] tracking-wide mb-6 text-[#332420]">
            FOC. PRESĂ. <br />
            <span className="text-[#790D20]">CRUSTĂ.</span> ATÂT.
          </h2>

          <p className="font-nunito font-bold text-base sm:text-lg text-[#332420]/80 max-w-xl mb-8">
            Nu facem povești, facem crustă. Burgerul care a cucerit cartierul — comandă direct aici pentru ridicare rapidă sau livrare la ușă.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#menu-grid"
              className="bg-[#790D20] text-white font-bebas text-2xl tracking-wider px-8 py-4 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] transition-all"
            >
              COMANDĂ ACUM
            </a>
            <a
              href="#lightboard"
              className="bg-[#F5E6CC] text-[#332420] font-bebas text-2xl tracking-wider px-8 py-4 rounded-lg border-2 border-[#332420] shadow-[4px_4px_0px_0px_#332420] hover:bg-[#332420] hover:text-[#F5E6CC] transition-all"
            >
              VEZI PANOUL DE PREȚURI
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-[480px] bg-[#332420] overflow-hidden flex items-center justify-center">
          <video
            src="/videos/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            poster="/images/burger-hero.png"
            className="object-cover w-full h-full absolute inset-0 opacity-90"
          />
          <div className="relative z-10 p-6 mt-auto w-full bg-gradient-to-t from-black/80 via-black/30 to-transparent text-[#F5E6CC]">
            <p className="font-bebas text-2xl tracking-wide">
              GOOD BURGERS /// GOOD PEOPLE /// ALWAYS
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES STICKY BAR */}
      <div
        id="menu-grid"
        className="sticky top-[74px] z-30 bg-[#F5E6CC] border-b-2 border-[#332420] px-4 py-3 shadow-sm overflow-x-auto"
      >
        <div className="max-w-6xl mx-auto flex gap-3 justify-start sm:justify-center">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`font-bebas text-xl tracking-wide px-5 py-2 rounded-lg transition-all whitespace-nowrap border-2 ${
                activeCategory === cat.id
                  ? "bg-[#790D20] text-white border-[#332420] shadow-[3px_3px_0px_0px_#332420]"
                  : "bg-white text-[#332420] border-[#332420] hover:bg-[#332420]/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS INTERACTIVE CARDS */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-[#332420] rounded-xl p-5 flex flex-col justify-between shadow-[5px_5px_0px_0px_#332420] hover:translate-y-[-3px] transition-all relative group"
            >
              <div>
                {/* Sticker instead of photo (photos kept in public/images/menu for later) */}
                <div className="w-full h-52 mb-4 flex items-center justify-center bg-[#F5E6CC]/50 rounded-lg border border-[#332420]/15">
                  <BurgerStamp
                    product={product}
                    className="h-44 w-44 rotate-[-6deg] group-hover:rotate-0 transition-transform duration-300 drop-shadow-[4px_4px_0px_rgba(51,36,32,0.25)]"
                  />
                </div>

                <div className="mb-2">
                  <h3 className="font-bebas text-3xl tracking-wide text-[#332420]">
                    {product.name}
                  </h3>
                </div>

                <p className="font-nunito font-bold text-sm text-[#332420]/75 mb-6">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-[#332420]/10 mt-auto gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[#332420]/60 block">
                    {product.weight_grams ? `GRAMAJ ${product.weight_grams}G` : "PREȚ"}
                  </span>
                  <span className="font-nunito font-black text-2xl text-[#332420]">
                    {product.price} <span className="text-sm font-bold">RON</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCustomizable(product) && (
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="bg-[#F5E6CC] text-[#332420] border-2 border-[#332420] px-3 py-2.5 rounded-lg font-bebas text-base flex items-center gap-1 hover:bg-[#332420] hover:text-[#F5E6CC] transition-colors"
                      title="Personalizează ingredientele"
                    >
                      <SlidersHorizontal className="w-4 h-4"/>
                      <span>EXTRA</span>
                    </button>
                  )}

                  <button
                    onClick={() => addItem(product)}
                    className="bg-[#790D20] text-white border-2 border-[#332420] px-4 py-2.5 rounded-lg font-bebas text-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#332420] hover:bg-[#332420] active:translate-y-[1px] transition-all"
                  >
                    <Plus className="w-5 h-5 stroke-[3]"/>
                    <span>ADAUGĂ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PANOUL LUMINOS RETRO (CA ÎN POZA OFICIALĂ DIN LOCAȚIE) */}
        <section id="lightboard" className="mt-20 max-w-xl mx-auto">
          <div className="bg-[#790D20] p-4 rounded-xl shadow-[10px_10px_0px_0px_#332420] border-4 border-[#332420]">
            <div className="bg-[#FFF5DE] text-[#790D20] p-6 sm:p-10 rounded-lg shadow-inner border-2 border-[#790D20]/30 relative">
              {/* Header Panou */}
              <div className="text-center mb-8">
                <div className="inline-flex flex-col items-center">
                  <div className="w-14 h-12 border-4 border-[#790D20] rounded-t-full mb-1 relative flex flex-col justify-end p-1 gap-0.5">
                    <div className="h-1 bg-[#790D20] w-full rounded" />
                    <div className="h-1 bg-[#790D20] w-full rounded" />
                  </div>
                  <h2 className="font-nunito font-black text-4xl sm:text-5xl tracking-tight text-[#790D20]">
                    burgerash
                  </h2>
                  <p className="font-nunito font-bold text-xs tracking-widest text-[#332420]">
                    hand crafted burgers
                  </p>
                </div>
              </div>

              {/* Secțiunile Panoului Luminos */}
              <div className="space-y-6">
                {[
                  {
                    title: "BURGERS",
                    items: [
                      { name: "CLASIC", price: 36 },
                      { name: "HOT BOY", price: 39 },
                      { name: "DUBLE", price: 46 },
                    ],
                  },
                  {
                    title: "CHICKEN",
                    items: [
                      { name: "CHICKEN BURGER", price: 38 },
                      { name: "HOT HONEY", price: 38 },
                    ],
                  },
                  {
                    title: "SIDES & SAUCES",
                    items: [
                      { name: "FRIES", price: 13 },
                      { name: "SAUCES", price: 5 },
                    ],
                  },
                  {
                    title: "DRINKS",
                    items: [
                      { name: "COLA", price: 9 },
                      { name: "FANTA", price: 9 },
                      { name: "SPRITE", price: 9 },
                      { name: "WATER", price: 8 },
                    ],
                  },
                ].map((group) => (
                  <div key={group.title} className="relative pr-5">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bebas text-2xl tracking-wider text-[#332420] shrink-0">
                        {group.title}
                      </h3>
                      <div className="flex-1 h-2 border-y-2 border-[#790D20] rounded-tr-xl" />
                    </div>
                    <div className="space-y-1.5 pl-1 border-r-4 border-double border-[#790D20] pr-4">
                      {group.items.map((it) => (
                        <div
                          key={it.name}
                          className="flex justify-between items-center font-nunito font-black text-base text-[#332420]"
                        >
                          <span>{it.name}</span>
                          <span>{it.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Panou Luminos */}
              <div className="mt-8 pt-4 border-t-4 border-double border-[#790D20] flex justify-end">
                <div className="font-nunito font-black text-xs tracking-widest text-[#332420] leading-tight text-right">
                  <p>GOOD BURGERS</p>
                  <p>GOOD PEOPLE</p>
                  <p>ALWAYS</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECȚIUNEA LOCAȚIE & PROGRAM */}
        <section
          id="location"
          className="mt-20 grid grid-cols-1 md:grid-cols-2 border-4 border-[#332420] rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#332420]"
        >
          <div className="bg-[#332420] text-[#F5E6CC] p-8 md:p-10">
            <div className="inline-flex items-center gap-2 text-[#E23D28] font-mono text-xs font-bold mb-2">
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
              <p className="text-[#E23D28] font-bold">PROGRAMUL DE FOC:</p>
              <p>Luni - Vineri: 10:00 - 22:00</p>
              <p>Sâmbătă - Duminică: 12:00 - 00:00</p>
            </div>
          </div>

          <div className="bg-[#790D20] text-[#F5E6CC] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h3 className="font-bebas text-5xl tracking-wide mb-4">
                LIVRARE PROPRIE & PICKUP
              </h3>
              <p className="font-nunito font-bold text-base text-[#F5E6CC]/90 mb-6">
                Comandă direct de pe site fără comisioane ascunse. Livrare gratuită în cartier la comenzi de peste 120 RON sau ridicare direct de la geam în 15 minute.
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
          <div className="bg-[#F5E6CC] border-4 border-[#332420] rounded-xl max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_#332420] max-h-[90vh] overflow-y-auto">
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
                className="p-1 text-[#332420] hover:text-[#790D20]"
              >
                <X className="w-6 h-6"/>
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <BurgerStamp product={selectedProduct} className="h-36 w-36 rotate-[-6deg]" />
            </div>

            <div className="space-y-4">
              <p className="font-bebas text-xl text-[#332420]">
                ADAUGĂ EXTRA SAU SCOATE INGREDIENTE:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {INITIAL_MODIFIERS.map((mod) => {
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
                      <span className="font-mono text-xs">
                        {mod.price > 0 ? `+${mod.price} RON` : "GRATIS"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">
                  NOTĂ PENTRU BUCĂTĂRIE (KDS):
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Ex: bine făcut, sosul separat..."
                  className="w-full border-2 border-[#332420] rounded-lg p-2.5 bg-white font-nunito font-semibold text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-[#332420]">
                <div className="flex items-center gap-3 bg-white border-2 border-[#332420] rounded-lg px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                    className="font-mono font-black text-lg px-2"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base">{itemQty}</span>
                  <button
                    type="button"
                    onClick={() => setItemQty(itemQty + 1)}
                    className="font-mono font-black text-lg px-2"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmModal}
                  className="bg-[#790D20] text-white font-bebas text-2xl px-6 py-3 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-[#332420] transition-all"
                >
                  ADAUGĂ ÎN COȘ —{" "}
                  {(
                    (selectedProduct.price +
                      selectedModifiers.reduce((s, m) => s + m.price, 0)) *
                    itemQty
                  ).toFixed(0)}{" "}
                  RON
                </button>
              </div>
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

      <CartDrawer/>
    </div>
  );
}