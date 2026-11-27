"use client";

import { useSyncExternalStore } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase-config";
import { soldOutIds, type StockRow } from "@/lib/stock-row";

// Live "stoc epuizat" flags for the storefront (anon read of product_stock + Realtime).
// One shared store: the first subscriber loads the table and opens one channel, the last one closes it.
// Display only: /api/orders is the real gate. If Supabase is unreachable nothing shows as sold out.
//
// Speed (audit R2): the first read is a plain fetch to PostgREST, so supabase-js + Realtime (~68 KB gz)
// are not in the first load of "/". The client is imported and the channel opened only once the
// browser is idle after the page has loaded.

const EMPTY: ReadonlySet<string> = new Set();
let soldOut: ReadonlySet<string> = EMPTY;
let channel: RealtimeChannel | null = null;
let client: SupabaseClient | null = null;
/** Bumped on every start/stop, so a late async step from an old start does nothing. */
let generation = 0;
let cancelIdle: (() => void) | null = null;
const listeners = new Set<() => void>();

function setSoldOut(next: ReadonlySet<string>) {
  soldOut = next;
  listeners.forEach((notify) => notify());
}

async function load(gen: number) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/product_stock?select=product_id,sold_out,snoozed_until`, {
      headers: { apikey: supabaseAnonKey, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return;
    const rows = (await res.json()) as StockRow[];
    if (gen !== generation || !Array.isArray(rows)) return;
    setSoldOut(soldOutIds(rows));
  } catch {
    // Offline or blocked: keep what we have (nothing sold out by default).
  }
}

function applyChange(row: StockRow | undefined, deleted: boolean) {
  if (!row?.product_id) return;
  const next = new Set(soldOut);
  if (deleted || soldOutIds([row]).size === 0) next.delete(row.product_id);
  else next.add(row.product_id);
  setSoldOut(next);
}

/** Runs `fn` once the page has loaded and the main thread is idle. Returns a cancel function. */
function whenIdle(fn: () => void): () => void {
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(fn, { timeout: 5000 });
    else timer = setTimeout(fn, 2000);
  };
  const onLoad = () => schedule();
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    window.removeEventListener("load", onLoad);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer !== undefined) clearTimeout(timer);
  };
}

async function openRealtime(gen: number) {
  const { supabase } = await import("@/lib/supabase");
  if (gen !== generation) return;
  client = supabase;
  channel = supabase
    .channel("product-stock")
    .on("postgres_changes", { event: "*", schema: "public", table: "product_stock" }, (payload) => {
      if (payload.eventType === "DELETE") applyChange(payload.old as StockRow, true);
      else applyChange(payload.new as StockRow, false);
    })
    // Reload on every reconnect so changes missed while offline are picked up.
    .subscribe((status) => {
      if (status === "SUBSCRIBED") void load(gen);
    });
}

function start() {
  if (!isSupabaseConfigured) return;
  const gen = ++generation;
  void load(gen);
  cancelIdle = whenIdle(() => {
    cancelIdle = null;
    void openRealtime(gen);
  });
}

function stop() {
  generation++;
  cancelIdle?.();
  cancelIdle = null;
  if (channel && client) void client.removeChannel(channel);
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
