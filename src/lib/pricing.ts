// Order pricing shared by the cart (display) and /api/orders (source of truth).
// The server ALWAYS recalculates from catalog.ts and ignores client prices.
import { INITIAL_MODIFIERS, INITIAL_PRODUCTS, modifierAppliesToProduct } from "@/lib/catalog";
import { ORDER_LIMITS } from "@/lib/order-input";
import type { FulfillmentType, OrderItemModifier } from "@/types/database";

export const DELIVERY_FEE_STANDARD = 12.0;
export const FREE_DELIVERY_THRESHOLD = 120.0;

const MAX_QUANTITY_PER_LINE = ORDER_LIMITS.maxQuantityPerLine;
const MAX_TIP = 500;
const MAX_CUTLERY_SETS = 20;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getDeliveryFee(subtotal: number, fulfillmentType: FulfillmentType): number {
  if (fulfillmentType === "pickup" || subtotal === 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
}

export interface RequestedItem {
  product_id: unknown;
  quantity: unknown;
  modifier_ids: string[];
  note: unknown;
}

export interface PricedItem {
  product_id: string;
  product_name: string;
  ebriza_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers: OrderItemModifier[];
  note: string | null;
}

export interface PricedOrder {
  items: PricedItem[];
  subtotal: number;
  delivery_fee: number;
  tip_amount: number;
  total_amount: number;
  cutlery_sets: number;
}

export class PricingError extends Error {}

export function priceOrder(input: {
  items: RequestedItem[];
  fulfillmentType: FulfillmentType;
  tipAmount: unknown;
  cutlerySets: unknown;
}): PricedOrder {
  if (input.items.length === 0) throw new PricingError("Coșul este gol.");

  const items = input.items.map((req): PricedItem => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === req.product_id);
    if (!product || !product.is_available) {
      throw new PricingError(`Produs indisponibil: ${String(req.product_id)}`);
    }

    const quantity = Number(req.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new PricingError(`Cantitate invalidă pentru ${product.name}`);
    }

    const modifiers = [...new Set(req.modifier_ids)].map((modId): OrderItemModifier => {
      const mod = INITIAL_MODIFIERS.find((m) => m.id === modId);
      if (!mod || !mod.is_available) throw new PricingError(`Modificator indisponibil: ${modId}`);
      if (!modifierAppliesToProduct(mod, product)) {
        throw new PricingError(`Modificatorul ${mod.name} nu se aplică pentru ${product.name}`);
      }
      return { id: mod.id, name: mod.name, price: mod.price, ebriza_sku: mod.ebriza_sku };
    });

    const unitPrice = roundMoney(product.price + modifiers.reduce((sum, m) => sum + m.price, 0));
    const note = typeof req.note === "string" && req.note.trim() ? req.note.trim().slice(0, 300) : null;

    return {
      product_id: product.id,
      product_name: product.name,
      ebriza_sku: product.ebriza_sku,
      quantity,
      unit_price: unitPrice,
      total_price: roundMoney(unitPrice * quantity),
      modifiers,
      note,
    };
  });

  const subtotal = roundMoney(items.reduce((sum, i) => sum + i.total_price, 0));
  const deliveryFee = getDeliveryFee(subtotal, input.fulfillmentType);

  const tip = Number(input.tipAmount ?? 0);
  if (!Number.isFinite(tip) || tip < 0 || tip > MAX_TIP) throw new PricingError("Bacșiș invalid.");
  const tipAmount = roundMoney(tip);

  const cutlery = Number(input.cutlerySets ?? 0);
  if (!Number.isInteger(cutlery) || cutlery < 0 || cutlery > MAX_CUTLERY_SETS) {
    throw new PricingError("Număr de tacâmuri invalid.");
  }

  return {
    items,
    subtotal,
    delivery_fee: deliveryFee,
    tip_amount: tipAmount,
    total_amount: roundMoney(subtotal + deliveryFee + tipAmount),
    cutlery_sets: cutlery,
  };
}
