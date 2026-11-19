import { describe, expect, it } from "vitest";
import { ORDER_LIMITS, OrderInputError, parseOrderInput, QUANTITY_ERROR, readText } from "./order-input";

const base = {
  fulfillment_type: "delivery",
  payment_method: "cash_on_delivery",
  customer_name: "Ana Pop",
  customer_phone: "0721 123 456",
  delivery_address: "Str. Crângași nr. 14",
  items: [{ product_id: "prod-classic", quantity: 1 }],
};

function parse(overrides: Record<string, unknown> = {}) {
  return parseOrderInput({ ...base, ...overrides });
}

function errorOf(overrides: Record<string, unknown>): string {
  try {
    parse(overrides);
  } catch (err) {
    if (err instanceof OrderInputError) return err.message;
    throw err;
  }
  throw new Error("expected OrderInputError");
}

describe("readText", () => {
  it("trims, maps empty to null and rejects non-strings", () => {
    expect(readText("  a  ", 5, "X")).toBe("a");
    expect(readText("   ", 5, "X")).toBeNull();
    expect(readText(undefined, 5, "X")).toBeNull();
    expect(() => readText(42, 5, "X")).toThrow(OrderInputError);
  });
});

describe("parseOrderInput", () => {
  it("accepts a valid delivery order and normalizes the phone", () => {
    const input = parse();
    expect(input.customerPhone).toBe("0721123456");
    expect(input.deliveryAddress).toBe("Str. Crângași nr. 14");
    expect(input.items).toEqual([{ product_id: "prod-classic", quantity: 1, note: null, modifier_ids: [] }]);
  });

  it("ignores the pickup placeholder address and details", () => {
    const input = parse({ fulfillment_type: "pickup", delivery_address: "x".repeat(1000), delivery_details: "y" });
    expect(input.deliveryAddress).toBeNull();
    expect(input.deliveryDetails).toBeNull();
  });

  it("rejects bad fulfillment and payment types", () => {
    expect(errorOf({ fulfillment_type: "drone" })).toBe("Tip de livrare invalid.");
    expect(errorOf({ payment_method: "crypto" })).toBe("Metodă de plată invalidă.");
  });

  describe("text caps: exactly at the limit passes, one over is rejected (not truncated)", () => {
    const cases: [string, number][] = [
      ["customer_name", ORDER_LIMITS.name],
      ["customer_email", ORDER_LIMITS.email],
      ["delivery_address", ORDER_LIMITS.address],
      ["delivery_details", ORDER_LIMITS.details],
      ["order_note", ORDER_LIMITS.orderNote],
    ];
    it.each(cases)("%s (max %i)", (field, max) => {
      const atLimit = field === "customer_email" ? `${"a".repeat(max - 12)}@example.com` : "a".repeat(max);
      expect(() => parse({ [field]: atLimit })).not.toThrow();
      const over = field === "customer_email" ? `${"a".repeat(max - 11)}@example.com` : "a".repeat(max + 1);
      expect(errorOf({ [field]: over })).toContain(`maxim ${max} de caractere`);
    });

    it("item note", () => {
      const items = (note: string) => [{ product_id: "prod-classic", quantity: 1, note }];
      expect(() => parse({ items: items("n".repeat(ORDER_LIMITS.itemNote)) })).not.toThrow();
      expect(errorOf({ items: items("n".repeat(ORDER_LIMITS.itemNote + 1)) })).toContain("Nota produsului");
    });

    it("phone length", () => {
      expect(errorOf({ customer_phone: "0".repeat(ORDER_LIMITS.phone + 1) })).toContain("Telefonul");
    });
  });

  it("caps are the agreed values", () => {
    expect(ORDER_LIMITS.maxQuantityPerLine).toBe(20);
    expect(ORDER_LIMITS.maxLines).toBe(30);
  });

  describe("Romanian phone", () => {
    it.each(["0721123456", "+40 721 123 456", "0040721123456", "0721.123.456"])("accepts %s", (phone) => {
      expect(parse({ customer_phone: phone }).customerPhone).toBe("0721123456");
    });
    it.each(["021 123 4567", "0621123456", "+44 7700 900123", "07211234", "abc"])("rejects %s", (phone) => {
      expect(errorOf({ customer_phone: phone })).toContain("număr valid");
    });
  });

  it("requires name, phone and (for delivery) address", () => {
    expect(errorOf({ customer_name: " " })).toBe("Numele și telefonul sunt obligatorii.");
    expect(errorOf({ customer_phone: undefined })).toBe("Numele și telefonul sunt obligatorii.");
    expect(errorOf({ delivery_address: "" })).toBe("Adresa este obligatorie.");
  });

  it("rejects an invalid email", () => {
    expect(errorOf({ customer_email: "nope" })).toContain("email");
  });

  describe("items", () => {
    const line = (quantity: unknown, extra: Record<string, unknown> = {}) => ({
      product_id: "prod-classic",
      quantity,
      ...extra,
    });

    it("rejects an empty or missing cart", () => {
      expect(errorOf({ items: [] })).toBe("Coșul este gol.");
      expect(errorOf({ items: "x" })).toBe("Coșul este gol.");
    });

    it("allows 30 lines, rejects 31", () => {
      expect(() => parse({ items: Array.from({ length: 30 }, () => line(1)) })).not.toThrow();
      expect(errorOf({ items: Array.from({ length: 31 }, () => line(1)) })).toContain("maxim 30");
    });

    it("allows 20 per line, rejects 21, 0, fractions and junk", () => {
      expect(() => parse({ items: [line(20)] })).not.toThrow();
      for (const q of [21, 0, -1, 1.5, "abc", null]) expect(errorOf({ items: [line(q)] })).toBe(QUANTITY_ERROR);
    });

    it("rejects more than 10 modifiers on one line", () => {
      const mods = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `m${i}` }));
      expect(() => parse({ items: [line(1, { modifiers: mods(10) })] })).not.toThrow();
      expect(errorOf({ items: [line(1, { modifiers: mods(11) })] })).toBe("Prea multe opțiuni la un produs.");
    });
  });
});
