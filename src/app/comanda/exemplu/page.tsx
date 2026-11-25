import type { Metadata } from "next";
import Link from "next/link";
import OrderStatusView, { type StatusOrder } from "../[token]/OrderStatusView";

export const metadata: Metadata = {
  title: "Exemplu: starea comenzii",
  robots: { index: false, follow: false },
};

// Demo of the order tracking page with sample data (no database). For showing the design.
const DEMO: StatusOrder = {
  order_number: "BRG-0042",
  status: "preparing",
  fulfillment_type: "pickup",
  subtotal: 85,
  delivery_fee: 0,
  tip_amount: 0,
  total_amount: 85,
  order_items: [
    { id: "1", product_name: "CLASIC", quantity: 1, modifiers: [{ id: "m", name: "Extra American Cheddar", price: 5, ebriza_sku: null }] },
    { id: "2", product_name: "CRISPY", quantity: 1, modifiers: [] },
    { id: "3", product_name: "Fries", quantity: 1, modifiers: [] },
  ],
};

export default function OrderStatusDemoPage() {
  return (
    <OrderStatusView
      order={DEMO}
      footer={
        <div className="rounded-xl border-2 border-dashed border-[#790D20] p-4 font-nunito text-sm font-bold">
          Asta e o pagină de exemplu, cu date inventate.{" "}
          <Link href="/" className="underline text-[#790D20]">
            Înapoi la meniu
          </Link>
        </div>
      }
    />
  );
}
