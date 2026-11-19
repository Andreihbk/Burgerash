// Pure builder: Supabase order + items -> POST /bills/openbillwithclient body.
// No I/O, no env. Facts: .claude/skills/ebriza-api/reference.md

import type { Order, OrderItem, PaymentMethod } from "@/types/database";
import type {
  EbrizaBillItem,
  EbrizaBillPayment,
  EbrizaClientRequest,
  EbrizaOpenBillWithClientRequest,
} from "@/types/ebriza";
import { EbrizaItemType, EbrizaPaymentType } from "@/types/ebriza";

/** Defaults for the single-string address we store (Burgerash delivers in Bucharest only). */
const DEFAULT_CITY = "București";
const DEFAULT_COUNTY = "București";
const DEFAULT_COUNTRY = "România";

const PAYMENT_TYPE: Record<PaymentMethod, EbrizaBillPayment["type"]> = {
  cash_on_delivery: EbrizaPaymentType.CashOnDelivery,
  card_on_delivery: EbrizaPaymentType.CreditCardOnDelivery,
  online_card: EbrizaPaymentType.CreditCard,
};

export type EbrizaPayloadOrder = Pick<
  Order,
  | "id"
  | "order_number"
  | "fulfillment_type"
  | "payment_method"
  | "customer_name"
  | "customer_phone"
  | "customer_email"
  | "delivery_address"
  | "delivery_details"
  | "order_note"
  | "delivery_fee"
  | "tip_amount"
  | "total_amount"
  | "cutlery_sets"
>;

export type EbrizaPayloadItem = Pick<
  OrderItem,
  "product_id" | "product_name" | "ebriza_sku" | "quantity" | "modifiers" | "note"
>;

export interface BuildOptions {
  /** Generates the shared lock GUID for a product line and its modifiers. */
  newLock?: () => string;
  /**
   * Catalog ids whose line gets an SGR deposit line `{ type: 1001, lock, quantity }`.
   * Omitted/empty = no deposit lines (default while EBRIZA_SEND_SGR is off).
   */
  bottleDepositIds?: ReadonlySet<string>;
}

/** Thrown when the order cannot be mapped (e.g. missing SKU). Code mirrors the Ebriza error. */
export class EbrizaPayloadError extends Error {
  constructor(
    public readonly code: "0104" | "0111" | "0110" | "0117",
    message: string,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = "EbrizaPayloadError";
  }
}

/** First word -> firstName, rest -> lastName; a single word is used for both (Ebriza needs both). */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) throw new EbrizaPayloadError("0111", "Customer name is empty");
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function positive(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

export function buildOpenBillPayload(
  order: EbrizaPayloadOrder,
  items: EbrizaPayloadItem[],
  options: BuildOptions = {},
): EbrizaOpenBillWithClientRequest {
  const newLock = options.newLock ?? (() => crypto.randomUUID());

  // Fail loudly on unmapped SKUs (product or modifier) instead of letting Ebriza create items.
  const missing: string[] = [];
  for (const item of items) {
    if (!item.ebriza_sku) missing.push(item.product_id ?? item.product_name);
    for (const mod of item.modifiers ?? []) {
      if (!mod.ebriza_sku) missing.push(`${item.product_id ?? item.product_name} / ${mod.id}`);
    }
  }
  if (missing.length > 0) {
    throw new EbrizaPayloadError("0104", `Missing Ebriza SKU for: ${missing.join(", ")}`, missing);
  }

  const lines: EbrizaBillItem[] = [];
  for (const item of items) {
    const lock = newLock();
    const note = item.note?.trim();
    lines.push({
      sku: item.ebriza_sku as string,
      quantity: item.quantity,
      lock,
      ...(note ? { note } : {}),
    });
    for (const mod of item.modifiers ?? []) {
      // Modifier quantity = product quantity (open question: confirm in the real Ebriza test).
      lines.push({ sku: mod.ebriza_sku as string, quantity: item.quantity, lock, isMod: true });
    }
    // SGR: same lock as the bottle line; amount and VAT come from the POS system products.
    if (item.product_id && options.bottleDepositIds?.has(item.product_id)) {
      lines.push({ type: EbrizaItemType.BottleDeposit, lock, quantity: item.quantity });
    }
  }

  const isPickup = order.fulfillment_type === "pickup";
  const deliveryFee = isPickup ? null : positive(order.delivery_fee);
  const tip = positive(order.tip_amount);
  const cutlery = positive(order.cutlery_sets);
  if (deliveryFee !== null) lines.push({ type: EbrizaItemType.DeliveryFee, quantity: deliveryFee });
  if (tip !== null) lines.push({ type: EbrizaItemType.Tips, quantity: tip });
  if (cutlery !== null) lines.push({ type: EbrizaItemType.Cutlery, quantity: cutlery });

  const phone = order.customer_phone?.trim() || undefined;
  const email = order.customer_email?.trim() || undefined;
  if (!phone && !email) throw new EbrizaPayloadError("0110", "Customer needs a phone or email");

  const client: EbrizaClientRequest = {
    ...splitName(order.customer_name),
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
  };

  if (!isPickup) {
    const street = order.delivery_address?.trim();
    if (!street) throw new EbrizaPayloadError("0117", "Delivery order without an address");
    const details = order.delivery_details?.trim();
    client.address = {
      street,
      city: DEFAULT_CITY,
      county: DEFAULT_COUNTY,
      country: DEFAULT_COUNTRY,
      ...(details ? { details } : {}),
      isDeliveryAddress: true,
    };
  }

  const note = order.order_note?.trim();

  return {
    bill: {
      items: lines,
      externalOrderID: order.id,
      externalOrderNo: order.order_number,
      isForPickup: isPickup,
      ...(note ? { note } : {}),
      payments: [{ type: PAYMENT_TYPE[order.payment_method], value: order.total_amount }],
    },
    client,
  };
}
