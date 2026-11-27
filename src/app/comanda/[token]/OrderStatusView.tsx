import Image from "next/image";
import Link from "next/link";
import { Bike, Check, ClipboardCheck, Flame, MapPin, Package, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Display } from "@/components/Display";
import { statusSteps } from "@/lib/order-status";
import { formatLei } from "@/lib/format";
import { GOOGLE_MAPS_URL, SITE_ADDRESS } from "@/lib/site";
import type { FulfillmentType, OrderItemModifier, OrderStatus } from "@/types/database";
import packedPhoto from "../../../../public/images/marketing/carousel-wrapped.jpg";

export interface StatusOrder {
  order_number: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  subtotal: number;
  delivery_fee: number;
  tip_amount: number;
  total_amount: number;
  order_items: { id: string; product_name: string; quantity: number; modifiers: OrderItemModifier[] }[];
}

const ICONS: Partial<Record<OrderStatus, LucideIcon>> = {
  pending: ClipboardCheck,
  preparing: Flame,
  ready_for_packing: Package,
  out_for_delivery: Bike,
  delivered: PartyPopper,
};

function stepNote(status: OrderStatus, type: FulfillmentType): string {
  switch (status) {
    case "pending":
      return "Am primit comanda.";
    case "preparing":
      return "Carne proaspătă, pe plită chiar acum.";
    case "ready_for_packing":
      return type === "pickup" ? "Te așteptăm la geam." : "O împachetăm cald.";
    case "out_for_delivery":
      return "Curierul nostru e pe drum.";
    case "delivered":
      return "Poftă bună!";
    default:
      return "";
  }
}

/** Customer order status: hero with status + photo, vertical step timeline, receipt. Pure view (real page and demo share it). */
export default function OrderStatusView({ order, footer }: { order: StatusOrder; footer?: React.ReactNode }) {
  const steps = statusSteps(order.fulfillment_type);
  const canceled = order.status === "canceled";
  const currentIndex = steps.findIndex((s) => s.status === order.status);
  const done = order.status === "delivered";
  const title = canceled
    ? "COMANDĂ ANULATĂ"
    : done
      ? order.fulfillment_type === "pickup" ? "COMANDĂ RIDICATĂ" : "COMANDĂ LIVRATĂ"
      : steps[Math.max(currentIndex, 0)].label.toUpperCase();

  return (
    <main className="min-h-screen bg-[#F5E6CC] text-[#332420]">
      <header className="bg-[#790D20] text-[#F5E6CC] border-b-2 border-[#332420] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo variant="horizontal" tone="sand" className="h-9 w-auto" />
          </Link>
          <span className="font-mono text-sm font-bold">{order.order_number}</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Status hero: wine block + framed photo */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-[#332420] bg-[#790D20] text-[#F5E6CC] shadow-[6px_6px_0px_0px_#332420]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-5">
            <div>
              <p className="font-mono text-xs font-bold tracking-widest text-[#F5E6CC]/80">STAREA COMENZII</p>
              <h1 className="font-display text-3xl sm:text-5xl leading-none mt-1">
                <Display>{title}</Display>
              </h1>
              <p className="font-nunito font-bold text-sm mt-2 text-[#F5E6CC]/90">
                {canceled
                  ? "Comanda a fost anulată. Dacă nu te așteptai la asta, sună-ne."
                  : stepNote(order.status, order.fulfillment_type)}
              </p>
              <p className="mt-3 inline-block rounded-full bg-[#F5E6CC] text-[#790D20] font-display text-sm tracking-wider px-3 py-1">
                <Display>{order.fulfillment_type === "pickup" ? "PICK UP" : "DELIVERY"}</Display>
              </p>
            </div>
            <div className="relative w-20 sm:w-32 aspect-[4/5] -rotate-3 overflow-hidden rounded-xl border-2 border-[#332420] shadow-[3px_3px_0px_0px_#332420]">
              <Image src={packedPhoto} alt="" fill sizes="128px" placeholder="blur" className="object-cover" />
            </div>
          </div>
        </section>

        {!canceled && (
          <ol className="rounded-2xl border-2 border-[#332420] bg-[#F5E6CC] p-5 shadow-[4px_4px_0px_0px_#332420]">
            {steps.map((step, i) => {
              const reached = i <= currentIndex;
              const active = i === currentIndex && !done;
              const Icon = reached && !active ? Check : (ICONS[step.status] ?? Check);
              const last = i === steps.length - 1;
              return (
                <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={active ? "step" : undefined}>
                  {!last && (
                    <span
                      aria-hidden
                      className={`absolute left-[19px] top-10 bottom-0 w-[3px] rounded-full ${i < currentIndex ? "bg-[#790D20]" : "bg-[#332420]/15"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 w-10 h-10 shrink-0 rounded-full border-2 border-[#332420] grid place-items-center ${
                      reached ? "bg-[#790D20] text-[#F5E6CC]" : "bg-[#F5E6CC] text-[#332420]/40"
                    } ${active ? "ring-4 ring-[#790D20]/25" : ""}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="pt-1.5">
                    <span className={`block font-display text-xl leading-none tracking-wide ${reached ? "" : "opacity-40"}`}>
                      <Display>{step.label.toUpperCase()}</Display>
                    </span>
                    {reached && (
                      <span className="block font-nunito font-semibold text-sm text-[#332420]/70 mt-1">
                        {stepNote(step.status, order.fulfillment_type)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {order.fulfillment_type === "pickup" && !canceled && (
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border-2 border-[#332420] bg-[#F5E6CC] p-4 shadow-[4px_4px_0px_0px_#332420] hover:bg-[#790D20]/5"
          >
            <MapPin className="w-6 h-6 shrink-0 text-[#790D20]" aria-hidden />
            <span>
              <span className="block font-mono text-xs font-bold tracking-widest text-[#790D20]">RIDICI DE LA</span>
              <span className="block font-nunito font-black">{SITE_ADDRESS.line}</span>
            </span>
          </a>
        )}

        {/* Receipt */}
        <section className="rounded-2xl border-2 border-[#332420] bg-[#F5E6CC] p-5 shadow-[4px_4px_0px_0px_#332420]">
          <h2 className="font-display text-2xl tracking-wide mb-3"><Display>COMANDA TA</Display></h2>
          <ul className="space-y-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="font-nunito font-bold text-sm">
                <span className="font-black text-[#790D20]">{item.quantity}×</span> {item.product_name}
                {item.modifiers?.length > 0 && (
                  <span className="block font-mono text-[11px] font-normal opacity-70">
                    {item.modifiers.map((m) => m.name).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <dl className="mt-4 pt-3 border-t-2 border-dashed border-[#332420]/30 font-nunito text-sm space-y-1">
            <Row label="Produse" value={formatLei(order.subtotal)} />
            {order.delivery_fee > 0 && <Row label="Livrare" value={formatLei(order.delivery_fee)} />}
            {order.tip_amount > 0 && <Row label="Bacșiș" value={formatLei(order.tip_amount)} />}
            <div className="flex justify-between font-black text-lg pt-1">
              <dt>Total</dt>
              <dd className="text-[#790D20]">{formatLei(order.total_amount)}</dd>
            </div>
          </dl>
        </section>

        {footer}
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
