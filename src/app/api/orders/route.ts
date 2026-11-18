import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fulfillment_type,
      payment_method,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_details,
      order_note,
      subtotal,
      delivery_fee,
      tip_amount,
      total_amount,
      cutlery_sets,
      items,
    } = body;

    // 1. Generare număr unic de comandă (Ex: BRG-1042)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BRG-${randomNum}`;

    // 2. Salvare în Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "pending",
        fulfillment_type,
        payment_method,
        is_paid: false,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        delivery_details,
        order_note,
        subtotal,
        delivery_fee,
        tip_amount,
        total_amount,
        cutlery_sets,
        ebriza_sync_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Supabase order insert error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 3. Salvare linii de comandă (order_items)
    const orderItemsPayload = items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      ebriza_sku: item.ebriza_sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      modifiers: item.modifiers || [],
      note: item.note || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

    if (itemsError) {
      console.error("Supabase order items insert error:", itemsError);
    }

    // 4. Integrare opțională cu Ebriza (dacă ai setat variabilele în .env.local)
    // Aici va trimite POST /bills/openbillwithclient când ai cheile active

    return NextResponse.json({
      success: true,
      order_id: orderData.id,
      order_number: orderNumber,
    });
  } catch (err: any) {
    console.error("API Error creating order:", err);
    return NextResponse.json({ error: err.message || "Eroare internă de server" }, { status: 500 });
  }
}