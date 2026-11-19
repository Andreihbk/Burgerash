import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { EBRIZA_SKU_TO_CATALOG_ID } from "@/lib/ebriza-sku-map";
import { nextScheduleStart } from "@/lib/hours";
import { setAcceptingOrders } from "@/lib/store-settings";
import { isFinalStatus } from "@/lib/order-status";
import type { FulfillmentType, OrderStatus } from "@/types/database";
import { EbrizaBillStatus } from "@/types/ebriza";
import {
  asBool,
  asInt,
  asString,
  describeShape,
  ignored,
  ok,
  pick,
  webhookLog,
  type WebhookHandler,
} from "@/lib/ebriza-webhook";

// ---------- change-status (ChangeStatusUrl) ----------

const STATUS_RANK: Record<Exclude<OrderStatus, "canceled">, number> = {
  pending: 0,
  preparing: 1,
  ready_for_packing: 2,
  out_for_delivery: 3,
  delivered: 4,
};

/**
 * Ebriza BillStatus -> our order status (owner decision: the POS drives the order status).
 * null = no change for this status (accepted, receipt printed, unknown).
 */
export function ebrizaStatusToOrderStatus(code: number, type: FulfillmentType): OrderStatus | null {
  switch (code) {
    case EbrizaBillStatus.Canceled:
      return "canceled";
    case EbrizaBillStatus.InPreparation:
      return "preparing";
    case EbrizaBillStatus.PreparationFinished:
      return "ready_for_packing";
    case EbrizaBillStatus.PickedUp:
      // Pickup: the customer took it. Delivery: the courier took it.
      return type === "pickup" ? "delivered" : "out_for_delivery";
    case EbrizaBillStatus.InDelivery:
      return type === "pickup" ? null : "out_for_delivery";
    case EbrizaBillStatus.DeliveryFinished:
      return "delivered";
    default:
      return null;
  }
}

/** Forward-only: never moves an order back, never touches a delivered/canceled one. */
export function nextOrderStatus(current: OrderStatus, target: OrderStatus | null): OrderStatus | null {
  if (!target || target === current || isFinalStatus(current)) return null;
  if (target === "canceled") return "canceled";
  return STATUS_RANK[target] > STATUS_RANK[current as Exclude<OrderStatus, "canceled">] ? target : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_NO = /^BRG-\d{4,}$/;

interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  ebriza_status: number | null;
}

export const handleChangeStatus: WebhookHandler = async (payload) => {
  const code = asInt(pick(payload, ["status", "billStatus", "statusID", "statusId", "newStatus", "state"]));
  const externalId = asString(pick(payload, ["externalOrderID", "externalOrderId"]));
  const externalNo = asString(pick(payload, ["externalOrderNo", "externalOrderNumber"]));
  const billId = asString(pick(payload, ["billID", "billId", "id"]));

  if (code === null) {
    webhookLog("change-status", "warn", `ignored: no status (${describeShape(payload)})`);
    return ignored("no_status");
  }

  let column: "id" | "order_number" | "ebriza_bill_id";
  let value: string;
  if (externalId && UUID.test(externalId)) [column, value] = ["id", externalId];
  else if (externalNo && ORDER_NO.test(externalNo)) [column, value] = ["order_number", externalNo];
  else if (billId) [column, value] = ["ebriza_bill_id", billId];
  else {
    webhookLog("change-status", "warn", `ignored: no order reference (${describeShape(payload)})`);
    return ignored("no_order_reference");
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, fulfillment_type, ebriza_status")
    .eq(column, value)
    .maybeSingle();
  if (error) throw new Error(`order lookup failed: ${error.message}`);
  const order = data as OrderRow | null;
  if (!order) {
    webhookLog("change-status", "warn", `ignored: no order for ${column} (status ${code})`);
    return ignored("order_not_found");
  }

  const next = nextOrderStatus(order.status, ebrizaStatusToOrderStatus(code, order.fulfillment_type));
  if (!next && order.ebriza_status === code) {
    return ok({ order: order.order_number, unchanged: true }); // repeated delivery: idempotent
  }

  const update: Record<string, unknown> = { ebriza_status: code, ebriza_status_at: new Date().toISOString() };
  if (next) update.status = next;

  // Conditional on the status we read: if staff changed it meanwhile, their change wins.
  const { error: writeError } = await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("id", order.id)
    .eq("status", order.status);
  if (writeError) throw new Error(`order update failed: ${writeError.message}`);

  webhookLog(
    "change-status",
    "info",
    `${order.order_number} ebriza ${code}${next ? `, status ${order.status} -> ${next}` : ", status unchanged"}`,
  );
  return ok({ order: order.order_number, status: next ?? order.status, ebrizaStatus: code });
};

// ---------- set-item-unavailable (SetItemUnavailableUrl) ----------

function collectSkus(payload: Record<string, unknown>): string[] {
  const skus = new Set<string>();
  const add = (v: unknown) => {
    const s = asString(v);
    if (s) skus.add(s);
  };
  add(pick(payload, ["sku", "productSku", "itemSku"]));
  for (const key of ["skus", "items", "products"]) {
    const list = pick(payload, [key]);
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      if (entry && typeof entry === "object") add((entry as Record<string, unknown>).sku);
      else add(entry);
    }
  }
  return [...skus];
}

