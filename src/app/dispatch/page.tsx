"use client";

// /dispatch: packed-order handoff. Reads and writes Supabase only (never Ebriza).
// Delivery: ready_for_packing -> out_for_delivery -> delivered. Pickup: ready_for_packing -> delivered.
// Staff only: proxy.ts requires a Supabase Auth session; RLS lets `authenticated` read orders and update status/rider_name.
// TODO(rider assignment): waiting for the migration decision (see docs/PLAN.md 2.2).

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import SignOutButton from "@/components/SignOutButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { RIDERS } from "@/lib/riders";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/types/database";
import { Display } from "@/components/Display";

type DispatchStatus = Extract<OrderStatus, "ready_for_packing" | "out_for_delivery">;

const DISPATCH_STATUSES: DispatchStatus[] = ["ready_for_packing", "out_for_delivery"];

const COLUMNS: { status: DispatchStatus; title: string }[] = [
  { status: "ready_for_packing", title: "DE PREDAT" },
  { status: "out_for_delivery", title: "ÎN LIVRARE" },
];

const LATE_AFTER_MIN = 20;
const SELECT = "*, items:order_items(*)";

function isDispatchStatus(s: string): s is DispatchStatus {
  return (DISPATCH_STATUSES as string[]).includes(s);
}

