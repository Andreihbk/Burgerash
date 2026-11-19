// Public site identity for SEO (metadata, robots, sitemap, JSON-LD).
// Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is known; until then the Vercel production URL is used.

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Burgerash";
export const SITE_TAGLINE = "Nu facem medium. Facem crustă.";
export const SITE_DESCRIPTION =
  "Nu facem medium. Facem crustă. Smash burgeri din Sector 6, comandă direct, fără comisioane.";

/** Staff/internal routes: never indexed. */
export const PRIVATE_PATHS = ["/kitchen", "/dispatch", "/rider", "/admin", "/staff-login", "/comanda/", "/api/"];
