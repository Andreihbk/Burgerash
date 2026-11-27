"use client";

import { useCartStore } from "@/store/cartStore";
import { normalizeRoPhone, PHONE_ERROR } from "@/lib/phone";
import { OPENING_SOON } from "@/lib/ordering";
import { formatLei } from "@/lib/format";
import { EMAIL_ERROR, isValidEmail } from "@/lib/email";
import { HONEYPOT_FIELD } from "@/lib/bot-check";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal";
import { ORDER_LIMITS } from "@/lib/order-input";
import { Display } from "@/components/Display";
import type { Checkout } from "./useCheckout";

/** Step 2: contact + address form. State and submit live in useCheckout. */
export default function CheckoutForm({
  checkout,
  orderingOff,
  isClosed,
  hasSoldOut,
}: {
  checkout: Checkout;
  orderingOff: boolean;
  isClosed: boolean;
  hasSoldOut: boolean;
}) {
  const { fulfillmentType, getGrandTotal } = useCartStore();
  const grandTotal = getGrandTotal();
  const {
    setStep,
    formData,
    setFormData,
    termsAccepted,
    setTermsAccepted,
    isSubmitting,
    errorMessage,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    handleCheckoutSubmit,
  } = checkout;

  return (
    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
      <button
        type="button"
        onClick={() => setStep("cart")}
        className="text-xs font-mono font-bold text-wine underline mb-2 block"
      >
        ← Înapoi la produsele din coș
      </button>

      <h3 className="font-display text-3xl text-charcoal mb-4"><Display>DETALII LIVRARE</Display></h3>

      {errorMessage && (
        <div className="bg-red-100 border-2 border-wine text-wine p-3 text-xs font-mono font-bold rounded">
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
          className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white"
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
          className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white"
          placeholder="0721 123 456"
        />
        {phoneError && (
          <p id="phone-error" className="mt-1 text-xs font-nunito font-bold text-wine">
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
          className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white"
          placeholder="andrei@example.com"
        />
        {emailError && (
          <p id="email-error" className="mt-1 text-xs font-nunito font-bold text-wine">
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
              className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white"
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
              className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white"
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
          className="w-full border-2 border-charcoal p-2.5 rounded font-nunito font-semibold bg-white h-20"
          placeholder="Fără ceapă la clasic, sos extra..."
        />
      </div>

      <label className="flex items-start gap-2 font-nunito font-semibold text-sm cursor-pointer">
        <input
          type="checkbox"
          required
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-wine"
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
        className="w-full bg-wine text-white font-display text-2xl py-4 rounded-lg shadow-[4px_4px_0px_0px_var(--color-charcoal)] hover:bg-charcoal transition-all mt-6 disabled:opacity-50"
      >
        <Display>{orderingOff ? OPENING_SOON.toUpperCase() : isClosed ? "Suntem închiși acum" : hasSoldOut ? "Produs epuizat în coș" : isSubmitting ? "SE TRIMITE..." : `PLASEAZĂ COMANDA · ${formatLei(grandTotal)}`}</Display>
      </button>
      {orderingOff && (
        <p className="mt-3 text-center font-nunito text-sm font-bold text-charcoal/70">
          Comenzile online pornesc la lansare. Până atunci nu se trimite nimic.
        </p>
      )}
    </form>
  );
}
