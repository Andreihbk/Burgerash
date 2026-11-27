"use client";

import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Display } from "@/components/Display";
import { formatLei } from "@/lib/format";
import { getUpsellProducts } from "@/lib/upsell";

/** "Merge lângă": one-tap side, sauce and drink suggestions in the cart (see lib/upsell.ts). */
export default function CartUpsell({ soldOutIds }: { soldOutIds: ReadonlySet<string> }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const suggestions = getUpsellProducts(
    items.map((i) => i.product.id),
    soldOutIds,
  );
  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Sugestii" className="mt-6">
      <h3 className="font-display text-lg text-charcoal mb-2"><Display>MERGE LÂNGĂ</Display></h3>
      <ul className="space-y-2">
        {suggestions.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-charcoal/40 bg-sand px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-charcoal"><Display>{product.name}</Display></p>
              {product.weight_label && (
                <p className="font-mono text-[11px] text-charcoal/60">{product.weight_label}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => addItem(product)}
              aria-label={`Adaugă ${product.name} în coș, ${formatLei(product.price)}`}
              className="flex min-h-11 shrink-0 items-center gap-1 rounded border-2 border-charcoal bg-charcoal px-3 font-nunito text-sm font-black text-sand transition-colors duration-150 hover:bg-wine"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {formatLei(product.price)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
