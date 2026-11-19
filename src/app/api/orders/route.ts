import { after, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { priceOrder, PricingError, type RequestedItem } from "@/lib/pricing";
import { normalizeRoPhone, PHONE_ERROR } from "@/lib/phone";
import { EMAIL_ERROR, isValidEmail } from "@/lib/email";
import { CLOSED_ORDER_ERROR, getStatus } from "@/lib/hours";
import { isOrderingEnabled } from "@/lib/ordering";
import { syncOrderToEbriza } from "@/lib/ebriza-sync";
import { getSoldOutIds, soldOutMessage, soldOutNames, STOCK_UNAVAILABLE_ERROR } from "@/lib/stock";
import type { FulfillmentType, PaymentMethod } from "@/types/database";

const FULFILLMENT_TYPES: FulfillmentType[] = ["delivery", "pickup"];
const PAYMENT_METHODS: PaymentMethod[] = ["cash_on_delivery", "card_on_delivery", "online_card"];

function optionalText(value: unknown, max = 500): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  // Pre-launch switch: checked first so nothing else (DB, stock, Ebriza) is touched while closed.
  if (!isOrderingEnabled()) {
    return NextResponse.json({ error: "ordering_closed" }, { status: 503 });
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "Comenzile nu sunt disponibile momentan." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Cerere invalidă.");
  }

  const fulfillmentType = body.fulfillment_type as FulfillmentType;
  const paymentMethod = body.payment_method as PaymentMethod;
  if (!FULFILLMENT_TYPES.includes(fulfillmentType)) return badRequest("Tip de livrare invalid.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) return badRequest("Metodă de plată invalidă.");

  if (!getStatus().open) {
    return NextResponse.json({ error: CLOSED_ORDER_ERROR, code: "closed" }, { status: 403 });
  }

  const customerName = optionalText(body.customer_name, 120);
  const customerPhone = optionalText(body.customer_phone, 40);
  const deliveryAddress = optionalText(body.delivery_address);
  if (!customerName || !customerPhone) return badRequest("Numele și telefonul sunt obligatorii.");
  const normalizedPhone = normalizeRoPhone(customerPhone);
  if (!normalizedPhone) return badRequest(PHONE_ERROR);
  const customerEmail = optionalText(body.customer_email, 200);
  if (customerEmail && !isValidEmail(customerEmail)) return badRequest(EMAIL_ERROR);
  if (fulfillmentType === "delivery" && !deliveryAddress) return badRequest("Adresa este obligatorie.");

  if (!Array.isArray(body.items)) return badRequest("Coșul este gol.");

  // Only ids, quantities and notes are taken from the client; all prices come from catalog.ts.
  const requestedItems: RequestedItem[] = body.items.map((raw: unknown) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    const modifiers = Array.isArray(item.modifiers) ? item.modifiers : [];
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      note: item.note,
      modifier_ids: modifiers
        .map((m) => (m && typeof m === "object" ? (m as { id?: unknown }).id : m))
        .filter((id): id is string => typeof id === "string"),
    };
  });

  // Sold-out products (product_stock) are rejected before pricing. If the stock cannot be read we
  // fail closed: create_order needs Supabase anyway, so this adds no new failure mode.
  let soldOut: string[];
  try {
    soldOut = soldOutNames(requestedItems.map((i) => i.product_id), await getSoldOutIds());
  } catch (err) {
    console.error("Stock check error:", err);
    return NextResponse.json({ error: STOCK_UNAVAILABLE_ERROR }, { status: 503 });
  }
  if (soldOut.length > 0) {
    return NextResponse.json({ error: soldOutMessage(soldOut), code: "sold_out" }, { status: 409 });
  }

  let priced;
  try {
    priced = priceOrder({
      items: requestedItems,
      fulfillmentType,
      tipAmount: body.tip_amount,
      cutlerySets: body.cutlery_sets,
    });
  } catch (err) {
    if (err instanceof PricingError) return badRequest(err.message);
    throw err;
  }

  const { items, ...totals } = priced;

  // Order + items are inserted in one Postgres transaction (supabase/schema.sql: create_order).
  // Server-only service_role client: anon cannot call create_order directly (PLAN L.0, Option B).
  const { data, error } = await supabaseAdmin.rpc("create_order", {
    p_order: {
      fulfillment_type: fulfillmentType,
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_phone: normalizedPhone,
      customer_email: customerEmail,
      delivery_address: fulfillmentType === "delivery" ? deliveryAddress : null,
      delivery_details: optionalText(body.delivery_details),
      order_note: optionalText(body.order_note),
      ...totals,
    },
    p_items: items,
  });

  const created = Array.isArray(data) ? data[0] : data;
  if (error || !created) {
    console.error("Supabase create_order error:", error);
    return NextResponse.json(
      { error: "Comanda nu a putut fi salvată. Încearcă din nou." },
      { status: 500 }
    );
  }

  // Push to Ebriza AFTER the order is stored, once the response is sent: a slow or down POS
  // never delays or fails the customer. The outcome is saved on the order (sync status, code, bill id).
  after(() =>
    syncOrderToEbriza(
      {
        id: created.id,
        order_number: created.order_number,
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: normalizedPhone,
        customer_email: customerEmail,
        delivery_address: fulfillmentType === "delivery" ? deliveryAddress : null,
        delivery_details: optionalText(body.delivery_details),
        order_note: optionalText(body.order_note),
        delivery_fee: totals.delivery_fee,
        tip_amount: totals.tip_amount,
        total_amount: totals.total_amount,
        cutlery_sets: totals.cutlery_sets,
      },
      items,
    ),
  );

  return NextResponse.json({
    success: true,
    order_id: created.id,
    order_number: created.order_number,
    public_token: created.public_token,
    ...totals,
  });
}
