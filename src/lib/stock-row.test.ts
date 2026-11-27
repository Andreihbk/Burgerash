import { describe, expect, it } from "vitest";
import { isRowSoldOut, soldOutIds } from "./stock-row";

const now = new Date("2026-11-27T12:00:00Z");

describe("isRowSoldOut", () => {
  it("is false when not flagged", () => {
    expect(isRowSoldOut({ product_id: "a", sold_out: false }, now)).toBe(false);
  });
  it("is true when flagged without expiry", () => {
    expect(isRowSoldOut({ product_id: "a", sold_out: true, snoozed_until: null }, now)).toBe(true);
  });
  it("is false once the POS snooze has expired", () => {
    expect(isRowSoldOut({ product_id: "a", sold_out: true, snoozed_until: "2026-11-27T11:00:00Z" }, now)).toBe(false);
  });
});

describe("soldOutIds", () => {
  it("keeps only rows sold out right now", () => {
    const ids = soldOutIds(
      [
        { product_id: "classic", sold_out: true },
        { product_id: "double", sold_out: false },
        { product_id: "crispy", sold_out: true, snoozed_until: "2026-11-27T13:00:00Z" },
        { product_id: "fries", sold_out: true, snoozed_until: "2026-11-27T10:00:00Z" },
      ],
      now,
    );
    expect([...ids].sort()).toEqual(["classic", "crispy"]);
  });
  it("is empty for no rows", () => {
    expect(soldOutIds([], now).size).toBe(0);
  });
});