export const handleSetItemUnavailable: WebhookHandler = async (payload) => {
  const skus = collectSkus(payload);
  if (skus.length === 0) {
    webhookLog("set-item-unavailable", "warn", `ignored: no SKU (${describeShape(payload)})`);
    return ignored("no_sku");
  }

  const productIds: string[] = [];
  for (const sku of skus) {
    const id = EBRIZA_SKU_TO_CATALOG_ID.get(sku);
    if (id?.startsWith("prod-")) productIds.push(id);
    // Unknown SKUs and modifiers (no stock flag) are logged, never stored.
    else webhookLog("set-item-unavailable", "warn", `skipped SKU ${sku}: ${id ? "modifier" : "not in ebriza-sku-map"}`);
  }
  if (productIds.length === 0) return ignored("no_known_product");

  // Explicit "available again" flag, if Ebriza ever sends one (Q12). Otherwise: unavailable.
  const available =
    asBool(pick(payload, ["available", "isAvailable"])) ??
    ((): boolean | null => {
      const unavailable = asBool(pick(payload, ["unavailable", "isUnavailable", "snoozed"]));
      return unavailable === null ? null : !unavailable;
    })() ??
    false;

  const now = new Date();
  if (available) {
    // Clears only POS snoozes; a manual sold-out from /admin stays.
    const { error } = await supabaseAdmin
      .from("product_stock")
      .update({ sold_out: false, snoozed_until: null, updated_at: now.toISOString() })
      .in("product_id", productIds)
      .eq("sold_out_source", "ebriza");
    if (error) throw new Error(`product_stock write failed: ${error.message}`);
    webhookLog("set-item-unavailable", "info", `available again: ${productIds.join(", ")}`);
    return ok({ available: productIds });
  }

  // Do not turn a manual (no-expiry) sold-out into an expiring POS snooze.
  const { data, error: readError } = await supabaseAdmin
    .from("product_stock")
    .select("product_id, sold_out, sold_out_source")
    .in("product_id", productIds);
  if (readError) throw new Error(`product_stock read failed: ${readError.message}`);
  const manual = new Set(
    ((data ?? []) as { product_id: string; sold_out: boolean; sold_out_source: string }[])
      .filter((r) => r.sold_out && r.sold_out_source === "manual")
      .map((r) => r.product_id),
  );
  const toSnooze = productIds.filter((id) => !manual.has(id));
  if (toSnooze.length === 0) return ok({ snoozed: [], alreadyManual: [...manual] });

  const snoozedUntil = nextScheduleStart(now).toISOString();
  const { error } = await supabaseAdmin.from("product_stock").upsert(
    toSnooze.map((product_id) => ({
      product_id,
      sold_out: true,
      sold_out_source: "ebriza",
      snoozed_until: snoozedUntil,
      updated_at: now.toISOString(),
    })),
  );
  if (error) throw new Error(`product_stock write failed: ${error.message}`);

  webhookLog("set-item-unavailable", "info", `snoozed until ${snoozedUntil}: ${toSnooze.join(", ")}`);
  return ok({ snoozed: toSnooze, until: snoozedUntil });
};

// ---------- start-accepting-orders (StartAcceptingOrdersUrl) ----------

export const handleStartAcceptingOrders: WebhookHandler = async (payload) => {
  const positive = asBool(
    pick(payload, ["accepting", "acceptingOrders", "isAccepting", "acceptOrders", "startAcceptingOrders", "enabled", "isOpen", "open", "active"]),
  );
  const negative = asBool(pick(payload, ["paused", "isPaused", "snoozed", "stopAcceptingOrders", "disabled"]));
  const accepting = positive ?? (negative === null ? null : !negative);

  if (accepting === null) {
    webhookLog("start-accepting-orders", "warn", `ignored: no accepting/paused flag (${describeShape(payload)})`);
    return ignored("no_flag");
  }

  await setAcceptingOrders(accepting, "ebriza");
  webhookLog("start-accepting-orders", "info", accepting ? "resumed online orders" : "paused online orders");
  return ok({ accepting });
};

// ---------- sync-products (SyncProductsUrl) ----------

/**
 * Ack + log a summary only. The physical menu board / catalog.ts is the source of truth for
 * names, prices and descriptions (CLAUDE.md): an Ebriza menu push never overwrites them.
 */
export const handleSyncProducts: WebhookHandler = async (payload) => {
  const counts = ["items", "products", "categories", "modifiers"]
    .map((key) => [key, pick(payload, [key])] as const)
    .filter(([, v]) => Array.isArray(v))
    .map(([key, v]) => `${key}=${(v as unknown[]).length}`);

  const skus = new Set<string>();
  for (const key of ["items", "products"]) {
    const list = pick(payload, [key]);
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const sku = entry && typeof entry === "object" ? asString((entry as Record<string, unknown>).sku) : null;
      if (sku) skus.add(sku);
    }
  }
  const unknown = [...skus].filter((s) => !EBRIZA_SKU_TO_CATALOG_ID.has(s));

  webhookLog(
    "sync-products",
    "info",
    `received (${counts.join(", ") || describeShape(payload)}); not applied, catalog.ts is the source of truth` +
      (unknown.length ? `; SKUs not in our map: ${unknown.slice(0, 20).join(", ")}` : ""),
  );
  return ok({ applied: false });
};
