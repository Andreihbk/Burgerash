"use client";

import { useMemo } from "react";
import { useOpeningStatus } from "@/lib/useOpeningStatus";
import type { OpeningStatus } from "@/lib/hours";

// DEV ONLY, visual only: ?preview=open|closed forces the hero/board/status visuals. The NODE_ENV check is
// inlined by Next, so this is dead code in production. The server-side hours check on /api/orders is untouched.
function applyDevPreview(status: OpeningStatus | null): OpeningStatus | null {
  if (process.env.NODE_ENV === "production" || !status) return status;
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview === "open") return { open: true, todayHours: status.todayHours, closesAt: status.closesAt ?? "23:00", next: null };
  if (preview === "closed") return { open: false, todayHours: status.todayHours, closesAt: null, next: status.next ?? { when: "mâine", time: "12:00" } };
  return status;
}

/** Opening status (with the dev preview override). Cheap to call from several islands. */
export function useStorefrontStatus(): OpeningStatus | null {
  const real = useOpeningStatus();
  return useMemo(() => applyDevPreview(real), [real]);
}
