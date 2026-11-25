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
  "Burgerash: burgeri făcuți pe loc în Sector 6, București (Strada Porumbacu 48). Comandă online pentru ridicare sau livrare, fără comisioane.";

/** Default <title> for the homepage: brand first (ranks for "burgerash"), then what + where (local searches). */
export const SITE_TITLE = `${SITE_NAME} | Burgeri în Sector 6, București`;

/**
 * Official profiles (Instagram, Facebook, Google Maps / Business Profile, Glovo...). Used as JSON-LD `sameAs`, which
 * helps Google tie them to this site. Add Facebook/Glovo/TikTok here when they exist.
 */
export const SOCIAL_LINKS: readonly string[] = ["https://www.instagram.com/burgerash/"];

/** Staff/internal routes: never indexed. */
export const PRIVATE_PATHS = ["/kitchen", "/dispatch", "/rider", "/admin", "/staff/", "/comanda/", "/api/"];

/** Physical location. Single source for the location section, footer, contact line and JSON-LD. */
export const SITE_ADDRESS = {
  street: "Strada Porumbacu 48",
  city: "București",
  sector: "Sector 6",
  /** One-line form for display. */
  line: "Strada Porumbacu 48, București",
} as const;

/** Looked up once on OpenStreetMap Nominatim (node 7104558483). No runtime geocoding. */
export const SITE_COORDS = { lat: 44.4563518, lng: 26.0509441 } as const;

/** Free-delivery radius drawn on the map. */
export const DELIVERY_RADIUS_KM = 1;

export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/oqvQu7YiSKh3umCD6";
