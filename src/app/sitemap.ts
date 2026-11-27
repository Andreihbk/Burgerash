import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LEGAL_LINKS } from "@/lib/legal";

// Last real content change of each page. Bump HOME_UPDATED when the menu or the homepage changes,
// LEGAL_PAGES_UPDATED when the legal texts change (it matches LEGAL_UPDATED in src/lib/legal.ts).
const HOME_UPDATED = new Date("2026-11-27");
const LEGAL_PAGES_UPDATED = new Date("2026-11-19");

// Public pages only.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: HOME_UPDATED, changeFrequency: "weekly", priority: 1 },
    ...LEGAL_LINKS.map((l) => ({
      url: `${SITE_URL}${l.href}`,
      lastModified: LEGAL_PAGES_UPDATED,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
