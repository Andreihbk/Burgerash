import { beforeEach, describe, expect, it, vi } from "vitest";

let result: { data: { product_id: string }[] | null; error: { message: string } | null } = { data: [], error: null };
const eqSpy = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: {
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: boolean) => {
          eqSpy(table, col, val);
          return Promise.resolve(result);
        },
      }),
    }),
  },
}));

import { getSoldOutIds, soldOutMessage, soldOutNames } from "./stock";

beforeEach(() => {
  eqSpy.mockClear();
  result = { data: [], error: null };
});

describe("getSoldOutIds", () => {
  it("reads only sold_out = true rows", async () => {
    result = { data: [{ product_id: "prod-classic" }, { product_id: "prod-cola" }], error: null };
    const ids = await getSoldOutIds();
    expect(ids).toEqual(new Set(["prod-classic", "prod-cola"]));
    expect(eqSpy).toHaveBeenCalledWith("product_stock", "sold_out", true);
  });

  it("throws when Supabase errors (caller fails closed)", async () => {
    result = { data: null, error: { message: "boom" } };
    await expect(getSoldOutIds()).rejects.toThrow("product_stock read failed");
  });
});

describe("soldOutNames", () => {
  const soldOut = new Set(["prod-classic", "prod-cola"]);

  it("returns catalog names of sold-out products, deduplicated", () => {
    expect(soldOutNames(["prod-classic", "prod-double", "prod-classic", "prod-cola"], soldOut)).toEqual([
      "CLASIC",
      "COLA",
    ]);
  });

  it("ignores available, unknown and non-string ids", () => {
    expect(soldOutNames(["prod-double", 42, undefined, "nope"], soldOut)).toEqual([]);
  });
});

describe("soldOutMessage", () => {
  it("uses singular and plural forms", () => {
    expect(soldOutMessage(["CLASIC"])).toContain("CLASIC este epuizat");
    expect(soldOutMessage(["CLASIC", "COLA"])).toContain("CLASIC, COLA sunt epuizate");
  });
});
