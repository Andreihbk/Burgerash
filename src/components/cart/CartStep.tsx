"use client";

import { useCartStore } from "@/store/cartStore";
import { ORDERING_CLOSED_BANNER } from "@/lib/ordering";
import { closedCartNotice } from "@/lib/hours";
import { formatLei } from "@/lib/format";
import type { useOpeningStatus } from "@/lib/useOpeningStatus";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Display } from "@/components/Display";
import CartUpsell from "@/components/storefront/CartUpsell";
import PickupTimePicker from "@/components/storefront/PickupTimePicker";
import FreeDeliveryBar from "@/components/storefront/FreeDeliveryBar";

/** Step 1: banners, delivery/pickup toggle, items, upsell, cutlery and tip. */
export function CartStep({
  orderingOff,
  isClosed,
  openingStatus,
  soldOutIds,
}: {
  orderingOff: boolean;
  isClosed: boolean;
  openingStatus: ReturnType<typeof useOpeningStatus>;
  soldOutIds: ReadonlySet<string>;
}) {
  const {
    items,
    fulfillmentType,
    setFulfillmentType,
    cutlerySets,
    setCutlerySets,
    tipAmount,
    setTipAmount,
    updateQuantity,
    removeItem,
  } = useCartStore();

  return (
    <div>
      {orderingOff && (
        <div
          role="status"
          className="mb-4 rounded-lg border-2 border-wine bg-wine/10 p-3 font-nunito text-sm font-bold text-charcoal"
        >
          {ORDERING_CLOSED_BANNER}
        </div>
      )}
      {!orderingOff && isClosed && openingStatus && (
        <div
          role="status"
          className="mb-4 rounded-lg border-2 border-wine bg-wine/10 p-3 font-nunito text-sm font-bold text-charcoal"
        >
          {closedCartNotice(openingStatus)}
        </div>
      )}
      {/* Fulfillment Type Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-charcoal/10 p-1.5 rounded-lg mb-6 border-2 border-charcoal">
        <button
          onClick={() => setFulfillmentType("delivery")}
          className={`font-display text-lg py-2 rounded transition-all ${
            fulfillmentType === "delivery"
              ? "bg-wine text-white shadow-[2px_2px_0px_0px_var(--color-charcoal)]"
              : "text-charcoal hover:bg-charcoal/5"
          }`}
        >
          <Display>LIVRARE LA ADRESĂ</Display>
        </button>
        <button
          onClick={() => setFulfillmentType("pickup")}
          className={`font-display text-lg py-2 rounded transition-all ${
            fulfillmentType === "pickup"
              ? "bg-wine text-white shadow-[2px_2px_0px_0px_var(--color-charcoal)]"
              : "text-charcoal hover:bg-charcoal/5"
          }`}
        >
          <Display>RIDICARE DIN RESTAURANT</Display>
        </button>
      </div>

      {fulfillmentType === "pickup" && items.length > 0 && <PickupTimePicker />}

      {items.length === 0 ? (
        <div className="text-center py-16 text-charcoal/60 font-nunito font-bold">
          <p className="text-lg mb-2">Coșul tău este gol momentan.</p>
          <p className="text-sm">Carnea e proaspătă, plita e caldă. Alege ceva.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white border-2 border-charcoal rounded-lg p-4 shadow-[3px_3px_0px_0px_var(--color-charcoal)] flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display text-xl text-charcoal"><Display>{item.product.name}</Display></h4>
                  {soldOutIds.has(item.product.id) && (
                    <p className="font-mono text-xs font-bold text-wine">
                      EPUIZAT - scoate-l din coș ca să continui
                    </p>
                  )}
                  <p className="font-nunito font-bold text-xs text-charcoal/60">
                    {formatLei(item.unitPriceWithModifiers)} / buc
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-wine hover:opacity-80 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {item.modifiers.length > 0 && (
                <div className="text-[11px] font-mono bg-sand p-1.5 rounded text-charcoal/80">
                  {item.modifiers.map((m) => (m.price > 0 ? `+ ${m.name}` : m.name)).join(", ")}
                </div>
              )}

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-charcoal/10">
                <div className="flex items-center gap-2 border-2 border-charcoal rounded px-2 py-0.5 bg-sand">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="text-charcoal hover:text-wine"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="text-charcoal hover:text-wine"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="font-nunito font-black text-lg text-charcoal">
                  {formatLei(item.unitPriceWithModifiers * item.quantity)}
                </span>
              </div>
            </div>
          ))}

          <CartUpsell soldOutIds={soldOutIds} />

          {/* Extras: Cutlery & Tip */}
          <div className="bg-white border-2 border-charcoal rounded-lg p-4 space-y-4 mt-6 shadow-[3px_3px_0px_0px_var(--color-charcoal)]">
            <div className="flex justify-between items-center">
              <span className="font-display text-lg"><Display>SETURI TACĂMURI (Gratis)</Display></span>
              <div className="flex items-center gap-2 border-2 border-charcoal rounded px-2 py-0.5 bg-sand">
                <button onClick={() => setCutlerySets(cutlerySets - 1)} className="hover:text-wine">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-sm w-5 text-center">{cutlerySets}</span>
                <button onClick={() => setCutlerySets(cutlerySets + 1)} className="hover:text-wine">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-charcoal/10">
              <span className="font-display text-lg"><Display>BACȘIȘ ECHIPĂ</Display></span>
              <div className="flex gap-1.5">
                {[0, 3, 5, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTipAmount(val)}
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded border-2 border-charcoal transition-all ${
                      tipAmount === val ? "bg-wine text-white" : "bg-sand text-charcoal"
                    }`}
                  >
                    {formatLei(val)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Totals + CONTINUĂ LA CHECKOUT, under the scroll area (cart step only). */
export function CartFooter({ hasSoldOut, onContinue }: { hasSoldOut: boolean; onContinue: () => void }) {
  const { fulfillmentType, tipAmount, getSubtotal, getDeliveryFee, getGrandTotal } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

  return (
    <div className="bg-white border-t-2 border-charcoal p-4 sm:p-6 space-y-2">
      <div className="flex justify-between gap-3 font-nunito font-semibold text-sm">
        <span>Subtotal produse:</span>
        <span>{formatLei(subtotal)}</span>
      </div>
      {fulfillmentType === "delivery" && (
        <>
          <div className="flex justify-between gap-3 font-nunito font-semibold text-sm">
            <span>Taxă livrare:</span>
            <span>{deliveryFee === 0 ? "GRATUIT" : formatLei(deliveryFee)}</span>
          </div>
          <FreeDeliveryBar subtotal={subtotal} />
        </>
      )}
      {tipAmount > 0 && (
        <div className="flex justify-between gap-3 font-nunito font-semibold text-sm text-wine">
          <span>Bacșiș echipă:</span>
          <span>+{formatLei(tipAmount)}</span>
        </div>
      )}
      <div className="flex justify-between gap-3 font-display text-2xl pt-2 border-t border-charcoal/10">
        <span><Display>TOTAL DE PLATĂ:</Display></span>
        <span className="text-wine"><Display>{formatLei(grandTotal)}</Display></span>
      </div>

      <button
        onClick={onContinue}
        disabled={hasSoldOut}
        className="w-full disabled:opacity-50 bg-charcoal text-sand font-display text-2xl py-4 rounded-lg shadow-[4px_4px_0px_0px_var(--color-wine)] hover:bg-wine transition-all flex items-center justify-center gap-2 mt-4"
      >
        <span><Display>CONTINUĂ LA CHECKOUT</Display></span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
