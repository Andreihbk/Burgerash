"use client";

import { useCallback, useEffect, useState } from "react";
import { MENU_SECTIONS } from "@/lib/catalog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { isRowSoldOut, type StockRow } from "@/lib/stock-row";
import { Display } from "@/components/Display";

// "Stoc epuizat" on/off per product (product_stock). Staff only: RLS lets `authenticated` read,
// insert and update sold_out. No row = available. The storefront and /api/orders read the same table.

export default function StockToggles() {
  const [soldOut, setSoldOut] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((rows: StockRow[]) => {
    // An expired Ebriza POS snooze shows as available, like on the storefront.
    setSoldOut(new Set(rows.filter((r) => isRowSoldOut(r)).map((r) => r.product_id)));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    async function load() {
      const { data, error: err } = await supabase.from("product_stock").select("product_id, sold_out, snoozed_until");
      if (!active) return;
      if (err) {
        setError("Nu am putut încărca stocul.");
        return;
      }
      setError(null);
      apply((data ?? []) as StockRow[]);
      setLoaded(true);
    }

    const channel = supabase
      .channel("admin-product-stock")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_stock" }, () => void load())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void load();
      });
    void load();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [apply]);

  async function save(productId: string, next: boolean) {
    const stamp = new Date().toISOString();
    // Update first; if the product has no row yet, insert it. (No upsert: staff may not update product_id.)
    const updated = await supabase
      .from("product_stock")
      .update({ sold_out: next, updated_at: stamp })
      .eq("product_id", productId)
      .select("product_id");
    if (updated.error) return updated.error;
    if (updated.data && updated.data.length > 0) return null;

    const inserted = await supabase
      .from("product_stock")
      .insert({ product_id: productId, sold_out: next, updated_at: stamp });
    if (inserted.error?.code === "23505") {
      // Another staff member created the row a moment ago: update it instead.
      const retry = await supabase
        .from("product_stock")
        .update({ sold_out: next, updated_at: stamp })
        .eq("product_id", productId);
      return retry.error;
    }
    return inserted.error;
  }

  async function toggle(productId: string) {
    if (busy.has(productId)) return;
    const next = !soldOut.has(productId);
    setError(null);
    setBusy((b) => new Set(b).add(productId));
    // Optimistic; rolled back below if the write fails.
    setSoldOut((s) => {
      const copy = new Set(s);
      if (next) copy.add(productId);
      else copy.delete(productId);
      return copy;
    });
    const err = await save(productId, next);
    if (err) {
      setError("Nu am putut salva. Încearcă din nou.");
      setSoldOut((s) => {
        const copy = new Set(s);
        if (next) copy.delete(productId);
        else copy.add(productId);
        return copy;
      });
    }
    setBusy((b) => {
      const copy = new Set(b);
      copy.delete(productId);
      return copy;
    });
  }

  return (
    <section className="border-4 border-[#332420] bg-white p-6 shadow-[8px_8px_0px_0px_#332420]">
      <h2 className="font-bebas text-3xl uppercase text-[#332420] border-b-2 border-[#332420] pb-2 mb-2">
        <Display>Stoc epuizat</Display>
      </h2>
      <p className="font-nunito font-bold text-sm text-[#332420]/75 mb-4">
        Activează când un produs s-a terminat: apare EPUIZAT pe site și comenzile cu el sunt refuzate.
      </p>

      {error && (
        <p role="alert" className="mb-4 border-2 border-[#790D20] px-3 py-2 font-nunito font-bold text-sm text-[#790D20]">
          {error}
        </p>
      )}
      {!isSupabaseConfigured && (
        <p className="font-nunito font-bold text-sm text-[#790D20]">Supabase nu este configurat.</p>
      )}

      <div className="space-y-6">
        {MENU_SECTIONS.map(({ category, products }) => (
          <div key={category.id}>
            <h3 className="font-mono text-xs font-bold text-[#790D20] mb-2">{category.name}</h3>
            <ul className="divide-y-2 divide-[#332420]/10 border-2 border-[#332420]">
              {products.map((product) => {
                const isOut = soldOut.has(product.id);
                return (
                  <li key={product.id} className="flex items-center justify-between gap-4 px-4 py-2 min-h-14">
                    <span className="font-bebas text-2xl tracking-wide text-[#332420]"><Display>{product.name}</Display></span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOut}
                      aria-label={`${product.name}: stoc epuizat`}
                      disabled={!loaded || busy.has(product.id)}
                      onClick={() => void toggle(product.id)}
                      className={`min-h-11 min-w-32 px-4 border-2 border-[#332420] font-bebas text-xl disabled:opacity-60 ${
                        isOut ? "bg-[#790D20] text-[#F5E6CC]" : "bg-[#F5E6CC] text-[#332420]"
                      }`}
                    >
                      <Display>{isOut ? "EPUIZAT" : "ÎN STOC"}</Display>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
