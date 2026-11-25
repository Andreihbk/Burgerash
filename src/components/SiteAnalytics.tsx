"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PRIVATE_PATHS } from "@/lib/site";

// Vercel Web Analytics + Speed Insights: cookieless, no keys (turned on per project in the Vercel dashboard).
// Staff/internal pages are not counted, so the numbers are customers only.
function isPrivate(url: string): boolean {
  const path = new URL(url).pathname;
  return PRIVATE_PATHS.some((p) => path === p.replace(/\/$/, "") || path.startsWith(p.endsWith("/") ? p : `${p}/`));
}

function beforeSend<T extends { url: string }>(event: T): T | null {
  return isPrivate(event.url) ? null : event;
}

export default function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={(e: BeforeSendEvent) => beforeSend(e)} />
      <SpeedInsights beforeSend={beforeSend} />
    </>
  );
}
