"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { normalizeRoPhone, PHONE_ERROR } from "@/lib/phone";
import { ORDERING_CLOSED_BANNER } from "@/lib/ordering";
import { EMAIL_ERROR, isValidEmail } from "@/lib/email";
import { saveLastOrder } from "@/lib/last-order";
import { HONEYPOT_FIELD } from "@/lib/bot-check";
import { RATE_LIMITED_MESSAGE, TERMS_ERROR } from "@/lib/order-input";

const ERROR_TEXT = "Nu am putut trimite comanda. Încearcă din nou în câteva secunde.";

/** Error codes from /api/orders that must be shown as a sentence, not as the raw code. */
const ERROR_CODE_TEXT: Record<string, string> = {
  rate_limited: RATE_LIMITED_MESSAGE,
  ordering_closed: ORDERING_CLOSED_BANNER,
};

export type CheckoutStep = "cart" | "checkout" | "success";

/**
 * Cart drawer state that is not in the cart store: current step, checkout form, validation, submit to /api/orders.
 * Lives in CartDrawer (always mounted), so the form survives closing and reopening the drawer.
 */
export function useCheckout({ orderingOff, isClosed, hasSoldOut }: { orderingOff: boolean; isClosed: boolean; hasSoldOut: boolean }) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    details: "",
    note: "",
    paymentMethod: "card_on_delivery" as "cash_on_delivery" | "card_on_delivery" | "online_card",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [publicToken, setPublicToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  // When the checkout step was opened (bot timing check, see lib/bot-check.ts).
  const [checkoutOpenedAt, setCheckoutOpenedAt] = useState<number | null>(null);

  const startCheckout = () => {
    setStep("checkout");
    setCheckoutOpenedAt(Date.now());
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderingOff || isClosed || hasSoldOut) return;
    if (!termsAccepted) {
      setErrorMessage(TERMS_ERROR);
      return;
    }
    const honeypot = new FormData(e.currentTarget as HTMLFormElement).get(HONEYPOT_FIELD);
    const phone = normalizeRoPhone(formData.phone);
    if (!phone) {
      setPhoneError(PHONE_ERROR);
      return;
    }
    setPhoneError("");
    const email = formData.email.trim();
    if (email && !isValidEmail(email)) {
      setEmailError(EMAIL_ERROR);
      return;
    }
    setEmailError("");
    setIsSubmitting(true);
    setErrorMessage("");

    const { items, fulfillmentType, pickupTime, cutlerySets, tipAmount, getSubtotal, getDeliveryFee, getGrandTotal } =
      useCartStore.getState();
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const grandTotal = getGrandTotal();

    try {
      const payload = {
        fulfillment_type: fulfillmentType,
        payment_method: formData.paymentMethod,
        customer_name: formData.name,
        customer_phone: phone,
        customer_email: email || null,
        delivery_address: fulfillmentType === "delivery" ? formData.address : "Ridicare personală din restaurant",
        delivery_details: formData.details || null,
        // Pickup slot travels in the note until the backend has its own field.
        order_note: [fulfillmentType === "pickup" && pickupTime ? `Ridicare la ${pickupTime}` : null, formData.note || null].filter(Boolean).join(" · ") || null,
        subtotal,
        delivery_fee: deliveryFee,
        tip_amount: tipAmount,
        total_amount: grandTotal,
        cutlery_sets: cutlerySets,
        terms_accepted: termsAccepted,
        form_elapsed_ms: checkoutOpenedAt === null ? 0 : Date.now() - checkoutOpenedAt,
        [HONEYPOT_FIELD]: typeof honeypot === "string" ? honeypot : "",
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          ebriza_sku: i.product.ebriza_sku,
          quantity: i.quantity,
          unit_price: i.unitPriceWithModifiers,
          total_price: i.unitPriceWithModifiers * i.quantity,
          modifiers: i.modifiers,
          note: i.note,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const code = typeof data.error === "string" ? data.error : "";
        throw new Error(ERROR_CODE_TEXT[code] ?? (res.status < 500 && code ? code : ERROR_TEXT));
      }

      const number = data.order_number || "BRG-999";
      setOrderNumber(number);
      const token = typeof data.public_token === "string" ? data.public_token : "";
      setPublicToken(token);
      if (token) saveLastOrder({ token, orderNumber: number });
      useCartStore.getState().clearCart();
      setStep("success");
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : ERROR_TEXT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    startCheckout,
    formData,
    setFormData,
    termsAccepted,
    setTermsAccepted,
    isSubmitting,
    orderNumber,
    publicToken,
    errorMessage,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    handleCheckoutSubmit,
  };
}

export type Checkout = ReturnType<typeof useCheckout>;
