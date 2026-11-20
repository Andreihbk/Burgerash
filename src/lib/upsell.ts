import type { Product } from "@/types/database";
import { INITIAL_PRODUCTS } from "@/lib/catalog";

// Cart upsell: one suggestion per missing group (a side, a sauce, a drink), only once the cart has a main
// (burger or chicken). Each group offers its first product that is on the menu and not sold out.
// Pure display logic: the order is still priced by the server from catalog.ts.

const MAIN_CATEGORIES = new Set(["cat-burgers", "cat-chicken"]);

const UPSELL_GROUPS: readonly (readonly string[])[] = [
  ["prod-fries", "prod-chips", "prod-nuggets"],
  ["prod-sauces"],
  ["prod-cola", "prod-fanta", "prod-sprite", "prod-water"],
];

export function getUpsellProducts(
  cartProductIds: readonly string[],
  soldOutIds: ReadonlySet<string>,
  catalog: readonly Product[] = INITIAL_PRODUCTS,
): Product[] {
  const inCart = new Set(cartProductIds);
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const hasMain = catalog.some((p) => inCart.has(p.id) && MAIN_CATEGORIES.has(p.category_id));
  if (!hasMain) return [];

  return UPSELL_GROUPS.flatMap((group) => {
    if (group.some((id) => inCart.has(id))) return [];
    const pick = group
      .map((id) => byId.get(id))
      .find((p): p is Product => !!p && p.is_available && !soldOutIds.has(p.id));
    return pick ? [pick] : [];
  });
}
