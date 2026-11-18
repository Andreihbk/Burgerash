import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const updateSpy = vi.fn();
const eqSpy = vi.fn();
let dbError: { message: string } | null = null;

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      update: (values: Record<string, unknown>) => {
        updateSpy(table, values);
        return {
          eq: (col: string, val: string) => {
            eqSpy(col, val);
            return Promise.resolve({ error: dbError });
          },
        };
      },
    }),
  },
}));

import { syncOrderToEbriza } from "./ebriza-sync";
import type { EbrizaPayloadItem, EbrizaPayloadOrder } from "./ebriza-payload";

const order: EbrizaPayloadOrder = {
  id: "5b0f7e7c-3c1e-4a4f-9a51-2f6d2c1e9a01",
  order_number: "BRG-1042",
  fulfillment_type: "delivery",
  payment_method: "cash_on_delivery",
  customer_name: "Ana Popescu",
  customer_phone: "0722123456",
  customer_email: null,
  delivery_address: "Str. Lipscani 10",
  delivery_details: null,
  order_note: null,
  delivery_fee: 15,
  tip_amount: 0,
  total_amount: 60,
  cutlery_sets: 1,
};

const items: EbrizaPayloadItem[] = [
  {
    product_id: "prod-classic",
    product_name: "CLASIC",
    ebriza_sku: "brg-classic", // catalog snapshot: must be ignored in favour of the SKU map
    quantity: 1,
    note: null,
    modifiers: [{ id: "mod-extra-cheddar", name: "Extra American Cheddar", price: 5, ebriza_sku: "mod-extra-cheddar" }],
  },
];

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  dbError = null;
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  updateSpy.mockReset();
  eqSpy.mockReset();
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("syncOrderToEbriza", () => {
  it("mock mode: ends 'sent' with a fake bill id and no network call", async () => {
    vi.stubEnv("EBRIZA_MOCK", "true");

    await syncOrderToEbriza(order, items);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(eqSpy).toHaveBeenCalledWith("id", order.id);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    const [table, values] = updateSpy.mock.calls[0];
    expect(table).toBe("orders");
    expect(values).toMatchObject({ ebriza_sync_status: "sent", ebriza_error_code: null, ebriza_error: null });
    expect(values.ebriza_bill_id).toMatch(/^mock-bill-/);
  });

  it("real mode with unmapped SKUs: no network call, 'failed' with code 0104, loud log", async () => {
    vi.stubEnv("EBRIZA_MOCK", "false");
    vi.stubEnv("EBRIZA_PATH", "1");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");

    await syncOrderToEbriza(order, items);

    expect(fetchMock).not.toHaveBeenCalled();
    const [, values] = updateSpy.mock.calls[0];
    expect(values).toMatchObject({ ebriza_sync_status: "failed", ebriza_error_code: "0104", ebriza_bill_id: null });
    expect(values.ebriza_error).toContain("prod-classic");
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("0104 no POS SKU mapped for prod-classic"));
  });

  it("Ebriza failure: order kept, 'failed' with the Ebriza error code", async () => {
    vi.stubEnv("EBRIZA_MOCK", "false");
    vi.stubEnv("EBRIZA_PATH", "1");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");
    // Pretend the map is filled so the push reaches the network layer.
    const sku = await import("./ebriza-sku-map");
    vi.spyOn(sku, "resolveEbrizaSku").mockImplementation((id) => `sku-${id}`);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ code: "0099" }), { status: 400 }));

    await syncOrderToEbriza(order, items);

    const [, values] = updateSpy.mock.calls[0];
    expect(values).toMatchObject({ ebriza_sync_status: "failed", ebriza_error_code: "0099", ebriza_bill_id: null });
  });

  it("network failure: 'failed' with kind as code, never throws", async () => {
    vi.stubEnv("EBRIZA_MOCK", "false");
    vi.stubEnv("EBRIZA_PATH", "1");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");
    const sku = await import("./ebriza-sku-map");
    vi.spyOn(sku, "resolveEbrizaSku").mockImplementation((id) => `sku-${id}`);
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(syncOrderToEbriza(order, items)).resolves.toBeUndefined();
    const [, values] = updateSpy.mock.calls[0];
    expect(values).toMatchObject({ ebriza_sync_status: "failed", ebriza_error_code: "network" });
  });

  it("does not throw when the status write itself fails", async () => {
    vi.stubEnv("EBRIZA_MOCK", "true");
    dbError = { message: "column does not exist" };

    await expect(syncOrderToEbriza(order, items)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("could not save sync status for BRG-1042"), "column does not exist");
  });
});
