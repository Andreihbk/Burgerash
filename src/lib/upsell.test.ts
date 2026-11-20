import { describe, expect, it } from "vitest";
import { getUpsellProducts } from "./upsell";

const none: ReadonlySet<string> = new Set();
const ids = (cart: string[], soldOut: ReadonlySet<string> = none) => getUpsellProducts(cart, soldOut).map((p) => p.id);

describe("getUpsellProducts", () => {
  it("suggests nothing without a burger or chicken in the cart", () => {
    expect(ids([])).toEqual([]);
    expect(ids(["prod-fries", "prod-cola"])).toEqual([]);
  });

  it("suggests a side, a sauce and a drink next to a main", () => {
    expect(ids(["prod-classic"])).toEqual(["prod-fries", "prod-sauces", "prod-cola"]);
    expect(ids(["prod-crispy"])).toEqual(["prod-fries", "prod-sauces", "prod-cola"]);
  });

  it("skips a group the cart already covers", () => {
    expect(ids(["prod-classic", "prod-nuggets", "prod-water"])).toEqual(["prod-sauces"]);
    expect(ids(["prod-classic", "prod-chips", "prod-sauces", "prod-sprite"])).toEqual([]);
  });

  it("falls back to the next product when one is sold out", () => {
    expect(ids(["prod-double"], new Set(["prod-fries", "prod-cola"]))).toEqual(["prod-chips", "prod-sauces", "prod-fanta"]);
    expect(ids(["prod-double"], new Set(["prod-sauces"]))).toEqual(["prod-fries", "prod-cola"]);
  });
});
