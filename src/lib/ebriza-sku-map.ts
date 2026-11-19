// Catalog id -> Ebriza POS SKU. This is the ONLY place SKUs for the POS are decided
// (plan task E.5 fills it from the POS product export).
//
// null = TODO. An unmapped id is never sent to Ebriza: it is logged loudly (error 0104)
// and the push fails, so Ebriza never creates products on its own.

export const EBRIZA_SKU_MAP: Record<string, string | null> = {
  // Products
  "prod-classic": null, // CLASIC
  "prod-hot-boy": null, // HOT BOY
  "prod-double": null, // DOUBLE
  "prod-crispy": null, // CRISPY
  "prod-hot-honey": null, // HOT HONEY
  "prod-crispy-bacon": null, // CRISPY BACON
  "prod-fries": null,
  "prod-chips": null,
  "prod-nuggets": null,
  "prod-sauces": null,
  "prod-cola": null,
  "prod-fanta": null,
  "prod-sprite": null,
  "prod-water": null,
  // Modifiers
  "mod-extra-patty": null,
  "mod-extra-cheddar": null,
  "mod-extra-bacon": null,
  "mod-extra-jalapeno": null,
  "mod-no-onion": null,
  "mod-no-pickles": null,
};

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
