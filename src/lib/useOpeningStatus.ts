"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getStatus, type OpeningStatus } from "./hours";

const subscribe = (notify: () => void) => {
  const id = setInterval(notify, 30_000);
  return () => clearInterval(id);
};
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/** Live opening status, refreshed every 30s. Null during SSR/hydration to avoid mismatches. */
export function useOpeningStatus(): OpeningStatus | null {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  return useMemo(() => (minute === null ? null : getStatus(new Date(minute * 60_000))), [minute]);
}
