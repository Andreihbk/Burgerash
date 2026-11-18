import { describe, expect, it } from "vitest";
import {
  buildOpenBillPayload,
  EbrizaPayloadError,
  splitName,
  type EbrizaPayloadItem,
  type EbrizaPayloadOrder,
} from "./ebriza-payload";

function lockSequence() {
  let n = 0;
  return () => `lock-${++n}`;
}

const deliveryOrder: EbrizaPayloadOrder = {
  id: "5b0f7e7c-3c1e-4a4f-9a51-2f6d2c1e9a01",
  order_number: "BRG-1042",
  fulfillment_type: "delivery",
  payment_method: "cash_on_delivery",
  customer_name: "Ana Maria Popescu",
  customer_phone: "0722123456",
  customer_email: "ana@example.com",
  delivery_address: "Str. Lipscani 10",
  delivery_details: "Bl. A, sc. 2, ap. 14, interfon 14",
  order_note: "Sunați la sosire",
  subtotal: 101,
  delivery_fee: 15,
  tip_amount: 5,
  total_amount: 121,
  cutlery_sets: 2,
};

const deliveryItems: EbrizaPayloadItem[] = [
  {
    product_id: "prod-classic",
    product_name: "CLASIC",
    ebriza_sku: "brg-classic",
    quantity: 2,
    note: "bine făcut",
    modifiers: [
      { id: "mod-extra-cheddar", name: "Extra American Cheddar", price: 5, ebriza_sku: "mod-extra-cheddar" },
      { id: "mod-no-onion", name: "Fără Ceapă", price: 0, ebriza_sku: "mod-fara-ceapa" },
    ],
  },
  {
    product_id: "prod-fries",
    product_name: "Cartofi",
    ebriza_sku: "side-fries",
    quantity: 1,
    note: null,
    modifiers: [],
  },
];

const pickupOrder: EbrizaPayloadOrder = {
  id: "9c2d4b1a-7e3f-4d5c-8b6a-1f0e2d3c4b5a",
  order_number: "BRG-1043",
  fulfillment_type: "pickup",
  payment_method: "card_on_delivery",
  customer_name: "Mihai",
  customer_phone: "0733987654",
  customer_email: null,
  delivery_address: null,
  delivery_details: null,
  order_note: null,
  subtotal: 48,
  delivery_fee: 0,
  tip_amount: 0,
  total_amount: 48,
  cutlery_sets: 0,
};

const pickupItems: EbrizaPayloadItem[] = [
  { product_id: "prod-hot-boy", product_name: "HOT BOY", ebriza_sku: "brg-hot-boy", quantity: 1, note: null, modifiers: [] },
  { product_id: "prod-cola", product_name: "Coca-Cola", ebriza_sku: "drink-cola", quantity: 1, note: "  ", modifiers: [] },
];

describe("buildOpenBillPayload", () => {
  it("builds a delivery order with modifiers and system lines", () => {
    const payload = buildOpenBillPayload(deliveryOrder, deliveryItems, { newLock: lockSequence() });

    expect(payload).toEqual({
      bill: {
        items: [
          { sku: "brg-classic", quantity: 2, lock: "lock-1", note: "bine făcut" },
          { sku: "mod-extra-cheddar", quantity: 2, lock: "lock-1", isMod: true },
          { sku: "mod-fara-ceapa", quantity: 2, lock: "lock-1", isMod: true },
          { sku: "side-fries", quantity: 1, lock: "lock-2" },
          { type: 1002, quantity: 15 },
          { type: 1000, quantity: 5 },
          { type: 1003, quantity: 2 },
        ],
        externalOrderID: "5b0f7e7c-3c1e-4a4f-9a51-2f6d2c1e9a01",
        externalOrderNo: "BRG-1042",
        isForPickup: false,
        note: "Sunați la sosire",
        payments: [{ type: 0, value: 121 }],
      },
      client: {
        firstName: "Ana",
        lastName: "Maria Popescu",
        phone: "0722123456",
        email: "ana@example.com",
        address: {
          street: "Str. Lipscani 10",
          city: "București",
          county: "București",
          country: "România",
          details: "Bl. A, sc. 2, ap. 14, interfon 14",
          isDeliveryAddress: true,
        },
      },
    });
  });

  it("builds a pickup order without address or system lines", () => {
    const payload = buildOpenBillPayload(pickupOrder, pickupItems, { newLock: lockSequence() });

    expect(payload).toEqual({
      bill: {
        items: [
          { sku: "brg-hot-boy", quantity: 1, lock: "lock-1" },
          { sku: "drink-cola", quantity: 1, lock: "lock-2" },
        ],
        externalOrderID: "9c2d4b1a-7e3f-4d5c-8b6a-1f0e2d3c4b5a",
        externalOrderNo: "BRG-1043",
        isForPickup: true,
        payments: [{ type: 10, value: 48 }],
      },
      client: { firstName: "Mihai", lastName: "Mihai", phone: "0733987654" },
    });
  });

  it("never sends a delivery fee on pickup", () => {
    const payload = buildOpenBillPayload({ ...pickupOrder, delivery_fee: 15 }, pickupItems);
    expect(payload.bill.items.some((line) => "type" in line && line.type === 1002)).toBe(false);
  });

  it("throws 0104 when a product or modifier has no SKU", () => {
    const items: EbrizaPayloadItem[] = [
      { ...deliveryItems[0], ebriza_sku: null },
      { ...deliveryItems[0], modifiers: [{ id: "mod-x", name: "X", price: 1, ebriza_sku: null }] },
    ];
    try {
      buildOpenBillPayload(deliveryOrder, items);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(EbrizaPayloadError);
      expect((err as EbrizaPayloadError).code).toBe("0104");
      expect((err as EbrizaPayloadError).details).toEqual(["prod-classic", "prod-classic / mod-x"]);
    }
  });

  it("throws 0117 for a delivery order without address", () => {
    expect(() => buildOpenBillPayload({ ...deliveryOrder, delivery_address: " " }, deliveryItems)).toThrow(
      EbrizaPayloadError,
    );
  });
});

describe("splitName", () => {
  it("splits first word from the rest", () => {
    expect(splitName("  Ion  Ionescu ")).toEqual({ firstName: "Ion", lastName: "Ionescu" });
  });
});
