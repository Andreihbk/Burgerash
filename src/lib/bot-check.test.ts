import { describe, expect, it } from "vitest";
import { checkBot, fakeOrderSuccess, HONEYPOT_FIELD, MIN_FORM_MS } from "./bot-check";

describe("checkBot", () => {
  it("passes a normal human submit", () => {
    expect(checkBot({ form_elapsed_ms: 12_000, [HONEYPOT_FIELD]: "" })).toEqual({ ok: true });
  });

  it("passes exactly at the minimum time", () => {
    expect(checkBot({ form_elapsed_ms: MIN_FORM_MS })).toEqual({ ok: true });
  });

  it.each(["http://spam.example", "x", 1, true])("flags a filled honeypot (%j)", (value) => {
    expect(checkBot({ form_elapsed_ms: 12_000, [HONEYPOT_FIELD]: value })).toEqual({
      ok: false,
      reason: "honeypot",
    });
  });

  it("ignores a whitespace-only honeypot", () => {
    expect(checkBot({ form_elapsed_ms: 12_000, [HONEYPOT_FIELD]: "  " })).toEqual({ ok: true });
  });

  it("honeypot wins over timing", () => {
    expect(checkBot({ form_elapsed_ms: 10, [HONEYPOT_FIELD]: "x" })).toEqual({ ok: false, reason: "honeypot" });
  });

  it.each([0, MIN_FORM_MS - 1, -5, "abc", undefined, null, Number.NaN])(
    "flags a too-fast or missing timer (%j)",
    (value) => {
      expect(checkBot({ form_elapsed_ms: value })).toEqual({ ok: false, reason: "too_fast" });
    },
  );
});

describe("fakeOrderSuccess", () => {
  it("looks like a real success response", () => {
    const fake = fakeOrderSuccess();
    expect(fake.success).toBe(true);
    expect(fake.order_number).toMatch(/^BRG-\d{4}$/);
    expect(fake.public_token).toMatch(/^[0-9a-f]{32}$/);
    expect(fake.order_id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
