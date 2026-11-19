// Server-side input caps for /api/orders (PLAN B.1). The same limits drive the form's maxLength,
// so a human never sees these errors; they stop scripted or oversized requests.
// Over-long text is REJECTED, not truncated: a silently cut address is a lost delivery.
import { normalizeRoPhone, PHONE_ERROR } from "@/lib/phone";
import { EMAIL_ERROR, isValidEmail } from "@/lib/email";
import type { RequestedItem } from "@/lib/pricing";
import type { FulfillmentType, PaymentMethod } from "@/types/database";

export const ORDER_LIMITS = {
  maxQuantityPerLine: 20,
  maxLines: 30,
  maxModifiersPerLine: 10,
  name: 80,
  phone: 40,
  email: 200,
  address: 200,
  details: 200,
  orderNote: 500,
  itemNote: 200,
} as const;

export const QUANTITY_ERROR = `Maxim ${ORDER_LIMITS.maxQuantityPerLine} de bucăți din același produs.`;
export const RATE_LIMITED_MESSAGE =
  "Ai trimis prea multe comenzi într-un timp scurt. Încearcă din nou în câteva minute sau sună-ne.";

const FULFILLMENT_TYPES: FulfillmentType[] = ["delivery", "pickup"];
const PAYMENT_METHODS: PaymentMethod[] = ["cash_on_delivery", "card_on_delivery", "online_card"];

export class OrderInputError extends Error {}

/** Empty -> null. Not a string or longer than max -> OrderInputError. */
export function readText(value: unknown, max: number, label: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new OrderInputError(`${label}: valoare invalidă.`);
  const text = value.trim();
  if (!text) return null;
  if (text.length > max) throw new OrderInputError(`${label} poate avea maxim ${max} de caractere.`);
  return text;
}

export interface OrderInput {
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryDetails: string | null;
  orderNote: string | null;
  items: RequestedItem[];
  tipAmount: unknown;
  cutlerySets: unknown;
}

function readItems(raw: unknown): RequestedItem[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new OrderInputError("Coșul este gol.");
  if (raw.length > ORDER_LIMITS.maxLines) {
    throw new OrderInputError(`Comanda poate avea maxim ${ORDER_LIMITS.maxLines} de produse diferite.`);
  }

  // Only ids, quantities and notes are taken from the client; all prices come from catalog.ts.
  return raw.map((entry: unknown): RequestedItem => {
    const item = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > ORDER_LIMITS.maxQuantityPerLine) {
      throw new OrderInputError(QUANTITY_ERROR);
    }

    const modifiers = Array.isArray(item.modifiers) ? item.modifiers : [];
    if (modifiers.length > ORDER_LIMITS.maxModifiersPerLine) {
      throw new OrderInputError("Prea multe opțiuni la un produs.");
    }

    return {
      product_id: item.product_id,
      quantity,
      note: readText(item.note, ORDER_LIMITS.itemNote, "Nota produsului"),
      modifier_ids: modifiers
        .map((m) => (m && typeof m === "object" ? (m as { id?: unknown }).id : m))
        .filter((id): id is string => typeof id === "string"),
    };
  });
}

/** Validates and normalizes the order body. Throws OrderInputError with a Romanian message. */
export function parseOrderInput(body: Record<string, unknown>): OrderInput {
  const fulfillmentType = body.fulfillment_type as FulfillmentType;
  const paymentMethod = body.payment_method as PaymentMethod;
  if (!FULFILLMENT_TYPES.includes(fulfillmentType)) throw new OrderInputError("Tip de livrare invalid.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new OrderInputError("Metodă de plată invalidă.");

  const customerName = readText(body.customer_name, ORDER_LIMITS.name, "Numele");
  const rawPhone = readText(body.customer_phone, ORDER_LIMITS.phone, "Telefonul");
  if (!customerName || !rawPhone) throw new OrderInputError("Numele și telefonul sunt obligatorii.");
  const customerPhone = normalizeRoPhone(rawPhone);
  if (!customerPhone) throw new OrderInputError(PHONE_ERROR);

  const customerEmail = readText(body.customer_email, ORDER_LIMITS.email, "Emailul");
  if (customerEmail && !isValidEmail(customerEmail)) throw new OrderInputError(EMAIL_ERROR);

  const isDelivery = fulfillmentType === "delivery";
  // For pickup the form sends a placeholder address; it is ignored, not validated.
  const deliveryAddress = isDelivery ? readText(body.delivery_address, ORDER_LIMITS.address, "Adresa") : null;
  if (isDelivery && !deliveryAddress) throw new OrderInputError("Adresa este obligatorie.");
  const deliveryDetails = isDelivery
    ? readText(body.delivery_details, ORDER_LIMITS.details, "Detaliile adresei")
    : null;
  const orderNote = readText(body.order_note, ORDER_LIMITS.orderNote, "Observațiile");

  return {
    fulfillmentType,
    paymentMethod,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    deliveryDetails,
    orderNote,
    items: readItems(body.items),
    tipAmount: body.tip_amount,
    cutlerySets: body.cutlery_sets,
  };
}
