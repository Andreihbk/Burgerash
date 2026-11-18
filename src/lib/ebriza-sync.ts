import "server-only";

import { supabase } from "@/lib/supabase";
import { isEbrizaMockMode, openBillWithClient } from "@/lib/ebriza";
import { buildOpenBillPayload, EbrizaPayloadError, type EbrizaPayloadItem, type EbrizaPayloadOrder } from "@/lib/ebriza-payload";
import { resolveEbrizaSku } from "@/lib/ebriza-sku-map";
import type { EbrizaSyncStatus } from "@/types/database";

interface SyncOutcome {
  status: Extract<EbrizaSyncStatus, "sent" | "failed">;
  billId: string | null;
  errorCode: string | null;
  error: string | null;
}

async function save(orderId: string, orderNo: string, outcome: SyncOutcome): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      ebriza_sync_status: outcome.status,
      ebriza_bill_id: outcome.billId,
      ebriza_error_code: outcome.errorCode,
      ebriza_error: outcome.error ? outcome.error.slice(0, 500) : null,
    })
    .eq("id", orderId);
  // The order is already stored; a failed status write must never surface to the customer.
  if (error) console.error(`[ebriza] could not save sync status for ${orderNo}:`, error.message);
}

/**
 * Pushes a stored order to Ebriza and records the outcome on the order row.
 * Call it AFTER the order is saved in Supabase. Never throws: the order is kept
 * whatever happens (status stays 'pending' if even the status write fails).
 */
export async function syncOrderToEbriza(order: EbrizaPayloadOrder, items: EbrizaPayloadItem[]): Promise<void> {
  const orderNo = order.order_number;
  let outcome: SyncOutcome;

  try {
    const mock = isEbrizaMockMode();
    // SKUs come from ebriza-sku-map.ts, not from the catalog snapshot.
    const mapped = items.map((item) => ({
      ...item,
      ebriza_sku: resolveEbrizaSku(item.product_id, { mock }),
      modifiers: item.modifiers.map((m) => ({ ...m, ebriza_sku: resolveEbrizaSku(m.id, { mock }) })),
    }));

    const payload = buildOpenBillPayload(order, mapped);
    const result = await openBillWithClient(payload);

    outcome = result.ok
      ? { status: "sent", billId: result.data.billId, errorCode: null, error: null }
      : {
          status: "failed",
          billId: null,
          errorCode: result.errorCode ?? result.kind,
          error: result.message,
        };
  } catch (err) {
    if (err instanceof EbrizaPayloadError) {
      console.error(`[ebriza] ${orderNo} not pushed: ${err.code} ${err.message}`);
      outcome = { status: "failed", billId: null, errorCode: err.code, error: err.message };
    } else {
      console.error(`[ebriza] ${orderNo} unexpected error:`, err instanceof Error ? err.message : "unknown");
      outcome = { status: "failed", billId: null, errorCode: "unexpected", error: "Unexpected error while pushing to Ebriza" };
    }
  }

  await save(order.id, orderNo, outcome).catch((err) =>
    console.error(`[ebriza] status write threw for ${orderNo}:`, err instanceof Error ? err.message : "unknown"),
  );
}
