import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------- In-memory Supabase fake (only what the webhook handlers use) ----------

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = { orders: [], product_stock: [], store_settings: [] };
const keyOf: Record<string, string> = { orders: "id", product_stock: "product_id", store_settings: "id" };
let failNextWrite = false;

function query(table: string) {
  const filters: ((r: Row) => boolean)[] = [];
  let op: { kind: "select" } | { kind: "update"; values: Row } | { kind: "upsert"; rows: Row[] } = { kind: "select" };
  let single = false;

  const run = () => {
    if (op.kind !== "select" && failNextWrite) {
      failNextWrite = false;
      return { data: null, error: { message: "db down" } };
    }
    const rows = db[table].filter((r) => filters.every((f) => f(r)));
    if (op.kind === "update") {
      for (const r of rows) Object.assign(r, op.values);
      return { data: null, error: null };
    }
    if (op.kind === "upsert") {
      for (const row of op.rows) {
        const existing = db[table].find((r) => r[keyOf[table]] === row[keyOf[table]]);
        if (existing) Object.assign(existing, row);
        else db[table].push({ ...row });
      }
      return { data: null, error: null };
    }
    const copies = rows.map((r) => ({ ...r }));
    return { data: single ? (copies[0] ?? null) : copies, error: null };
  };

  const builder = {
    select: () => builder,
    update: (values: Row) => ((op = { kind: "update", values }), builder),
    upsert: (rows: Row | Row[]) => ((op = { kind: "upsert", rows: Array.isArray(rows) ? rows : [rows] }), builder),
    eq: (col: string, val: unknown) => (filters.push((r) => r[col] === val), builder),
    in: (col: string, vals: unknown[]) => (filters.push((r) => vals.includes(r[col])), builder),
    maybeSingle: () => ((single = true), builder),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(run()).then(resolve, reject),
  };
  return builder;
}

vi.mock("@/lib/supabase-admin", () => ({
  isSupabaseAdminConfigured: true,
  supabaseAdmin: { from: (table: string) => query(table) },
}));

import { POST as changeStatus } from "@/app/api/ebriza/[secret]/change-status/route";
import { POST as setItemUnavailable } from "@/app/api/ebriza/[secret]/set-item-unavailable/route";
import { POST as startAccepting } from "@/app/api/ebriza/[secret]/start-accepting-orders/route";
import { POST as syncProducts } from "@/app/api/ebriza/[secret]/sync-products/route";
import { ebrizaStatusToOrderStatus, nextOrderStatus } from "./ebriza-webhook-handlers";
import { isValidWebhookSecret } from "./ebriza-webhook";
import { isAcceptingOrders } from "./store-settings";

const SECRET = "test-secret-0123456789abcdef0123456789abcdef";
const ORDER_ID = "5b0f7e7c-3c1e-4a4f-9a51-2f6d2c1e9a01";

type Route = typeof changeStatus;

