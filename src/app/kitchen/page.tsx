"use client";

// /kitchen KDS. Reads and writes Supabase only (never Ebriza), so it keeps working if the POS is down.
// Staff only: proxy.ts requires a Supabase Auth session; RLS lets `authenticated` read orders and update status/rider_name.

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import SignOutButton from "@/components/SignOutButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/types/database";
import { Display } from "@/components/Display";

type KitchenStatus = Extract<OrderStatus, "pending" | "preparing" | "ready_for_packing">;

const KITCHEN_STATUSES: KitchenStatus[] = ["pending", "preparing", "ready_for_packing"];

const COLUMNS: {
  status: KitchenStatus;
  title: string;
  next: KitchenStatus | null;
  nextLabel: string;
  prev: KitchenStatus | null;
}[] = [
  { status: "pending", title: "NOU", next: "preparing", nextLabel: "PREIA", prev: null },
  { status: "preparing", title: "ÎN PREPARARE", next: "ready_for_packing", nextLabel: "GATA", prev: "pending" },
  { status: "ready_for_packing", title: "GATA", next: null, nextLabel: "", prev: "preparing" },
];

const LATE_AFTER_MIN = 10;
const SELECT = "*, items:order_items(*)";

function isKitchenStatus(s: string): s is KitchenStatus {
  return (KITCHEN_STATUSES as string[]).includes(s);
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

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<KitchenStatus>("pending");
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
      osc.frequency.value = 880;
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

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("orders")
      .select(SELECT)
      .in("status", KITCHEN_STATUSES)
      .order("created_at", { ascending: true });
    if (err) {
      setError("Nu pot încărca comenzile. Reîncerc la reconectare.");
      return;
    }
    setError(null);
    const list = (data ?? []) as Order[];
    const newcomers = list.filter((o) => !knownIds.current.has(o.id) && o.status === "pending");
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
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          if (id) setOrders((prev) => prev.filter((o) => o.id !== id));
          return;
        }
        const row = payload.new as Order;
        if (!isKitchenStatus(row.status)) {
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
          return;
        }
        if (payload.eventType === "INSERT" || !knownIds.current.has(row.id)) {
          // Items are not in the orders payload: fetch the full order once.
          const { data } = await supabase.from("orders").select(SELECT).eq("id", row.id).single();
          if (!data) return;
          const full = data as Order;
          const isNew = !knownIds.current.has(full.id);
          knownIds.current.add(full.id);
          setOrders((prev) => [...prev.filter((o) => o.id !== full.id), full]);
          if (isNew && full.status === "pending") markFresh([full.id]);
          return;
        }
        // UPDATE of a known order: merge fields, keep the items we already have.
        setOrders((prev) =>
          prev.some((o) => o.id === row.id)
            ? prev.map((o) => (o.id === row.id ? { ...o, ...row, items: o.items } : o))
            : prev,
        );
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

  // Tab title shows how many orders are waiting.
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  useEffect(() => {
    document.title = pendingCount > 0 ? `(${pendingCount}) Bucătărie | Burgerash` : "Bucătărie | Burgerash";
  }, [pendingCount]);

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

  async function moveTo(order: Order, status: KitchenStatus) {
    const previous = order.status;
    setFresh((prev) => {
      const next = new Set(prev);
      next.delete(order.id);
      return next;
    });
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    const { error: err } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      setError(`Nu am putut muta ${order.order_number}. Încearcă din nou.`);
    } else {
      setError(null);
    }
  }

  return (
    <div className="min-h-screen bg-sand text-charcoal flex flex-col">
      <header className="bg-charcoal text-sand px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-2xl tracking-wide min-h-11 inline-flex items-center gap-2">
            <span aria-hidden>&larr;</span>
            <BrandLogo variant="icon" tone="sand" className="h-8 w-auto sm:hidden" />
            <BrandLogo variant="horizontal" tone="sand" className="h-8 w-auto hidden sm:block" />
          </Link>
          <span className="font-display text-2xl tracking-wide text-sand/70 hidden sm:inline"><Display>BUCĂTĂRIE</Display></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" role="status">
            {connected ? "● LIVE" : "○ OFFLINE"}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className={`min-h-11 px-4 font-nunito font-bold text-sm border-2 border-sand ${
              soundOn ? "bg-sand text-charcoal" : "bg-transparent text-sand"
            }`}
          >
            SUNET {soundOn ? "PORNIT" : "OPRIT"}
          </button>
          <SignOutButton />
        </div>
      </header>

      {error && (
        <div role="alert" className="bg-wine text-sand px-4 py-3 font-nunito font-bold">
          {error}
        </div>
      )}

      {/* Phone: tabs. md and up: all three columns. */}
      <nav className="md:hidden grid grid-cols-3 border-b-2 border-charcoal" aria-label="Coloane">
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
                active ? "bg-wine text-sand" : "bg-transparent text-charcoal"
              }`}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </nav>

      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => {
          const list = sortOldestFirst(orders.filter((o) => o.status === col.status));
          return (
            <section
              key={col.status}
              className={`${tab === col.status ? "block" : "hidden"} md:block border-2 border-charcoal`}
              aria-label={col.title}
            >
              <h2 className="hidden md:flex items-center justify-between bg-charcoal text-sand px-4 py-2 font-display text-2xl tracking-wide">
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
                    next={col.next}
                    nextLabel={col.nextLabel}
                    prev={col.prev}
                    onMove={moveTo}
                    onSeen={() =>
                      setFresh((prev) => {
                        const next = new Set(prev);
                        next.delete(order.id);
                        return next;
                      })
                    }
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
  next,
  nextLabel,
  prev,
  onMove,
  onSeen,
}: {
  order: Order;
  now: number;
  isFresh: boolean;
  next: KitchenStatus | null;
  nextLabel: string;
  prev: KitchenStatus | null;
  onMove: (order: Order, status: KitchenStatus) => void;
  onSeen: () => void;
}) {
  const age = formatAge(order.created_at, now);
  const late = age.minutes >= LATE_AFTER_MIN && order.status !== "ready_for_packing";
  const items = order.items ?? [];

  return (
    <article
      onClick={isFresh ? onSeen : undefined}
      className={`bg-sand border-2 border-charcoal shadow-[4px_4px_0_0_var(--color-charcoal)] ${
        isFresh ? "outline-4 outline-offset-2 outline-wine" : ""
      }`}
    >
      <header className="flex items-baseline justify-between gap-2 px-4 pt-3 pb-2 border-b-2 border-charcoal">
        <span className="font-display text-3xl tracking-wide leading-none"><Display>{order.order_number}</Display></span>
        <span className="font-mono text-sm font-bold flex items-center gap-2">
          {order.fulfillment_type === "delivery" ? "LIVRARE" : "RIDICARE"}
          <span className={late ? "bg-wine text-sand px-2 py-0.5" : "bg-charcoal text-sand px-2 py-0.5"}>
            {age.text}
          </span>
        </span>
      </header>

      <ul className="px-4 py-3 flex flex-col gap-3 font-nunito">
        {items.map((item) => (
          <li key={item.id}>
            <p className="text-xl font-extrabold leading-tight">
              <span className="font-mono">{item.quantity}×</span> {item.product_name}
            </p>
            {item.modifiers.length > 0 && (
              <ul className="mt-1 pl-6 text-base font-semibold">
                {item.modifiers.map((m) => (
                  <li key={m.id} className={m.name.toLowerCase().startsWith("fără") ? "text-wine font-extrabold" : ""}>
                    + {m.name}
                  </li>
                ))}
              </ul>
            )}
            {item.note && <p className="mt-1 pl-6 text-base font-bold text-wine">Notă: {item.note}</p>}
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">Se încarcă produsele…</li>}
      </ul>

      {(order.order_note || order.cutlery_sets > 0) && (
        <div className="px-4 pb-3 font-nunito text-base font-bold flex flex-col gap-1">
          {order.order_note && <p className="text-wine">Notă comandă: {order.order_note}</p>}
          {order.cutlery_sets > 0 && <p>Tacâmuri: {order.cutlery_sets}</p>}
        </div>
      )}

      {(next || prev) && (
        <footer className="flex gap-2 p-3 border-t-2 border-charcoal">
          {prev && (
            <button
              type="button"
              onClick={() => onMove(order, prev)}
              aria-label={`Înapoi ${order.order_number}`}
              className="min-h-14 px-4 border-2 border-charcoal font-nunito font-bold"
            >
              ↩
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={() => onMove(order, next)}
              className="flex-1 min-h-14 bg-wine text-sand font-display text-2xl tracking-wide"
            >
              <Display>{nextLabel} →</Display>
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
