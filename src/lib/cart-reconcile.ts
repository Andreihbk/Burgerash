// Saved carts (localStorage) hold full product snapshots. When the menu changes, reconcile them
// quietly against the current catalog: drop removed products, refresh names/prices/weights.
import { INITIAL_MODIFIERS, INITIAL_PRODUCTS } from "@/lib/catalog";
import { roundMoney } from "@/lib/pricing";
import type { OrderItemModifier, Product } from "@/types/database";

interface SavedLine {
  cartItemId: string;
  product: Product;
  quantity: number;
  modifiers: OrderItemModifier[];
  note: string;
  unitPriceWithModifiers: number;
}

export function reconcileCartItems<T extends SavedLine>(items: unknown): T[] {
  if (!Array.isArray(items)) return [];
  const result: T[] = [];
  for (const raw of items as T[]) {
    const product = INITIAL_PRODUCTS.find((p) => p.id === raw?.product?.id);
    if (!product || !product.is_available) continue; // removed or unavailable: drop quietly

    const modifiers = (Array.isArray(raw.modifiers) ? raw.modifiers : []).flatMap((m): OrderItemModifier[] => {
      const current = INITIAL_MODIFIERS.find((c) => c.id === m?.id);
      return current && current.is_available
        ? [{ id: current.id, name: current.name, price: current.price, ebriza_sku: current.ebriza_sku }]
        : [];
    });
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) continue;

    result.push({
      ...raw,
      product,
      modifiers,
      quantity,
      unitPriceWithModifiers: roundMoney(product.price + modifiers.reduce((sum, m) => sum + m.price, 0)),
    });
  }
  return result;
}
