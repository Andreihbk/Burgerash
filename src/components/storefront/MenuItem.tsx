"use client";

import { Plus } from "lucide-react";
import { BurgerStamp } from "../BurgerStamp";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useIsSoldOut } from "@/lib/useSoldOut";
import type { Product } from "@/types/database";
import { Display } from "@/components/Display";
import { flyToCart } from "./flyToCart";
import ProductActions from "./ProductActions";
import { isCustomizable } from "./ids";

// One product, rendered once (audit R3). Phones: compact tappable row (app-style list).
// md+: the sticker card. The sticker, name and description are shared; only the small price/action
// bits that differ between the two looks exist twice (md:hidden / hidden md:*).
export default function MenuItem({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const notifyAdded = useUiStore((s) => s.notifyAdded);
  const openCustomize = useUiStore((s) => s.openCustomize);
  const soldOut = useIsSoldOut(product.id);

  return (
    <li
      className={`relative group flex items-center gap-3 bg-[#F5E6CC] border-2 border-[#332420] rounded-xl p-2.5 pr-3 shadow-[3px_3px_0px_0px_#332420] md:flex-col md:items-stretch md:gap-0 md:p-5 md:shadow-[5px_5px_0px_0px_#332420] md:hover:translate-y-[-3px] md:transition-all ${soldOut ? "opacity-60 md:opacity-100" : ""}`}
    >
      {/* Phones: the whole row opens the product detail (customize modal). */}
      <button
        type="button"
        onClick={() => openCustomize(product)}
        className="md:hidden absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#790D20]"
        aria-label={`Vezi ${product.name}, ${product.price} lei`}
      />

      {/* Sticker instead of photo (product visuals are SVG stickers, see CLAUDE.md) */}
      <div className="shrink-0 grid place-items-center w-[4.5rem] h-[4.5rem] md:w-full md:h-52 md:mb-4 rounded-lg bg-[#790D20]/10 border border-[#790D20]/20">
        <BurgerStamp
          product={product}
          className="h-16 w-16 md:h-44 md:w-44 rotate-[-6deg] md:group-hover:rotate-0 md:transition-transform md:duration-300 md:drop-shadow-[4px_4px_0px_rgba(51,36,32,0.25)]"
        />
      </div>

      <div className="flex-1 min-w-0 md:flex-none">
        <h4 className="font-bebas text-xl/tight md:text-3xl tracking-wide text-[#332420] md:mb-2">
          <Display>{product.name}</Display>
        </h4>

        <p className="font-nunito font-semibold text-xs/snug text-[#332420]/70 line-clamp-2 md:line-clamp-none md:font-bold md:text-sm md:text-[#332420]/75 md:mb-3">
          {product.description}
        </p>

        <p className="md:hidden mt-1 font-nunito font-black text-base text-[#790D20]">
          {product.price} <span className="text-xs font-bold">LEI</span>
          {product.weight_label && <span className="ml-2 font-mono text-[10px] font-normal text-[#332420]/60">{product.weight_label}</span>}
        </p>

        {product.allergens === null && (
          <p className="hidden md:block font-nunito text-xs text-[#332420]/60 mb-3">Alergeni: întreabă-ne</p>
        )}
      </div>

      <div className="relative z-10 shrink-0 md:flex md:items-center md:justify-between md:pt-4 md:border-t-2 md:border-[#332420]/10 md:mt-auto md:gap-2">
        <div className="hidden md:block">
          <span className="text-[10px] font-mono text-[#332420]/60 block">
            {product.weight_label ? `GRAMAJ ${product.weight_label}` : "PREȚ"}
          </span>
          <span className="font-nunito font-black text-2xl text-[#332420]">
            {product.price} <span className="text-sm font-bold">LEI</span>
          </span>
        </div>

        <div className="md:hidden">
          {soldOut ? (
            <span className="block font-bebas text-sm tracking-wide text-[#790D20] border-2 border-dashed border-[#790D20] rounded-md px-2 py-1">
              <Display>EPUIZAT</Display>
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                addItem(product);
                notifyAdded(product.name);
                flyToCart(e.currentTarget);
              }}
              aria-label={`Adaugă ${product.name} în coș`}
              className="grid place-items-center w-11 h-11 rounded-full bg-[#790D20] text-[#F5E6CC] border-2 border-[#332420] shadow-[2px_2px_0px_0px_#332420] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          )}
        </div>

        <div className="hidden md:block">
          <ProductActions product={product} customizable={isCustomizable(product)} />
        </div>
      </div>
    </li>
  );
}
