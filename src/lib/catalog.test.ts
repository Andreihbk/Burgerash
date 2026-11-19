import { describe, expect, it } from "vitest";
import { INITIAL_PRODUCTS } from "./catalog";
import { priceOrder, PricingError } from "./pricing";
import { reconcileCartItems } from "./cart-reconcile";

const line = (product_id: string, quantity = 1) => ({ product_id, quantity, modifier_ids: [], note: null });
const price = (ids: string[]) =>
  priceOrder({ items: ids.map((id) => line(id)), fulfillmentType: "pickup", tipAmount: 0, cutlerySets: 0 });

describe("menu board catalog", () => {
  it("has exactly the menu board prices", () => {
    const prices = Object.fromEntries(INITIAL_PRODUCTS.map((p) => [p.name, p.price]));
    expect(prices).toEqual({
      CLASIC: 36, "HOT BOY": 39, DOUBLE: 46,
      CRISPY: 38, "HOT HONEY": 38, "CRISPY BACON": 42,
      Fries: 13, Chips: 13, Nuggets: 27, Sauces: 5,
      "Coca-Cola": 10, Fanta: 10, Sprite: 10, Water: 8,
    });
  });

  it("has a weight label on every product", () => {
    expect(INITIAL_PRODUCTS.every((p) => p.weight_label)).toBe(true);
    expect(INITIAL_PRODUCTS.find((p) => p.id === "prod-nuggets")?.weight_label).toBe("6 buc (aprox. 180g)");
  });

  it("leaves allergens unconfirmed (null) for the new products", () => {
    for (const id of ["prod-crispy", "prod-crispy-bacon", "prod-chips", "prod-nuggets"]) {
      expect(INITIAL_PRODUCTS.find((p) => p.id === id)?.allergens).toBeNull();
    }
  });
});

describe("server pricing", () => {
  it("prices CRISPY BACON at 42 even though it has no Ebriza SKU (order is not blocked)", () => {
    const order = price(["prod-crispy-bacon"]);
    expect(order.items[0]).toMatchObject({ unit_price: 42, ebriza_sku: null });
    expect(order.total_amount).toBe(42);
  });

  it("rejects removed products", () => {
    expect(() => price(["prod-cheesy"])).toThrow(PricingError);
    expect(() => price(["prod-crispy-chicken"])).toThrow(PricingError);
  });
});

describe("reconcileCartItems (saved carts)", () => {
  const saved = (id: string, unit: number) => ({
    cartItemId: `${id}____`,
    product: { id, name: "old", price: unit } as never,
    quantity: 2,
    modifiers: [],
    note: "",
    unitPriceWithModifiers: unit,
  });

  it("drops removed products quietly and refreshes the price of the rest", () => {
    const result = reconcileCartItems([saved("prod-cheesy", 0), saved("prod-crispy-chicken", 38), saved("prod-cola", 9)]);
    expect(result).toHaveLength(1);
    expect(result[0].product.name).toBe("Coca-Cola");
    expect(result[0].unitPriceWithModifiers).toBe(10);
    expect(result[0].quantity).toBe(2);
  });

  it("tolerates garbage", () => {
    expect(reconcileCartItems(undefined)).toEqual([]);
    expect(reconcileCartItems([null, {}])).toEqual([]);
  });
});