function call(route: Route, body: unknown, secret = SECRET) {
  const req = new Request("https://burgerash.ro/api/ebriza/x/hook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return route(req, { params: Promise.resolve({ secret }) });
}

const logs: string[] = [];

beforeEach(() => {
  vi.stubEnv("EBRIZA_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("EBRIZA_WEBHOOK_SECRET_PREVIOUS", "");
  vi.stubEnv("EBRIZA_CLIENT_ID", "client-stage");
  vi.stubEnv("EBRIZA_MOCK", "true");
  for (const level of ["info", "warn", "error"] as const) {
    vi.spyOn(console, level).mockImplementation((msg: unknown) => void logs.push(String(msg)));
  }
  db.orders = [
    {
      id: ORDER_ID,
      order_number: "BRG-1042",
      status: "pending",
      fulfillment_type: "delivery",
      ebriza_status: null,
      ebriza_bill_id: "bill-77",
      customer_phone: "0722123456",
    },
  ];
  db.product_stock = [];
  db.store_settings = [{ id: 1, accepting_orders: true, updated_by: "manual" }];
  failNextWrite = false;
  logs.length = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("webhook auth", () => {
  it.each([
    ["wrong secret", "nope-nope-nope-nope-nope-nope-nope-nope"],
    ["empty secret", ""],
  ])("rejects a %s with 401 and changes nothing", async (_label, secret) => {
    const res = await call(changeStatus, { externalOrderID: ORDER_ID, status: 20 }, secret);
    expect(res.status).toBe(401);
    expect(db.orders[0].status).toBe("pending");
    expect(logs.join("\n")).not.toContain(SECRET);
  });

  it("fails closed when EBRIZA_WEBHOOK_SECRET is unset or too short", () => {
    vi.stubEnv("EBRIZA_WEBHOOK_SECRET", "");
    expect(isValidWebhookSecret("")).toBe(false);
    vi.stubEnv("EBRIZA_WEBHOOK_SECRET", "short");
    expect(isValidWebhookSecret("short")).toBe(false);
  });

  it("accepts the previous secret during rotation", async () => {
    vi.stubEnv("EBRIZA_WEBHOOK_SECRET", "new-secret-0123456789abcdef0123456789abcdef");
    vi.stubEnv("EBRIZA_WEBHOOK_SECRET_PREVIOUS", SECRET);
    const res = await call(changeStatus, { externalOrderID: ORDER_ID, status: 20 });
    expect(res.status).toBe(200);
  });

  it("ignores a call for another Ebriza client id (stage/live mix-up)", async () => {
    const res = await call(changeStatus, { externalOrderID: ORDER_ID, status: 20, ebrizaClientID: "client-live" });
    expect(await res.json()).toMatchObject({ ignored: "client_mismatch" });
    expect(db.orders[0].status).toBe("pending");
  });

  it("acks non-JSON bodies without crashing", async () => {
    const res = await call(changeStatus, "not json");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ignored: "not_json" });
  });
});

describe("change-status", () => {
  it("maps POS statuses to order statuses", () => {
    expect(ebrizaStatusToOrderStatus(20, "delivery")).toBe("preparing");
    expect(ebrizaStatusToOrderStatus(21, "pickup")).toBe("ready_for_packing");
    expect(ebrizaStatusToOrderStatus(90, "pickup")).toBe("delivered");
    expect(ebrizaStatusToOrderStatus(90, "delivery")).toBe("out_for_delivery");
    expect(ebrizaStatusToOrderStatus(120, "pickup")).toBeNull();
    expect(ebrizaStatusToOrderStatus(130, "delivery")).toBe("delivered");
    expect(ebrizaStatusToOrderStatus(11, "delivery")).toBe("canceled");
    expect(ebrizaStatusToOrderStatus(30, "delivery")).toBeNull();
  });

  it("only moves forward and never touches final orders", () => {
    expect(nextOrderStatus("ready_for_packing", "preparing")).toBeNull();
    expect(nextOrderStatus("delivered", "canceled")).toBeNull();
    expect(nextOrderStatus("canceled", "preparing")).toBeNull();
    expect(nextOrderStatus("preparing", "canceled")).toBe("canceled");
  });

  it("updates the order found by externalOrderID and stores the POS status", async () => {
    const res = await call(changeStatus, { externalOrderID: ORDER_ID, status: 20 });
    expect(res.status).toBe(200);
    expect(db.orders[0]).toMatchObject({ status: "preparing", ebriza_status: 20 });
    expect(logs.join("\n")).not.toContain("0722123456");
  });

  it("finds the order by externalOrderNo or bill id", async () => {
    await call(changeStatus, { externalOrderNo: "BRG-1042", status: "21" });
    expect(db.orders[0].status).toBe("ready_for_packing");
    await call(changeStatus, { id: "bill-77", status: 120 });
    expect(db.orders[0].status).toBe("out_for_delivery");
  });

  it("is idempotent and never moves an order back", async () => {
    await call(changeStatus, { externalOrderID: ORDER_ID, status: 21 });
    const repeat = await call(changeStatus, { externalOrderID: ORDER_ID, status: 21 });
    expect(await repeat.json()).toMatchObject({ unchanged: true });
    await call(changeStatus, { externalOrderID: ORDER_ID, status: 20 }); // late, out-of-order delivery
    expect(db.orders[0]).toMatchObject({ status: "ready_for_packing", ebriza_status: 20 });
  });

  it("cancels an open order on status 11", async () => {
    await call(changeStatus, { externalOrderID: ORDER_ID, status: 11 });
    expect(db.orders[0].status).toBe("canceled");
  });

  it("acks unknown shapes and unknown orders with 200 and logs only field names", async () => {
    const noStatus = await call(changeStatus, { externalOrderID: ORDER_ID, phone: "0722123456" });
    expect(await noStatus.json()).toMatchObject({ ignored: "no_status" });
    expect(logs.join("\n")).toContain("fields [externalOrderID, phone]");
    expect(logs.join("\n")).not.toContain("0722123456");

    const unknown = await call(changeStatus, { externalOrderNo: "BRG-9999", status: 20 });
    expect(await unknown.json()).toMatchObject({ ignored: "order_not_found" });
  });

  it("returns 500 when the write fails, so Ebriza can retry", async () => {
    failNextWrite = true;
    const res = await call(changeStatus, { externalOrderID: ORDER_ID, status: 20 });
    expect(res.status).toBe(500);
  });
});

describe("set-item-unavailable", () => {
  it("snoozes a mapped product until the next schedule start", async () => {
    const res = await call(setItemUnavailable, { sku: "brg-classic" });
    expect(res.status).toBe(200);
    const row = db.product_stock.find((r) => r.product_id === "prod-classic");
    expect(row).toMatchObject({ sold_out: true, sold_out_source: "ebriza" });
    expect(new Date(row!.snoozed_until as string).getTime()).toBeGreaterThan(Date.now());
  });

  it("accepts a list of items and skips unknown SKUs and modifiers", async () => {
    await call(setItemUnavailable, { items: [{ sku: "drink-cola" }, { sku: "mystery" }, { sku: "mod-extra-bacon" }] });
    expect(db.product_stock.map((r) => r.product_id)).toEqual(["prod-cola"]);
    expect(logs.join("\n")).toContain("skipped SKU mystery");
  });

  it("is idempotent", async () => {
    await call(setItemUnavailable, { sku: "brg-classic" });
    await call(setItemUnavailable, { sku: "brg-classic" });
    expect(db.product_stock).toHaveLength(1);
  });

  it("does not turn a manual sold-out into an expiring snooze", async () => {
    db.product_stock = [{ product_id: "prod-classic", sold_out: true, sold_out_source: "manual", snoozed_until: null }];
    await call(setItemUnavailable, { sku: "brg-classic" });
    expect(db.product_stock[0]).toMatchObject({ sold_out_source: "manual", snoozed_until: null });
  });

  it("clears only POS snoozes on an explicit available flag", async () => {
    db.product_stock = [
      { product_id: "prod-classic", sold_out: true, sold_out_source: "ebriza", snoozed_until: "2099-01-01T00:00:00Z" },
      { product_id: "prod-cola", sold_out: true, sold_out_source: "manual", snoozed_until: null },
    ];
    await call(setItemUnavailable, { skus: ["brg-classic", "drink-cola"], available: true });
    expect(db.product_stock[0]).toMatchObject({ sold_out: false });
    expect(db.product_stock[1]).toMatchObject({ sold_out: true });
  });

  it("acks a body without SKU", async () => {
    const res = await call(setItemUnavailable, { foo: 1 });
    expect(await res.json()).toMatchObject({ ignored: "no_sku" });
  });
});

describe("start-accepting-orders", () => {
  it("pauses and resumes online orders", async () => {
    await call(startAccepting, { paused: true });
    expect(db.store_settings[0]).toMatchObject({ accepting_orders: false, updated_by: "ebriza" });
    expect(await isAcceptingOrders()).toBe(false);

    await call(startAccepting, { acceptingOrders: true });
    expect(db.store_settings[0].accepting_orders).toBe(true);
    expect(await isAcceptingOrders()).toBe(true);
  });

  it("is idempotent", async () => {
    await call(startAccepting, { accepting: false });
    const res = await call(startAccepting, { accepting: false });
    expect(res.status).toBe(200);
    expect(db.store_settings).toHaveLength(1);
  });

  it("ignores a body without a flag (no change)", async () => {
    const res = await call(startAccepting, { something: "else" });
    expect(await res.json()).toMatchObject({ ignored: "no_flag" });
    expect(db.store_settings[0].accepting_orders).toBe(true);
  });
});

describe("sync-products", () => {
  it("acks and never writes anything", async () => {
    const before = JSON.stringify(db);
    const res = await call(syncProducts, { items: [{ sku: "brg-classic", price: 99 }, { sku: "new-thing" }], categories: [] });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ applied: false });
    expect(JSON.stringify(db)).toBe(before);
    expect(logs.join("\n")).toContain("SKUs not in our map: new-thing");
  });
});
