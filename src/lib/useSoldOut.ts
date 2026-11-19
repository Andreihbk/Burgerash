"use client";

import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Live "stoc epuizat" flags for the storefront (anon read of product_stock + Realtime).
// One shared store: the first subscriber loads the table and opens one channel, the last one closes it.
// Display only: /api/orders is the real gate. If Supabase is unreachable nothing shows as sold out.

type StockRow = { product_id: string; sold_out?: boolean };

const EMPTY: ReadonlySet<string> = new Set();
let soldOut: ReadonlySet<string> = EMPTY;
let channel: RealtimeChannel | null = null;
const listeners = new Set<() => void>();

function setSoldOut(next: ReadonlySet<string>) {
  soldOut = next;
  listeners.forEach((notify) => notify());
}

async function load() {
  const { data, error } = await supabase.from("product_stock").select("product_id, sold_out");
  if (error || !data) return;
  setSoldOut(new Set((data as StockRow[]).filter((r) => r.sold_out).map((r) => r.product_id)));
}

function applyChange(row: StockRow | undefined, deleted: boolean) {
  if (!row?.product_id) return;
  const next = new Set(soldOut);
  if (deleted || !row.sold_out) next.delete(row.product_id);
  else next.add(row.product_id);
  setSoldOut(next);
}

function start() {
  if (!isSupabaseConfigured) return;
  channel = supabase
    .channel("product-stock")
    .on("postgres_changes", { event: "*", schema: "public", table: "product_stock" }, (payload) => {
      if (payload.eventType === "DELETE") applyChange(payload.old as StockRow, true);
      else applyChange(payload.new as StockRow, false);
    })
    // (Re)load on every (re)connect so changes missed while offline are picked up.
    .subscribe((status) => {
      if (status === "SUBSCRIBED") void load();
    });
}

function stop() {
  if (channel) void supabase.removeChannel(channel);
  channel = null;
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) stop();
  };
}

const getSnapshot = () => soldOut;
const getServerSnapshot = () => EMPTY;

/** Ids of products currently sold out. Empty during SSR/hydration. */
export function useSoldOutIds(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsSoldOut(productId: string): boolean {
  return useSoldOutIds().has(productId);
}
