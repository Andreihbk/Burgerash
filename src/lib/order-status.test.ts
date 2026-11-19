import { describe, expect, it } from "vitest";
import { isFinalStatus, statusSteps, TOKEN_PATTERN } from "./order-status";

describe("TOKEN_PATTERN", () => {
  it("accepts 32 lowercase hex chars only", () => {
    expect(TOKEN_PATTERN.test("a".repeat(32))).toBe(true);
    expect(TOKEN_PATTERN.test("BRG-1001")).toBe(false);
    expect(TOKEN_PATTERN.test("a".repeat(31))).toBe(false);
    expect(TOKEN_PATTERN.test("a".repeat(32) + "\n")).toBe(false);
    expect(TOKEN_PATTERN.test("g".repeat(32))).toBe(false);
  });
});

describe("statusSteps", () => {
  it("delivery has a courier step, pickup does not", () => {
    expect(statusSteps("delivery").map((s) => s.status)).toContain("out_for_delivery");
    expect(statusSteps("pickup").map((s) => s.status)).not.toContain("out_for_delivery");
  });
  it("both end at delivered", () => {
    for (const t of ["delivery", "pickup"] as const) {
      expect(statusSteps(t).at(-1)?.status).toBe("delivered");
    }
  });
});

describe("isFinalStatus", () => {
  it("is true only for delivered and canceled", () => {
    expect(isFinalStatus("delivered")).toBe(true);
    expect(isFinalStatus("canceled")).toBe(true);
    expect(isFinalStatus("preparing")).toBe(false);
  });
});
