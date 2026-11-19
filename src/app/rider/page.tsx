"use client";

// /rider: phone-first view of the orders out for delivery for ONE rider. Supabase only (never Ebriza).
// Rider choice is remembered in localStorage (not a login: anyone can pick any name).
// Staff only: proxy.ts requires a Supabase Auth session; RLS lets `authenticated` read orders and update status/rider_name.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RIDERS } from "@/lib/riders";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Order } from "@/types/database";

const STORAGE_KEY = "burgerash-rider";
const UNDO_MS = 6000;

// localStorage as an external store: server snapshot is null so hydration matches.
const riderListeners = new Set<() => void>();
function subscribeRider(cb: () => void) {
  riderListeners.add(cb);
  return () => void riderListeners.delete(cb);
}
function readRider(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && (RIDERS as readonly string[]).includes(saved) ? saved : null;
  } catch {
    return null;
  }
}
const readRiderServer = () => null;

function sortOldestFirst(list: Order[]): Order[] {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function money(n: number): string {
  return `${Number(n).toFixed(2).replace(".", ",")} RON`;
}

function collect(order: Order): { label: string; due: boolean } {
  if (order.is_paid || order.payment_method === "online_card") return { label: "PLĂTIT ONLINE · nu încasa", due: false };
  if (order.payment_method === "cash_on_delivery") return { label: "NUMERAR LA LIVRARE", due: true };
  return { label: "CARD LA LIVRARE", due: true };
}

export default function RiderPage() {
  const rider = useSyncExternalStore(subscribeRider, readRider, readRiderServer);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undo, setUndo] = useState<Order | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function choose(name: string | null) {
    setOrders([]);
    setLoaded(false);
    setUndo(null);
    try {
      if (name) localStorage.setItem(STORAGE_KEY, name);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    riderListeners.forEach((cb) => cb());
  }

  const load = useCallback(async (name: string) => {
    const { data, error: err } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "out_for_delivery")
      .eq("rider_name", name)
      .order("created_at", { ascending: true });
    if (err) {
      setError("Nu pot încărca comenzile. Reîncerc la reconectare.");
      return;
    }
    setError(null);
    setOrders((data ?? []) as Order[]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!rider) return;
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`rider-orders-${rider}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) setOrders((prev) => prev.filter((o) => o.id !== id));
          return;
        }
        const row = payload.new as Order;
        if (row.status === "out_for_delivery" && row.rider_name === rider) {
          setOrders((prev) => [...prev.filter((o) => o.id !== row.id), row]);
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
        }
      })
      .subscribe((status) => {
        const ok = status === "SUBSCRIBED";
        setConnected(ok);
        if (ok) void load(rider);
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") void load(rider);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [rider, load]);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  useEffect(() => {
    document.title = rider ? `${rider} | Burgerash` : "Curier | Burgerash";
  }, [rider]);

  async function deliver(order: Order) {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    const { error: err } = await supabase.from("orders").update({ status: "delivered" }).eq("id", order.id);
    if (err) {
      setOrders((prev) => [...prev.filter((o) => o.id !== order.id), order]);
      setError(`Nu am putut marca ${order.order_number} ca livrat. Încearcă din nou.`);
      return;
    }
    setError(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo(order);
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
  }

  async function undoDeliver() {
    const order = undo;
    if (!order) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo(null);
    setOrders((prev) => [...prev.filter((o) => o.id !== order.id), order]);
    const { error: err } = await supabase.from("orders").update({ status: "out_for_delivery" }).eq("id", order.id);
    if (err) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setError(`Nu am putut anula livrarea pentru ${order.order_number}.`);
    }
  }

  const list = sortOldestFirst(orders);

  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      <header className="bg-[#332420] text-[#F5E6CC] px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-bebas text-2xl tracking-wide min-h-11 inline-flex items-center">
          &larr; BURGERASH
        </Link>
        {rider && (
          <span className="font-mono text-xs" role="status">
            {connected ? "● LIVE" : "○ OFFLINE"}
          </span>
        )}
      </header>

      {(error || !isSupabaseConfigured) && (
        <div role="alert" className="bg-[#790D20] text-[#F5E6CC] px-4 py-3 font-nunito font-bold">
          {error ?? "Supabase nu este configurat."}
        </div>
      )}

      {!rider ? (
        <main className="flex-1 p-4 flex flex-col gap-4">
          <h1 className="font-bebas text-4xl tracking-wide">CINE EȘTI?</h1>
          <div className="flex flex-col gap-3">
            {RIDERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => choose(name)}
                className="min-h-16 border-2 border-[#332420] bg-transparent font-bebas text-3xl tracking-wide shadow-[4px_4px_0_0_#332420] active:translate-x-0.5 active:translate-y-0.5"
              >
                {name}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <main className="flex-1 p-3 flex flex-col gap-4 pb-28">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="font-bebas text-3xl tracking-wide">
              {rider} · {list.length} {list.length === 1 ? "COMANDĂ" : "COMENZI"}
            </h1>
            <button
              type="button"
              onClick={() => choose(null)}
              className="min-h-11 px-1 font-nunito text-sm font-semibold underline"
            >
              nu sunt eu
            </button>
          </div>

          {!loaded && <p className="font-nunito py-8 text-center opacity-70">Se încarcă…</p>}
          {loaded && list.length === 0 && (
            <p className="font-nunito py-8 text-center text-lg opacity-70">Nicio livrare acum.</p>
          )}

          {list.map((order) => (
            <RiderCard key={order.id} order={order} onDelivered={deliver} />
          ))}
        </main>
      )}

      {undo && (
        <div
          role="status"
          className="fixed bottom-0 inset-x-0 bg-[#332420] text-[#F5E6CC] px-4 py-3 flex items-center justify-between gap-3"
        >
          <span className="font-nunito font-bold">{undo.order_number} livrat</span>
          <button
            type="button"
            onClick={undoDeliver}
            className="min-h-11 px-5 border-2 border-[#F5E6CC] font-bebas text-xl tracking-wide"
          >
            ANULEAZĂ
          </button>
        </div>
      )}
    </div>
  );
}

function RiderCard({ order, onDelivered }: { order: Order; onDelivered: (order: Order) => void }) {
  const pay = collect(order);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address ?? "")}`;

  return (
    <article className="bg-[#F5E6CC] border-2 border-[#332420] shadow-[4px_4px_0_0_#332420]">
      <header className="px-4 pt-3 pb-2 border-b-2 border-[#332420] flex items-baseline justify-between gap-2">
        <span className="font-bebas text-3xl tracking-wide leading-none">{order.order_number}</span>
        <span className="font-nunito font-extrabold text-lg">{order.customer_name}</span>
      </header>

      <div className="px-4 py-3 font-nunito flex flex-col gap-1 border-b-2 border-[#332420]">
        <p className="text-xl font-extrabold leading-tight">{order.delivery_address}</p>
        {order.delivery_details && <p className="text-base font-semibold">{order.delivery_details}</p>}
        {order.order_note && <p className="text-base font-bold text-[#790D20]">Notă: {order.order_note}</p>}
      </div>

      <div
        className={`px-4 py-3 flex items-baseline justify-between gap-2 border-b-2 border-[#332420] ${
          pay.due ? "bg-[#790D20] text-[#F5E6CC]" : ""
        }`}
      >
        <span className="font-mono text-sm font-bold">{pay.label}</span>
        <span className="font-bebas text-4xl tracking-wide leading-none">{money(order.total_amount)}</span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        <a
          href={`tel:${order.customer_phone}`}
          className="min-h-16 border-2 border-[#332420] flex items-center justify-center font-bebas text-3xl tracking-wide"
        >
          SUNĂ
        </a>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-16 border-2 border-[#332420] flex items-center justify-center font-bebas text-3xl tracking-wide"
        >
          HARTĂ
        </a>
        <button
          type="button"
          onClick={() => onDelivered(order)}
          className="col-span-2 min-h-16 bg-[#790D20] text-[#F5E6CC] font-bebas text-3xl tracking-wide"
        >
          LIVRAT ✓
        </button>
      </div>
    </article>
  );
}
