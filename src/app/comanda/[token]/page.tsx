import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { isFinalStatus, TOKEN_PATTERN } from "@/lib/order-status";
import AutoRefresh from "./AutoRefresh";
import ClearLastOrder from "./ClearLastOrder";
import OrderStatusView, { type StatusOrder } from "./OrderStatusView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Starea comenzii",
  robots: { index: false, follow: false },
};

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

  return (
    <>
      {isFinalStatus(order.status) ? <ClearLastOrder token={token} /> : <AutoRefresh />}
      <OrderStatusView
        order={order}
        footer={
          <p className="font-nunito text-xs opacity-70">
            Pagina se actualizează singură. Păstrează linkul: doar cine îl are poate vedea comanda.
          </p>
        }
      />
    </>
  );
}
