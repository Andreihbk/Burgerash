// Catalog id -> Ebriza POS SKU. This is the ONLY place SKUs for the POS are decided
// (docs/EBRIZA_PLAN.md section 5b). The same SKUs must be entered as the provider SKU on each
// product in the Ebriza nomenclator and enabled for the Burgerash location (else 0104 / 0106).
//
// SKUs are a contract: lowercase, ASCII, unique, never renamed once in use.
// null = not mapped: never sent to Ebriza, logged loudly (error 0104), the push fails,
// so Ebriza never creates products on its own.

export const EBRIZA_SKU_MAP: Record<string, string | null> = {
  // Products
  "prod-classic": "brg-classic", // CLASIC
  "prod-hot-boy": "brg-hot-boy", // HOT BOY
  "prod-double": "brg-double", // DOUBLE
  "prod-crispy": "chk-crispy", // CRISPY
  "prod-hot-honey": "chk-hot-honey", // HOT HONEY
  "prod-crispy-bacon": "chk-crispy-bacon", // CRISPY BACON
  "prod-fries": "side-fries",
  "prod-chips": "side-chips",
  "prod-nuggets": "side-nuggets",
  "prod-sauces": "side-sauce",
  "prod-cola": "drink-cola",
  "prod-fanta": "drink-fanta",
  "prod-sprite": "drink-sprite",
  "prod-water": "drink-water",
  // Modifiers (sent with isMod: true)
  "mod-extra-patty": "mod-extra-patty",
  "mod-extra-cheddar": "mod-extra-cheddar",
  "mod-extra-bacon": "mod-extra-bacon",
  "mod-extra-jalapeno": "mod-extra-jalapeno",
  "mod-no-onion": "mod-fara-ceapa",
  "mod-no-pickles": "mod-fara-muraturi",
};

/**
 * Catalog ids that carry an SGR bottle deposit (packaged drinks). With EBRIZA_SEND_SGR=true the
 * payload adds `{ type: 1001, lock, quantity }` for each of these lines; the POS sets the amount.
 * Off by default: the website does not charge the deposit yet (owner decision, EBRIZA_PLAN C4a/C5).
 */
export const EBRIZA_BOTTLE_DEPOSIT_IDS: ReadonlySet<string> = new Set([
  "prod-cola",
  "prod-fanta",
  "prod-sprite",
  "prod-water",
]);

/** Ebriza SKU -> catalog id (for webhooks that name a POS product). */
export const EBRIZA_SKU_TO_CATALOG_ID: ReadonlyMap<string, string> = new Map(
  Object.entries(EBRIZA_SKU_MAP).flatMap(([id, sku]) => (sku ? [[sku, id] as const] : [])),
);

/**
 * Returns the POS SKU for a catalog id, or null when unmapped (logged as 0104).
 * In mock mode only, an unmapped id gets a `TODO-<id>` placeholder so the whole
 * pipeline can be tested before the real SKUs exist. The network is never called in mock mode.
 */
export function resolveEbrizaSku(catalogId: string | null, options: { mock: boolean }): string | null {
  const sku = catalogId ? EBRIZA_SKU_MAP[catalogId] : null;
  if (sku) return sku;

  const label = catalogId ?? "(no catalog id)";
  if (options.mock) {
    console.warn(`[ebriza] 0104 no POS SKU mapped for ${label}; using placeholder (mock mode)`);
    return `TODO-${label}`;
  }
  console.error(`[ebriza] 0104 no POS SKU mapped for ${label} in ebriza-sku-map.ts; order will not be pushed`);
  return null;
}
