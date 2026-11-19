import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
// Opening hours depend on the wall clock: always open in these tests.
vi.mock("@/lib/hours", () => ({ getStatus: () => ({ open: true }), CLOSED_ORDER_ERROR: "closed" }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));

import { POST } from "./route";
import { HONEYPOT_FIELD, TOO_FAST_ERROR } from "@/lib/bot-check";

const validBody = {
  fulfillment_type: "pickup",
  payment_method: "cash_on_delivery",
  customer_name: "Test",
  customer_phone: "0721123456",
  form_elapsed_ms: 15_000,
  items: [{ product_id: "prod-classic", quantity: 1 }],
};

function request(body: unknown = validBody) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "x-real-ip": "203.0.113.7" },
    body: JSON.stringify(body),
  });
}

/** Supabase RPC stub: the rate limiter answers `limiterAnswer`, create_order succeeds. */
function stubRpc(limiterAnswer: { data: unknown; error: unknown } = { data: true, error: null }) {
  rpc.mockImplementation(async (fn: string) =>
    fn === "check_order_rate_limit"
      ? limiterAnswer
      : { data: [{ id: "order-1", order_number: "BRG-0001", public_token: "tok" }], error: null },
  );
}

const calledFns = () => rpc.mock.calls.map((c) => c[0]);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
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

describe("POST /api/orders bot protection, validation and rate limit (B.1)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ORDERING_ENABLED", "true");
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubRpc();
  });

  it("creates an order on the happy path, after the rate limit", async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, order_number: "BRG-0001" });
    expect(calledFns()).toEqual(["check_order_rate_limit", "create_order"]);
  });

  it("honeypot: fake success, and Supabase is never called (no order, no quota used)", async () => {
    const res = await POST(request({ ...validBody, [HONEYPOT_FIELD]: "http://spam.example" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.order_number).toMatch(/^BRG-\d{4}$/);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("honeypot is checked before input validation", async () => {
    const res = await POST(request({ [HONEYPOT_FIELD]: "x", form_elapsed_ms: 15_000 }));
    expect(res.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("too fast: a normal 400 a human can retry, no Supabase call", async () => {
    const res = await POST(request({ ...validBody, form_elapsed_ms: 800 }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: TOO_FAST_ERROR });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("invalid input never reaches the rate limiter", async () => {
    for (const body of [
      { ...validBody, customer_phone: "12345" },
      { ...validBody, customer_name: "a".repeat(81) },
      { ...validBody, items: [{ product_id: "prod-classic", quantity: 21 }] },
      { ...validBody, items: Array.from({ length: 31 }, () => ({ product_id: "prod-classic", quantity: 1 })) },
    ]) {
      const res = await POST(request(body));
      expect(res.status).toBe(400);
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a non-object JSON body", async () => {
    const res = await POST(request([1, 2]));
    expect(res.status).toBe(400);
  });

  it("over the limit: 429 rate_limited with Retry-After, create_order never called", async () => {
    stubRpc({ data: false, error: null });
    const res = await POST(request());
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
    expect(res.headers.get("Retry-After")).toBe("600");
    expect(calledFns()).toEqual(["check_order_rate_limit"]);
  });

  it("fails open: a broken rate-limit table still lets the order through (and logs it)", async () => {
    stubRpc({ data: null, error: { message: 'relation "order_rate_limits" does not exist' } });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(calledFns()).toEqual(["check_order_rate_limit", "create_order"]);
    expect(console.error).toHaveBeenCalled();
  });

  it("pricing runs after the rate limit (an unknown product counts against the quota)", async () => {
    const res = await POST(request({ ...validBody, items: [{ product_id: "nope", quantity: 1 }] }));
    expect(res.status).toBe(400);
    expect(calledFns()).toEqual(["check_order_rate_limit"]);
  });
});
