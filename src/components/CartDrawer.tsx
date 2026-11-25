"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { normalizeRoPhone, PHONE_ERROR } from "@/lib/phone";
import { isOrderingEnabled, ORDERING_CLOSED_BANNER } from "@/lib/ordering";
import { useOpeningStatus } from "@/lib/useOpeningStatus";
import { useSoldOutIds } from "@/lib/useSoldOut";
import { useCartHydrated } from "@/store/useCartHydrated";
import { formatLei } from "@/lib/format";
import { EMAIL_ERROR, isValidEmail } from "@/lib/email";
import { closedCartNotice } from "@/lib/hours";
import { saveLastOrder } from "@/lib/last-order";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import { Display } from "@/components/Display";
import CartUpsell from "@/components/storefront/CartUpsell";
import PickupTimePicker from "@/components/storefront/PickupTimePicker";
import FreeDeliveryBar from "@/components/storefront/FreeDeliveryBar";
import { HONEYPOT_FIELD } from "@/lib/bot-check";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal";
import { ORDER_LIMITS, RATE_LIMITED_MESSAGE, TERMS_ERROR } from "@/lib/order-input";

const ERROR_TEXT = "Nu am putut trimite comanda. Încearcă din nou în câteva secunde.";

/** Error codes from /api/orders that must be shown as a sentence, not as the raw code. */
const ERROR_CODE_TEXT: Record<string, string> = {
  rate_limited: RATE_LIMITED_MESSAGE,
  ordering_closed: ORDERING_CLOSED_BANNER,
};

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    fulfillmentType,
    setFulfillmentType,
    pickupTime,
    cutlerySets,
    setCutlerySets,
    tipAmount,
    setTipAmount,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getGrandTotal,
  } = useCartStore();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
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
  const hydrated = useCartHydrated();
  const openingStatus = useOpeningStatus();
  const orderingOff = !isOrderingEnabled();
  const isClosed = openingStatus !== null && !openingStatus.open;
  const soldOutIds = useSoldOutIds();
  const hasSoldOut = items.some((i) => soldOutIds.has(i.product.id));

  if (!isOpen || !hydrated) return null;

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const grandTotal = getGrandTotal();

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
      clearCart();
      setStep("success");
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : ERROR_TEXT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeCart} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md">
        <div className="w-full min-w-0 bg-brand-paper border-l-4 border-brand-dark flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="bg-brand-red text-brand-paper px-6 py-4 flex items-center justify-between border-b-2 border-brand-dark">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-brand-paper" />
              <h2 className="font-bebas text-2xl tracking-wide"><Display>COȘUL TĂU</Display></h2>
            </div>
            <button onClick={closeCart} className="text-brand-paper hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="brand-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {step === "success" ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-[#790D20] mx-auto" />
                <h3 className="font-bebas text-4xl text-brand-dark"><Display>COMANDĂ PLASATĂ!</Display></h3>
                <p className="font-mono text-lg font-bold bg-brand-dark text-brand-paper py-2 px-4 inline-block rounded">
                  Număr bon: {orderNumber}
                </p>
                <p className="font-nunito text-sm text-brand-dark/80">
                  Comanda ta a fost primită. Focul e pornit!
                </p>
                {publicToken && (
                  <div>
                    <a
                      href={`/comanda/${publicToken}`}
                      className="mt-2 inline-flex min-h-11 items-center bg-brand-dark text-brand-paper font-bebas text-xl px-6 py-3 rounded shadow-[3px_3px_0px_0px_#790D20]"
                    >
                      <Display>URMĂREȘTE COMANDA</Display>
                    </a>
                  </div>
                )}
                <button
                  onClick={() => {
                    setStep("cart");
                    closeCart();
                  }}
                  className="mt-4 bg-brand-red text-white font-bebas text-xl px-6 py-3 rounded shadow-[3px_3px_0px_0px_#332420]"
                >
                  <Display>ÎNAPOI LA MENIU</Display>
                </button>
              </div>
            ) : step === "cart" ? (
              <div>
                {orderingOff && (
                  <div
                    role="status"
                    className="mb-4 rounded-lg border-2 border-brand-red bg-brand-red/10 p-3 font-nunito text-sm font-bold text-brand-dark"
                  >
                    {ORDERING_CLOSED_BANNER}
                  </div>
                )}
                {!orderingOff && isClosed && openingStatus && (
                  <div
                    role="status"
                    className="mb-4 rounded-lg border-2 border-brand-red bg-brand-red/10 p-3 font-nunito text-sm font-bold text-brand-dark"
                  >
                    {closedCartNotice(openingStatus)}
                  </div>
                )}
                {/* Fulfillment Type Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-brand-dark/10 p-1.5 rounded-lg mb-6 border-2 border-brand-dark">
                  <button
                    onClick={() => setFulfillmentType("delivery")}
                    className={`font-bebas text-lg py-2 rounded transition-all ${
                      fulfillmentType === "delivery"
                        ? "bg-brand-red text-white shadow-[2px_2px_0px_0px_#332420]"
                        : "text-brand-dark hover:bg-brand-dark/5"
                    }`}
                  >
                    <Display>LIVRARE LA ADRESĂ</Display>
                  </button>
                  <button
                    onClick={() => setFulfillmentType("pickup")}
                    className={`font-bebas text-lg py-2 rounded transition-all ${
                      fulfillmentType === "pickup"
                        ? "bg-brand-red text-white shadow-[2px_2px_0px_0px_#332420]"
                        : "text-brand-dark hover:bg-brand-dark/5"
                    }`}
                  >
                    <Display>RIDICARE DIN RESTAURANT</Display>
                  </button>
                </div>

                {fulfillmentType === "pickup" && items.length > 0 && <PickupTimePicker />}

                {items.length === 0 ? (
                  <div className="text-center py-16 text-brand-dark/60 font-nunito font-bold">
                    <p className="text-lg mb-2">Coșul tău este gol momentan.</p>
                    <p className="text-sm">Carnea e proaspătă, plita e caldă. Alege ceva.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="bg-white border-2 border-brand-dark rounded-lg p-4 shadow-[3px_3px_0px_0px_#332420] flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bebas text-xl text-brand-dark"><Display>{item.product.name}</Display></h4>
                            {soldOutIds.has(item.product.id) && (
                              <p className="font-mono text-xs font-bold text-brand-red">
                                EPUIZAT - scoate-l din coș ca să continui
                              </p>
                            )}
                            <p className="font-nunito font-bold text-xs text-brand-dark/60">
                              {formatLei(item.unitPriceWithModifiers)} / buc
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            className="text-brand-red hover:opacity-80 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.modifiers.length > 0 && (
                          <div className="text-[11px] font-mono bg-brand-paper p-1.5 rounded text-brand-dark/80">
                            {item.modifiers.map((m) => (m.price > 0 ? `+ ${m.name}` : m.name)).join(", ")}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-dark/10">
                          <div className="flex items-center gap-2 border-2 border-brand-dark rounded px-2 py-0.5 bg-brand-paper">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="text-brand-dark hover:text-brand-red"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono font-bold text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="text-brand-dark hover:text-brand-red"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-nunito font-black text-lg text-brand-dark">
                            {formatLei(item.unitPriceWithModifiers * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <CartUpsell soldOutIds={soldOutIds} />

                    {/* Extras: Cutlery & Tip */}
                    <div className="bg-white border-2 border-brand-dark rounded-lg p-4 space-y-4 mt-6 shadow-[3px_3px_0px_0px_#332420]">
                      <div className="flex justify-between items-center">
                        <span className="font-bebas text-lg"><Display>SETURI TACĂMURI (Gratis)</Display></span>
                        <div className="flex items-center gap-2 border-2 border-brand-dark rounded px-2 py-0.5 bg-brand-paper">
                          <button onClick={() => setCutlerySets(cutlerySets - 1)} className="hover:text-brand-red">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-sm w-5 text-center">{cutlerySets}</span>
                          <button onClick={() => setCutlerySets(cutlerySets + 1)} className="hover:text-brand-red">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-brand-dark/10">
                        <span className="font-bebas text-lg"><Display>BACȘIȘ ECHIPĂ</Display></span>
                        <div className="flex gap-1.5">
                          {[0, 3, 5, 10].map((val) => (
                            <button
                              key={val}
                              onClick={() => setTipAmount(val)}
                              className={`font-mono text-xs font-bold px-2.5 py-1 rounded border-2 border-brand-dark transition-all ${
                                tipAmount === val ? "bg-brand-red text-white" : "bg-brand-paper text-brand-dark"
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
            ) : (
              /* CHECKOUT FORM */
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs font-mono font-bold text-brand-red underline mb-2 block"
                >
                  ← Înapoi la produsele din coș
                </button>

                <h3 className="font-bebas text-3xl text-brand-dark mb-4"><Display>DETALII LIVRARE</Display></h3>

                {errorMessage && (
                  <div className="bg-red-100 border-2 border-brand-red text-brand-red p-3 text-xs font-mono font-bold rounded">
                    {errorMessage}
                  </div>
                )}

                {/* Honeypot: off-screen, hidden from screen readers and keyboard. Humans leave it empty. */}
                <div aria-hidden="true" className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden">
                  <label htmlFor={HONEYPOT_FIELD}>Lasă acest câmp gol</label>
                  <input type="text" id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
                </div>

                <div>
                  <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">NUME COMPLET *</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={ORDER_LIMITS.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white"
                    placeholder="Andrei Popescu"
                  />
                </div>

                <div>
                  <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">TELEFON *</label>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={ORDER_LIMITS.phone}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (phoneError) setPhoneError("");
                    }}
                    onBlur={() => {
                      if (formData.phone && !normalizeRoPhone(formData.phone)) setPhoneError(PHONE_ERROR);
                    }}
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                    className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white"
                    placeholder="0721 123 456"
                  />
                  {phoneError && (
                    <p id="phone-error" className="mt-1 text-xs font-nunito font-bold text-brand-red">
                      {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">EMAIL (opțional)</label>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={ORDER_LIMITS.email}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (emailError) setEmailError("");
                    }}
                    onBlur={() => {
                      if (formData.email.trim() && !isValidEmail(formData.email)) setEmailError(EMAIL_ERROR);
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white"
                    placeholder="andrei@example.com"
                  />
                  {emailError && (
                    <p id="email-error" className="mt-1 text-xs font-nunito font-bold text-brand-red">
                      {emailError}
                    </p>
                  )}
                </div>

                {fulfillmentType === "delivery" && (
                  <>
                    <div>
                      <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">ADRESĂ LIVRARE (Stradă, Număr) *</label>
                      <input
                        type="text"
                        required
                        autoComplete="street-address"
                        maxLength={ORDER_LIMITS.address}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white"
                        placeholder="Str. Crângași nr. 14"
                      />
                    </div>

                    <div>
                      <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">DETALII (Bloc, Scară, Etaj, Ap, Interfon)</label>
                      <input
                        type="text"
                        maxLength={ORDER_LIMITS.details}
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white"
                        placeholder="Bl. 3, Sc. A, Ap. 12"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-nunito font-extrabold tracking-wide text-sm mb-1">OBSERVAȚII COMANDĂ</label>
                  <textarea
                    maxLength={ORDER_LIMITS.orderNote - 24} // room for the "Ridicare la HH:MM · " prefix
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full border-2 border-brand-dark p-2.5 rounded font-nunito font-semibold bg-white h-20"
                    placeholder="Fără ceapă la clasic, sos extra..."
                  />
                </div>

                <label className="flex items-start gap-2 font-nunito font-semibold text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#790D20]"
                  />
                  <span>
                    Am citit și accept{" "}
                    <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" className="underline font-bold">Termenii</a>{" "}
                    și{" "}
                    <a href={PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className="underline font-bold">Politica de confidențialitate</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || orderingOff || isClosed || hasSoldOut}
                  className="w-full bg-brand-red text-white font-bebas text-2xl py-4 rounded-lg shadow-[4px_4px_0px_0px_#332420] hover:bg-brand-dark transition-all mt-6 disabled:opacity-50"
                >
                  <Display>{orderingOff ? "Comenzile pornesc la lansare" : isClosed ? "Suntem închiși acum" : hasSoldOut ? "Produs epuizat în coș" : isSubmitting ? "SE TRIMITE..." : `PLASEAZĂ COMANDA · ${formatLei(grandTotal)}`}</Display>
                </button>
              </form>
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {items.length > 0 && step === "cart" && (
            <div className="bg-white border-t-2 border-brand-dark p-4 sm:p-6 space-y-2">
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
                <div className="flex justify-between gap-3 font-nunito font-semibold text-sm text-brand-red">
                  <span>Bacșiș echipă:</span>
                  <span>+{formatLei(tipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between gap-3 font-bebas text-2xl pt-2 border-t border-brand-dark/10">
                <span><Display>TOTAL DE PLATĂ:</Display></span>
                <span className="text-brand-red"><Display>{formatLei(grandTotal)}</Display></span>
              </div>

              <button
                onClick={() => {
                  setStep("checkout");
                  setCheckoutOpenedAt(Date.now());
                }}
                disabled={hasSoldOut || orderingOff}
                className="w-full disabled:opacity-50 bg-brand-dark text-brand-paper font-bebas text-2xl py-4 rounded-lg shadow-[4px_4px_0px_0px_#790D20] hover:bg-brand-red transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span><Display>CONTINUĂ LA CHECKOUT</Display></span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}