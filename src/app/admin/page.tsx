"use client";

// /admin: staff only (proxy.ts requires a Supabase Auth session). Real data only:
//  - today's orders count + total from Supabase (midnight to midnight Europe/Bucharest, canceled excluded)
//  - "stoc epuizat" per product (StockToggles)
// Opening hours stay in src/lib/hours.ts for now.

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import SignOutButton from "@/components/SignOutButton";
import StockToggles from "@/components/admin/StockToggles";
import { bucharestDayStart } from "@/lib/bucharest-day";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Display } from "@/components/Display";

type Today = { count: number; total: number };

// Exact amount with bani (formatLei rounds to whole lei, too coarse for a daily total).
const money = (n: number) => `${n.toFixed(2).replace(".", ",")} LEI`;

export default function AdminPage() {
  const [today, setToday] = useState<Today | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadToday() {
      const { data, error: err } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", bucharestDayStart().toISOString())
        .neq("status", "canceled");
      if (err || !data) {
        setError(true);
        return;
      }
      setError(false);
      const cents = data.reduce((sum, o) => sum + Math.round(Number(o.total_amount) * 100), 0);
      setToday({ count: data.length, total: cents / 100 });
    }

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadToday())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void loadToday();
      });
    void loadToday();
    return () => void supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5E6CC] text-[#332420] flex flex-col">
      <header className="border-b-4 border-[#332420] bg-[#332420] text-[#F5E6CC] p-6 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-3xl text-[#F5E6CC] uppercase inline-flex items-center gap-2 hover:opacity-80">
            <span aria-hidden>&larr;</span>
            <BrandLogo variant="icon" tone="sand" className="h-9 w-auto sm:hidden" />
            <BrandLogo variant="horizontal" tone="sand" className="h-9 w-auto hidden sm:block" />
            <span>Admin</span>
          </Link>
          <span className="font-mono text-xs px-2 py-1 bg-[#790D20] text-[#F5E6CC] font-bold">PANOU DE CONTROL</span>
        </div>
        <SignOutButton />
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        <section aria-label="Comenzi astăzi" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border-4 border-[#332420] bg-white p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Comenzi astăzi</span>
            <p className="font-display text-5xl text-[#332420] mt-2"><Display>{today ? today.count : "–"}</Display></p>
            <span className="font-mono text-xs text-[#332420]/70">fără cele anulate</span>
          </div>

          <div className="border-4 border-[#332420] bg-white p-6 shadow-[6px_6px_0px_0px_#332420]">
            <span className="font-mono text-xs font-bold text-[#790D20] uppercase">Total comenzi</span>
            <p className="font-display text-5xl text-[#332420] mt-2"><Display>{today ? money(today.total) : "–"}</Display></p>
            <span className="font-mono text-xs text-[#332420]/70">cu livrare și bacșiș</span>
          </div>

          {error && (
            <p role="alert" className="sm:col-span-2 font-nunito font-bold text-sm text-[#790D20]">
              Nu am putut încărca comenzile de azi.
            </p>
          )}
        </section>

        <StockToggles />

        <p className="font-mono text-xs text-[#332420]/70">
          Programul de funcționare se schimbă deocamdată în src/lib/hours.ts.
        </p>
      </main>
    </div>
  );
}
