import { after, NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import { priceOrder, PricingError } from "@/lib/pricing";
import { CLOSED_ORDER_ERROR, getStatus } from "@/lib/hours";
import { isOrderingEnabled } from "@/lib/ordering";
import { syncOrderToEbriza } from "@/lib/ebriza-sync";
import { getSoldOutIds, soldOutMessage, soldOutNames, STOCK_UNAVAILABLE_ERROR } from "@/lib/stock";
import { checkBot, fakeOrderSuccess, TOO_FAST_ERROR } from "@/lib/bot-check";
import { OrderInputError, parseOrderInput, type OrderInput } from "@/lib/order-input";
import { checkOrderRateLimit, RATE_LIMIT } from "@/lib/rate-limit";
import { isAcceptingOrders, ORDERS_PAUSED_ERROR } from "@/lib/store-settings";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Order of checks (PLAN B.1): ordering switch -> honeypot/timing -> input validation (+ opening hours)
// -> rate limit -> stock + pricing -> create_order. Cheap, DB-free checks come first, so bots and
// bad input never touch Supabase or use up a real customer's rate-limit quota.
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
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return badRequest("Cerere invalidă.");
    body = parsed as Record<string, unknown>;
  } catch {
    return badRequest("Cerere invalidă.");
  }

  const bot = checkBot(body);
  if (!bot.ok) {
    console.warn(`[orders] bot check blocked a request: ${bot.reason}`);
    // Honeypot: the bot believes it worked; nothing is stored. Too fast: humans can simply resubmit.
    return bot.reason === "honeypot" ? NextResponse.json(fakeOrderSuccess()) : badRequest(TOO_FAST_ERROR);
  }

  let input: OrderInput;
  try {
    input = parseOrderInput(body);
  } catch (err) {
    if (err instanceof OrderInputError) return badRequest(err.message);
    throw err;
  }

  if (!getStatus().open) {
    return NextResponse.json({ error: CLOSED_ORDER_ERROR, code: "closed" }, { status: 403 });
  }

  // POS pause (Ebriza StartAcceptingOrdersUrl). Fails open if the flag cannot be read.
  if (!(await isAcceptingOrders())) {
    return NextResponse.json({ error: ORDERS_PAUSED_ERROR, code: "paused" }, { status: 403 });
  }

  const limit = await checkOrderRateLimit(req.headers);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT.retryAfterSeconds) } },
    );
  }

  // Sold-out products (product_stock) are rejected before pricing. If the stock cannot be read we
  // fail closed: create_order needs Supabase anyway, so this adds no new failure mode.
  let soldOut: string[];
  try {
    soldOut = soldOutNames(input.items.map((i) => i.product_id), await getSoldOutIds());
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
      items: input.items,
      fulfillmentType: input.fulfillmentType,
      tipAmount: input.tipAmount,
      cutlerySets: input.cutlerySets,
    });
  } catch (err) {
    if (err instanceof PricingError) return badRequest(err.message);
    throw err;
  }

  const { items, ...totals } = priced;
  const order = {
    fulfillment_type: input.fulfillmentType,
    payment_method: input.paymentMethod,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    delivery_address: input.deliveryAddress,
    delivery_details: input.deliveryDetails,
    order_note: input.orderNote,
  };

  // Order + items are inserted in one Postgres transaction (supabase/schema.sql: create_order).
  // Server-only service_role client: anon cannot call create_order directly (PLAN L.0, Option B).
  const { data, error } = await supabaseAdmin.rpc("create_order", {
    p_order: { ...order, ...totals },
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
        ...order,
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
