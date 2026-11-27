"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/types/database";

const SELECT = "*, items:order_items(*)";

/**
 * Live list of orders (with items) in some statuses, for /kitchen and /dispatch. Audit R13.
 * `statuses` must be a stable (module-level) array. Initial load, Realtime on `orders`, catch-up on reconnect and when the tab becomes visible.
 * Orders that arrive in `freshStatus` after the first load are marked "fresh" and `onArrive` runs (the beep).
 * Reads Supabase only (never Ebriza). Same queries and columns as before; RLS decides what staff may see.
 */
export function useLiveOrders({
  channelName,
  statuses,
  freshStatus,
  refetchMissing,
  onArrive,
}: {
  channelName: string;
  statuses: readonly OrderStatus[];
  freshStatus: OrderStatus;
  /** A known order that changes back into one of `statuses` but is no longer in the list is fetched again (dispatch). */
  refetchMissing: boolean;
  /** Must be stable (useCallback), or the Realtime channel is re-created on every render. */
  onArrive: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  // Without Supabase there is nothing to load: show the message right away.
  const [loaded, setLoaded] = useState(!isSupabaseConfigured);
  const [error, setError] = useState<string | null>(isSupabaseConfigured ? null : "Supabase nu este configurat.");
  const [connected, setConnected] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  const knownIds = useRef<Set<string>>(new Set());
  // Latest list for the Realtime handler (it is created once per subscription).
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  const firstLoad = useRef(true);
  const markFresh = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setFresh((prev) => new Set([...prev, ...ids]));
    onArrive();
  }, [onArrive]);

  const clearFresh = useCallback((id: string) => {
    setFresh((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("orders")
      .select(SELECT)
      .in("status", statuses)
      .order("created_at", { ascending: true });
    if (err) {
      setError("Nu pot încărca comenzile. Reîncerc la reconectare.");
      return;
    }
    setError(null);
    const list = (data ?? []) as Order[];
    const newcomers = list.filter((o) => !knownIds.current.has(o.id) && o.status === freshStatus);
    list.forEach((o) => knownIds.current.add(o.id));
    setOrders(list);
    setLoaded(true);
    if (!firstLoad.current) markFresh(newcomers.map((o) => o.id));
    firstLoad.current = false;
  }, [statuses, freshStatus, markFresh]);

  // Initial load + Realtime subscription (unsubscribes on unmount).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // load() only sets state after its await (network), so this does not render synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    const inList = (s: string) => (statuses as readonly string[]).includes(s);
    const fetchFull = async (id: string) => {
      const { data } = await supabase.from("orders").select(SELECT).eq("id", id).single();
      return (data as Order | null) ?? null;
    };

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) setOrders((prev) => prev.filter((o) => o.id !== id));
          return;
        }
        const row = payload.new as Order;
        if (!inList(row.status)) {
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
          return;
        }
        if (payload.eventType === "INSERT" || !knownIds.current.has(row.id)) {
          // Items are not in the orders payload: fetch the full order once.
          const full = await fetchFull(row.id);
          if (!full) return;
          const isNew = !knownIds.current.has(full.id);
          knownIds.current.add(full.id);
          setOrders((prev) => [...prev.filter((o) => o.id !== full.id), full]);
          if (isNew && full.status === freshStatus) markFresh([full.id]);
          return;
        }
        // UPDATE of a known order: merge fields, keep the items we already have.
        // Checked on a ref, not inside the setOrders updater: React runs updaters later, so a flag set there
        // was still false here and an order coming back to "DE PREDAT" only showed after a reload.
        const missing = !ordersRef.current.some((o) => o.id === row.id);
        setOrders((prev) => prev.map((o) => (o.id === row.id ? { ...o, ...row, items: o.items } : o)));
        if (missing && refetchMissing) {
          // It came back from another column/screen and is not in state: fetch it again.
          const full = await fetchFull(row.id);
          if (full) {
            setOrders((prev) => [...prev.filter((o) => o.id !== full.id), full]);
            if (full.status === freshStatus) markFresh([full.id]);
          }
        }
      })
      .subscribe((status) => {
        const ok = status === "SUBSCRIBED";
        setConnected(ok);
        if (ok) void load(); // catch up on anything missed while offline
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [channelName, statuses, freshStatus, refetchMissing, load, markFresh]);

  return { orders, setOrders, loaded, error, setError, connected, fresh, clearFresh };
}
