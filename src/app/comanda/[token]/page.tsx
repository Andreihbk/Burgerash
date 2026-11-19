import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { isFinalStatus, statusSteps, TOKEN_PATTERN } from "@/lib/order-status";
import { formatLei } from "@/lib/format";
import type { OrderItemModifier, OrderStatus, FulfillmentType } from "@/types/database";
import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Starea comenzii",
  robots: { index: false, follow: false },
};

interface StatusOrder {
  order_number: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  subtotal: number;
  delivery_fee: number;
  tip_amount: number;
  total_amount: number;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    modifiers: OrderItemModifier[];
  }[];
}

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token) || !isSupabaseAdminConfigured) notFound();

  // Only non-personal columns are selected: no phone, address or rider name reach this page.
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "order_number, status, fulfillment_type, subtotal, delivery_fee, tip_amount, total_amount, order_items(id, product_name, quantity, modifiers)"
    )
    .eq("public_token", token)
    .maybeSingle();

  if (error) console.error("Order status lookup failed:", error);
  if (!data) notFound();
  const order = data as unknown as StatusOrder;

  const steps = statusSteps(order.fulfillment_type);
  const canceled = order.status === "canceled";
  const currentIndex = steps.findIndex((s) => s.status === order.status);
  const done = order.status === "delivered";

  return (
    <main className="min-h-screen bg-[#F5E6CC] text-[#332420]">
      {!isFinalStatus(order.status) && <AutoRefresh />}

      <header className="bg-[#790D20] text-[#F5E6CC] border-b-2 border-[#332420] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bebas text-2xl tracking-wide">
            burgerash
          </Link>
          <span className="font-mono text-sm font-bold">{order.order_number}</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="font-mono text-xs font-bold">STAREA COMENZII</p>
          <h1 className="font-bebas text-5xl tracking-wide leading-none mt-1">
            {canceled ? "COMANDĂ ANULATĂ" : done ? (order.fulfillment_type === "pickup" ? "COMANDĂ RIDICATĂ" : "COMANDĂ LIVRATĂ") : steps[Math.max(currentIndex, 0)].label.toUpperCase()}
          </h1>
          {canceled && (
            <p className="font-nunito font-bold text-sm mt-2">
              Comanda a fost anulată. Dacă nu te așteptai la asta, sună-ne.
            </p>
          )}
        </div>

        {!canceled && (
          <ol className="border-2 border-[#332420] rounded-lg bg-white p-4 space-y-3 shadow-[4px_4px_0px_0px_#332420]">
            {steps.map((step, i) => {
              const reached = i <= currentIndex;
              const active = i === currentIndex && !done;
              return (
                <li key={step.status} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full border-2 border-[#332420] flex items-center justify-center ${
                      reached ? "bg-[#790D20] text-[#F5E6CC]" : "bg-[#F5E6CC]"
                    } ${active ? "ring-4 ring-[#790D20]/25" : ""}`}
                  >
                    {reached && <Check className="w-4 h-4 stroke-[3]" aria-hidden />}
                  </span>
                  <span className={`font-nunito text-base ${reached ? "font-black" : "font-bold opacity-50"}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <section className="border-2 border-[#332420] rounded-lg bg-white p-4 shadow-[4px_4px_0px_0px_#332420]">
          <h2 className="font-bebas text-2xl tracking-wide mb-2">COMANDA TA</h2>
          <ul className="space-y-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="font-nunito font-bold text-sm">
                <span className="font-black">{item.quantity}×</span> {item.product_name}
                {item.modifiers?.length > 0 && (
                  <span className="block font-mono text-[11px] font-normal opacity-70">
                    {item.modifiers.map((m) => m.name).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <dl className="mt-3 pt-3 border-t border-[#332420]/20 font-nunito text-sm space-y-1">
            <Row label="Produse" value={formatLei(order.subtotal)} />
            {order.delivery_fee > 0 && <Row label="Livrare" value={formatLei(order.delivery_fee)} />}
            {order.tip_amount > 0 && <Row label="Bacșiș" value={formatLei(order.tip_amount)} />}
            <div className="flex justify-between font-black text-base pt-1">
              <dt>Total</dt>
              <dd>{formatLei(order.total_amount)}</dd>
            </div>
          </dl>
        </section>

        <p className="font-nunito text-xs opacity-70">
          Pagina se actualizează singură. Păstrează linkul: doar cine îl are poate vedea comanda.
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-bold">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
