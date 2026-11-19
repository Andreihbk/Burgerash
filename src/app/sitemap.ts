import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LEGAL_LINKS } from "@/lib/legal";

// Public pages only.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...LEGAL_LINKS.map((l) => ({ url: `${SITE_URL}${l.href}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
