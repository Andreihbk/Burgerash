// Sold-out ("stoc epuizat") check for /api/orders. Server-only: uses the service_role client.
// A row in product_stock with sold_out = true means sold out; no row means available.
import { INITIAL_PRODUCTS } from "@/lib/catalog";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const STOCK_UNAVAILABLE_ERROR = "Nu putem verifica stocul acum. Încearcă din nou în câteva momente.";

/** Ids of products currently marked sold out. Throws if Supabase cannot be read. */
export async function getSoldOutIds(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin.from("product_stock").select("product_id").eq("sold_out", true);
  if (error) throw new Error(`product_stock read failed: ${error.message}`);
  return new Set((data ?? []).map((row: { product_id: string }) => row.product_id));
}

/** Names of the requested products that are sold out (deduplicated, in request order). */
export function soldOutNames(requestedIds: unknown[], soldOut: Set<string>): string[] {
  const names: string[] = [];
  for (const id of requestedIds) {
    if (typeof id !== "string" || !soldOut.has(id)) continue;
    const name = INITIAL_PRODUCTS.find((p) => p.id === id)?.name ?? id;
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

export function soldOutMessage(names: string[]): string {
  return names.length === 1
    ? `${names[0]} este epuizat momentan. Scoate-l din coș ca să continui.`
    : `${names.join(", ")} sunt epuizate momentan. Scoate-le din coș ca să continui.`;
}
