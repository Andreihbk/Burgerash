// Public site identity for SEO (metadata, robots, sitemap, JSON-LD).
// Canonical domain is https://www.burgerash.ro. NEXT_PUBLIC_SITE_URL may override it (e.g. staging).

const DEFAULT_SITE_URL = "https://www.burgerash.ro";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (explicit || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Burgerash";
export const SITE_TAGLINE = "Nu facem medium. Facem crustă.";
export const SITE_DESCRIPTION =
  "Nu facem medium. Facem crustă. Smash burgeri din Sector 6, comandă direct, fără comisioane.";

/** Staff/internal routes: never indexed. */
export const PRIVATE_PATHS = ["/kitchen", "/dispatch", "/rider", "/admin", "/staff/", "/comanda/", "/api/"];