function sortOldestFirst(list: Order[]): Order[] {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function formatAge(createdAt: string, now: number): { text: string; minutes: number } {
  const secs = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  const minutes = Math.floor(secs / 60);
  if (minutes < 1) return { text: "acum", minutes };
  if (minutes < 60) return { text: `${minutes} min`, minutes };
  return { text: `${Math.floor(minutes / 60)} h ${minutes % 60} min`, minutes };
}

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<DispatchStatus>("ready_for_packing");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [soundOn, setSoundOn] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false);
  const knownIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!soundOnRef.current || !ctx) return;
    [0, 0.25].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      gain.gain.value = 0.2;
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  }, []);

  const markFresh = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setFresh((prev) => new Set([...prev, ...ids]));
      beep();
    },
    [beep],
  );

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
      .in("status", DISPATCH_STATUSES)
      .order("created_at", { ascending: true });
    if (err) {
      setError("Nu pot încărca comenzile. Reîncerc la reconectare.");
      return;
    }
    setError(null);
    const list = (data ?? []) as Order[];
    const newcomers = list.filter((o) => !knownIds.current.has(o.id) && o.status === "ready_for_packing");
    list.forEach((o) => knownIds.current.add(o.id));
    setOrders(list);
    setLoaded(true);
    if (!firstLoad.current) markFresh(newcomers.map((o) => o.id));
    firstLoad.current = false;
  }, [markFresh]);

  // Initial load + Realtime subscription (unsubscribes on unmount).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase nu este configurat.");
      setLoaded(true);
      return;
    }
    void load();

    const channel = supabase
      .channel("dispatch-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) setOrders((prev) => prev.filter((o) => o.id !== id));
          return;
        }
        const row = payload.new as Order;
        if (!isDispatchStatus(row.status)) {
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
          return;
        }
        // Items are not in the orders payload: fetch the full order when it is new to this screen.
        if (!knownIds.current.has(row.id) || payload.eventType === "INSERT") {
          const { data } = await supabase.from("orders").select(SELECT).eq("id", row.id).single();
          if (!data) return;
          const full = data as Order;
          const isNew = !knownIds.current.has(full.id);
          knownIds.current.add(full.id);
          setOrders((prev) => [...prev.filter((o) => o.id !== full.id), full]);
          if (isNew && full.status === "ready_for_packing") markFresh([full.id]);
          return;
        }
        // Known order: merge fields, keep the items we already have. If it just came back from the
        // kitchen/other column and is not in state, fetch it again.
        let missing = false;
        setOrders((prev) => {
          if (!prev.some((o) => o.id === row.id)) {
            missing = true;
            return prev;
          }
          return prev.map((o) => (o.id === row.id ? { ...o, ...row, items: o.items } : o));
        });
        if (missing) {
          const { data } = await supabase.from("orders").select(SELECT).eq("id", row.id).single();
          if (data) {
            const full = data as Order;
            setOrders((prev) => [...prev.filter((o) => o.id !== full.id), full]);
            if (full.status === "ready_for_packing") markFresh([full.id]);
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
  }, [load, markFresh]);

  // Live age timer.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const readyCount = orders.filter((o) => o.status === "ready_for_packing").length;
  useEffect(() => {
    document.title = readyCount > 0 ? `(${readyCount}) Dispecerat | Burgerash` : "Dispecerat | Burgerash";
  }, [readyCount]);

  function toggleSound() {
    if (!soundOn) {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
      soundOnRef.current = true;
      setSoundOn(true);
      beep();
    } else {
      soundOnRef.current = false;
      setSoundOn(false);
    }
  }

  async function moveTo(order: Order, status: OrderStatus) {
    const previous = order.status;
    clearFresh(order.id);
    // Optimistic: delivered orders leave this screen.
    setOrders((prev) =>
      status === "delivered"
        ? prev.filter((o) => o.id !== order.id)
        : prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
    );
    const { error: err } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (err) {
      setOrders((prev) =>
        prev.some((o) => o.id === order.id)
          ? prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o))
          : [...prev, order],
      );
      setError(`Nu am putut muta ${order.order_number}. Încearcă din nou.`);
    } else {
      setError(null);
    }
  }

  async function assignRider(order: Order, rider: string) {
    const previous = order.rider_name;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, rider_name: rider } : o)));
    const { error: err } = await supabase.from("orders").update({ rider_name: rider }).eq("id", order.id);
    if (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, rider_name: previous } : o)));
      setError(`Nu am putut alege curierul pentru ${order.order_number}. Încearcă din nou.`);
    } else {
      setError(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      <header className="bg-[#332420] text-[#F5E6CC] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-2xl tracking-wide min-h-11 inline-flex items-center gap-2">
            <span aria-hidden>&larr;</span>
            <BrandLogo variant="icon" tone="sand" className="h-8 w-auto sm:hidden" />
            <BrandLogo variant="horizontal" tone="sand" className="h-8 w-auto hidden sm:block" />
          </Link>
          <span className="font-display text-2xl tracking-wide text-[#F5E6CC]/70 hidden sm:inline"><Display>DISPECERAT</Display></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" role="status">
            {connected ? "● LIVE" : "○ OFFLINE"}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className={`min-h-11 px-4 font-nunito font-bold text-sm border-2 border-[#F5E6CC] ${
              soundOn ? "bg-[#F5E6CC] text-[#332420]" : "bg-transparent text-[#F5E6CC]"
            }`}
          >
            SUNET {soundOn ? "PORNIT" : "OPRIT"}
          </button>
          <SignOutButton />
        </div>
      </header>

      {error && (
        <div role="alert" className="bg-[#790D20] text-[#F5E6CC] px-4 py-3 font-nunito font-bold">
          {error}
        </div>
      )}

      {/* Phone: tabs. md and up: both columns. */}
      <nav className="md:hidden grid grid-cols-2 border-b-2 border-[#332420]" aria-label="Coloane">
        {COLUMNS.map((col) => {
          const count = orders.filter((o) => o.status === col.status).length;
          const active = tab === col.status;
          return (
            <button
              key={col.status}
              type="button"
              onClick={() => setTab(col.status)}
              aria-pressed={active}
              className={`min-h-14 font-display text-xl tracking-wide ${
                active ? "bg-[#790D20] text-[#F5E6CC]" : "bg-transparent text-[#332420]"
              }`}
            >
              <Display>{col.title} ({count})</Display>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {COLUMNS.map((col) => {
          const list = sortOldestFirst(orders.filter((o) => o.status === col.status));
          return (
            <section
              key={col.status}
              className={`${tab === col.status ? "block" : "hidden"} md:block border-2 border-[#332420]`}
              aria-label={col.title}
            >
              <h2 className="hidden md:flex items-center justify-between bg-[#332420] text-[#F5E6CC] px-4 py-2 font-display text-2xl tracking-wide">
                <span><Display>{col.title}</Display></span>
                <span className="font-mono text-sm">{list.length}</span>
              </h2>
              <div className="p-3 flex flex-col gap-4">
                {!loaded && <p className="font-nunito py-8 text-center opacity-70">Se încarcă…</p>}
                {loaded && list.length === 0 && (
                  <p className="font-nunito py-8 text-center opacity-70">Nicio comandă.</p>
                )}
                {list.map((order) => (
                  <Ticket
                    key={order.id}
                    order={order}
                    now={now}
                    isFresh={fresh.has(order.id)}
                    onMove={moveTo}
                    onAssign={assignRider}
                    onSeen={() => clearFresh(order.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function Ticket({
  order,
  now,
  isFresh,
  onMove,
  onAssign,
  onSeen,
}: {
  order: Order;
  now: number;
  isFresh: boolean;
  onMove: (order: Order, status: OrderStatus) => void;
  onAssign: (order: Order, rider: string) => void;
  onSeen: () => void;
}) {
  const age = formatAge(order.created_at, now);
  const late = age.minutes >= LATE_AFTER_MIN;
  const items = order.items ?? [];
  const isDelivery = order.fulfillment_type === "delivery";
  const outForDelivery = order.status === "out_for_delivery";
  const needsRider = isDelivery && !outForDelivery;
  const blocked = needsRider && !order.rider_name;

  // Delivery: ready -> out_for_delivery -> delivered. Pickup: ready -> delivered.
  const next: { status: OrderStatus; label: string } = outForDelivery
    ? { status: "delivered", label: "LIVRAT" }
    : isDelivery
      ? { status: "out_for_delivery", label: "PLECAT LA CLIENT" }
      : { status: "delivered", label: "PREDAT" };

  return (
    <article
      onClick={isFresh ? onSeen : undefined}
      className={`bg-[#F5E6CC] border-2 border-[#332420] shadow-[4px_4px_0_0_#332420] ${
        isFresh ? "outline-4 outline-offset-2 outline-[#790D20]" : ""
      }`}
    >
      <header className="flex items-baseline justify-between gap-2 px-4 pt-3 pb-2 border-b-2 border-[#332420]">
        <span className="font-display text-3xl tracking-wide leading-none"><Display>{order.order_number}</Display></span>
        <span className="font-mono text-sm font-bold flex items-center gap-2">
          {isDelivery ? "LIVRARE" : "RIDICARE"}
          <span className={late ? "bg-[#790D20] text-[#F5E6CC] px-2 py-0.5" : "bg-[#332420] text-[#F5E6CC] px-2 py-0.5"}>
            {age.text}
          </span>
        </span>
      </header>

      {isDelivery && (
        <div className="px-4 py-3 font-nunito border-b-2 border-[#332420] flex flex-col gap-1">
          <p className="text-lg font-extrabold leading-tight">{order.delivery_address}</p>
          {order.delivery_details && <p className="text-base font-semibold">{order.delivery_details}</p>}
          <a
            href={`tel:${order.customer_phone}`}
            className="font-mono text-lg font-bold underline min-h-11 inline-flex items-center"
          >
            {order.customer_name} · {order.customer_phone}
          </a>
        </div>
      )}
      {!isDelivery && (
        <p className="px-4 py-3 font-nunito text-lg font-extrabold border-b-2 border-[#332420]">{order.customer_name}</p>
      )}

      <ul className="px-4 py-3 flex flex-col gap-2 font-nunito">
        {items.map((item) => (
          <li key={item.id}>
            <p className="text-lg font-extrabold leading-tight">
              <span className="font-mono">{item.quantity}×</span> {item.product_name}
            </p>
            {item.modifiers.length > 0 && (
              <ul className="mt-1 pl-6 text-base font-semibold">
                {item.modifiers.map((m) => (
                  <li key={m.id} className={m.name.toLowerCase().startsWith("fără") ? "text-[#790D20] font-extrabold" : ""}>
                    + {m.name}
                  </li>
                ))}
              </ul>
            )}
            {item.note && <p className="mt-1 pl-6 text-base font-bold text-[#790D20]">Notă: {item.note}</p>}
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">Se încarcă produsele…</li>}
      </ul>

      {(order.order_note || order.cutlery_sets > 0) && (
        <div className="px-4 pb-3 font-nunito text-base font-bold flex flex-col gap-1">
          {order.order_note && <p className="text-[#790D20]">Notă comandă: {order.order_note}</p>}
          {order.cutlery_sets > 0 && <p>Tacâmuri: {order.cutlery_sets}</p>}
        </div>
      )}

      {isDelivery && outForDelivery && order.rider_name && (
        <p className="px-4 pb-3 font-mono text-base font-bold">CURIER: {order.rider_name}</p>
      )}

      {needsRider && (
        <div className="px-4 pb-3 flex flex-col gap-2" role="group" aria-label="Curier">
          <p className="font-mono text-sm font-bold">CURIER</p>
          <div className="flex flex-wrap gap-2">
            {RIDERS.map((rider) => {
              const picked = order.rider_name === rider;
              return (
                <button
                  key={rider}
                  type="button"
                  onClick={() => onAssign(order, rider)}
                  aria-pressed={picked}
                  className={`min-h-14 px-5 border-2 border-[#332420] font-nunito font-bold text-lg ${
                    picked ? "bg-[#332420] text-[#F5E6CC]" : "bg-transparent text-[#332420]"
                  }`}
                >
                  {rider}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <footer className="flex gap-2 p-3 border-t-2 border-[#332420]">
        {outForDelivery && (
          <button
            type="button"
            onClick={() => onMove(order, "ready_for_packing")}
            aria-label={`Înapoi ${order.order_number}`}
            className="min-h-14 px-4 border-2 border-[#332420] font-nunito font-bold"
          >
            ↩
          </button>
        )}
        <button
          type="button"
          onClick={() => onMove(order, next.status)}
          disabled={blocked}
          className="flex-1 min-h-14 bg-[#790D20] text-[#F5E6CC] font-display text-2xl tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Display>{next.label} →</Display>
        </button>
      </footer>
    </article>
  );
}
