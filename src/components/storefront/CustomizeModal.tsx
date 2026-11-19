"use client";

import { useEffect, useRef, useState } from "react";
import { INITIAL_MODIFIERS } from "@/lib/catalog";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { formatLei } from "@/lib/format";
import { isOrderingEnabled } from "@/lib/ordering";
import { useIsSoldOut } from "@/lib/useSoldOut";
import { BurgerStamp } from "../BurgerStamp";
import type { OrderItemModifier, Product } from "@/types/database";
import { X, Check } from "lucide-react";

// Customize modal. Keyed by product id by the host, so its state resets on every open.
export default function CustomizeModal({ product }: { product: Product }) {
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  const [itemNote, setItemNote] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const notifyAdded = useUiStore((state) => state.notifyAdded);
  const closeCustomize = useUiStore((state) => state.closeCustomize);

  const toggleModifier = (mod: (typeof INITIAL_MODIFIERS)[0]) => {
    setSelectedModifiers((prev) => {
      if (prev.some((m) => m.id === mod.id)) return prev.filter((m) => m.id !== mod.id);
      return [...prev, { id: mod.id, name: mod.name, price: mod.price, ebriza_sku: mod.ebriza_sku }];
    });
  };

  const soldOut = useIsSoldOut(product.id);

  const handleConfirm = () => {
    if (soldOut || !isOrderingEnabled()) return;
    addItem(product, selectedModifiers, itemNote, itemQty);
    notifyAdded(product.name);
    closeCustomize();
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  // Dialog a11y: Escape closes, Tab stays inside, focus moves in on open and returns to the opener on close,
  // page scroll is locked while open.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCustomize();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [closeCustomize]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeCustomize();
      }}
    >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-title"
          className="bg-[#F5E6CC] border-4 border-[#332420] rounded-xl max-w-lg w-full shadow-[8px_8px_0px_0px_#332420] max-h-[90vh] flex flex-col overflow-hidden">
          <div className="brand-scroll flex-1 min-h-0 overflow-y-auto p-6">
            <div className="flex justify-between items-start border-b-2 border-[#332420] pb-3 mb-4">
              <div>
                <span className="font-mono text-xs text-[#790D20] font-bold">
                  PERSONALIZEAZĂ BURGERUL
                </span>
                <h3 id="customize-title" className="font-bebas text-4xl text-[#332420]">
                  {product.name}
                </h3>
              </div>
              <button
                onClick={closeCustomize}
                aria-label="Închide"
                className="p-1 text-[#332420] hover:text-[#790D20]"
              >
                <X className="w-6 h-6"/>
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <BurgerStamp product={product} className="h-36 w-36 rotate-[-6deg]" />
            </div>
            {product.description && (
              <p className="font-nunito text-sm text-[#332420]/80 text-center max-w-sm mx-auto mb-4">
                {product.description}
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
              onClick={handleConfirm}
              disabled={soldOut || !isOrderingEnabled()}
              className="bg-[#790D20] text-white font-bebas text-2xl px-5 py-3 rounded-lg border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420] hover:bg-[#332420] transition-all whitespace-nowrap disabled:bg-[#F5E6CC] disabled:text-[#790D20] disabled:border-dashed disabled:border-[#790D20] disabled:shadow-none"
            >
              {soldOut ? (
                "EPUIZAT"
              ) : (
                <>
                  ADAUGĂ ·{" "}
                  {formatLei(
                    (product.price + selectedModifiers.reduce((sum, m) => sum + m.price, 0)) * itemQty,
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}
