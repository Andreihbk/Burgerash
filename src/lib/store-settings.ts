import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";

// Store-wide "accepting online orders" flag (store_settings, single row id = 1).
// Set by the Ebriza StartAcceptingOrdersUrl webhook when the POS pauses/resumes our orders.

export const ORDERS_PAUSED_ERROR = "Nu primim comenzi online chiar acum. Te rugăm să revii în câteva minute.";

/**
 * False only when the row explicitly says paused. Fails OPEN (true) if Supabase cannot be read:
 * Ebriza is an additive layer and must never take ordering down by itself.
 */
export async function isAcceptingOrders(): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .select("accepting_orders")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("[store-settings] read failed, accepting orders:", error.message);
    return true;
  }
  return (data as { accepting_orders?: boolean } | null)?.accepting_orders !== false;
}

export async function setAcceptingOrders(accepting: boolean, updatedBy: "ebriza" | "manual"): Promise<void> {
  const { error } = await supabaseAdmin
    .from("store_settings")
    .upsert({ id: 1, accepting_orders: accepting, updated_by: updatedBy, updated_at: new Date().toISOString() });
  if (error) throw new Error(`store_settings write failed: ${error.message}`);
}
