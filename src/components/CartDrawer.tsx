"use client";

import { useCartStore } from "@/store/cartStore";
import { isOrderingEnabled } from "@/lib/ordering";
import { useOpeningStatus } from "@/lib/useOpeningStatus";
import { useSoldOutIds } from "@/lib/useSoldOut";
import { useCartHydrated } from "@/store/useCartHydrated";
import { X, ShoppingBag } from "lucide-react";
import { Display } from "@/components/Display";
import { CartFooter, CartStep } from "./cart/CartStep";
import CheckoutForm from "./cart/CheckoutForm";
import SuccessStep from "./cart/SuccessStep";
import { useCheckout } from "./cart/useCheckout";

/** Cart drawer shell: header, the current step (cart / checkout / success) and the cart footer. Parts in ./cart (audit R14). */
export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const hydrated = useCartHydrated();
  const openingStatus = useOpeningStatus();
  const orderingOff = !isOrderingEnabled();
  const isClosed = openingStatus !== null && !openingStatus.open;
  const soldOutIds = useSoldOutIds();
  const hasSoldOut = items.some((i) => soldOutIds.has(i.product.id));
  const checkout = useCheckout({ orderingOff, isClosed, hasSoldOut });

  if (!isOpen || !hydrated) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeCart} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md">
        <div className="w-full min-w-0 bg-sand border-l-4 border-charcoal flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="bg-wine text-sand px-6 py-4 flex items-center justify-between border-b-2 border-charcoal">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-sand" />
              <h2 className="font-display text-2xl tracking-wide"><Display>COȘUL TĂU</Display></h2>
            </div>
            <button onClick={closeCart} className="text-sand hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="brand-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {checkout.step === "success" ? (
              <SuccessStep
                orderNumber={checkout.orderNumber}
                publicToken={checkout.publicToken}
                onBackToMenu={() => {
                  checkout.setStep("cart");
                  closeCart();
                }}
              />
            ) : checkout.step === "cart" ? (
              <CartStep orderingOff={orderingOff} isClosed={isClosed} openingStatus={openingStatus} soldOutIds={soldOutIds} />
            ) : (
              <CheckoutForm checkout={checkout} orderingOff={orderingOff} isClosed={isClosed} hasSoldOut={hasSoldOut} />
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && checkout.step === "cart" && (
            <CartFooter hasSoldOut={hasSoldOut} onContinue={checkout.startCheckout} />
          )}
        </div>
      </div>
    </div>
  );
}