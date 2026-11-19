import { afterEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: { rpc: (...args: unknown[]) => rpc(...args) },
}));
vi.mock("@/lib/ebriza-sync", () => ({ syncOrderToEbriza: vi.fn() }));
vi.mock("@/lib/stock", () => ({
  getSoldOutIds: vi.fn(async () => new Set()),
  soldOutMessage: vi.fn(),
  soldOutNames: vi.fn(() => []),
  STOCK_UNAVAILABLE_ERROR: "stock",
}));

import { POST } from "./route";

const validBody = {
  fulfillment_type: "pickup",
  payment_method: "cash_on_delivery",
  customer_name: "Test",
  customer_phone: "0721123456",
  items: [{ product_id: "prod-classic", quantity: 1 }],
};

function request(body: unknown = validBody) {
  return new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(body) });
}

afterEach(() => {
  vi.unstubAllEnvs();
  rpc.mockReset();
});

describe("POST /api/orders ordering switch", () => {
  it.each([undefined, "", "false", "TRUE", "1", " true"])(
    "rejects with 503 ordering_closed when NEXT_PUBLIC_ORDERING_ENABLED is %j",
    async (value) => {
      if (value !== undefined) vi.stubEnv("NEXT_PUBLIC_ORDERING_ENABLED", value);
      else vi.stubEnv("NEXT_PUBLIC_ORDERING_ENABLED", undefined as unknown as string);
      const res = await POST(request());
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "ordering_closed" });
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it("rejects before even parsing the body", async () => {
    vi.stubEnv("NEXT_PUBLIC_ORDERING_ENABLED", "false");
    const res = await POST(new Request("http://localhost/api/orders", { method: "POST", body: "not json" }));
    expect(res.status).toBe(503);
  });

  it("does not block when it is exactly 'true'", async () => {
    vi.stubEnv("NEXT_PUBLIC_ORDERING_ENABLED", "true");
    const res = await POST(request({ ...validBody, fulfillment_type: "nope" }));
    expect(res.status).toBe(400); // passes the switch, fails normal validation
  });
});
