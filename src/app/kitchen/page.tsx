"use client";

// /kitchen KDS. Reads and writes Supabase only (never Ebriza), so it keeps working if the POS is down.
// Staff only: proxy.ts requires a Supabase Auth session; RLS lets `authenticated` read orders and update status/rider_name.

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import SignOutButton from "@/components/SignOutButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatAge, sortOldestFirst } from "@/lib/staff-format";
import { useLiveOrders } from "@/lib/useLiveOrders";
import { useStaffSound } from "@/lib/useStaffSound";
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
export default function KitchenPage() {
  const { soundOn, toggleSound, beep } = useStaffSound(880);
  const { orders, setOrders, loaded, error, setError, connected, fresh, clearFresh } = useLiveOrders({
    channelName: "kitchen-orders",
    statuses: KITCHEN_STATUSES,
    freshStatus: "pending",
    refetchMissing: false,
    onArrive: beep,
  });
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<KitchenStatus>("pending");

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

  async function moveTo(order: Order, status: KitchenStatus) {
    const previous = order.status;
    clearFresh(order.id);
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
