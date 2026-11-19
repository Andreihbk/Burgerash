"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-runs the server page every `seconds` so the status updates without a manual reload. */
export default function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
