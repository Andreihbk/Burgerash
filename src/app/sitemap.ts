import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Public pages only. Add legal pages here when they exist (PLAN L.5).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
}
