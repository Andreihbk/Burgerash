-- L.3: secret link for the customer order status page (/comanda/[token]).
-- Run AFTER schema.sql and the earlier migrations. Safe to run more than once.
-- The token is random and unguessable (the BRG number is sequential, so it cannot be the secret).

create extension if not exists "pgcrypto";

-- Existing rows get a token from the column default when it is added.
alter table public.orders
  add column if not exists public_token text not null default encode(gen_random_bytes(16), 'hex');

create unique index if not exists orders_public_token_key on public.orders (public_token);

-- create_order now also returns the token. The return type changes, so drop and recreate it.
-- Grants are not touched here (L.0 step 3 owns them).
drop function if exists public.create_order(jsonb, jsonb);

create function public.create_order(p_order jsonb, p_items jsonb)
returns table (id uuid, order_number text, public_token text)
language plpgsql
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  insert into public.orders (
    fulfillment_type, payment_method, customer_name, customer_phone, customer_email,
    delivery_address, delivery_details, order_note,
    subtotal, delivery_fee, tip_amount, total_amount, cutlery_sets
  )
  values (
    p_order->>'fulfillment_type',
    p_order->>'payment_method',
    p_order->>'customer_name',
    p_order->>'customer_phone',
    p_order->>'customer_email',
    p_order->>'delivery_address',
    p_order->>'delivery_details',
    p_order->>'order_note',
    (p_order->>'subtotal')::numeric,
    (p_order->>'delivery_fee')::numeric,
    (p_order->>'tip_amount')::numeric,
    (p_order->>'total_amount')::numeric,
    (p_order->>'cutlery_sets')::int
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, product_name, ebriza_sku,
    quantity, unit_price, total_price, modifiers, note
  )
  select
    v_order.id,
    i->>'product_id',
    i->>'product_name',
    i->>'ebriza_sku',
    (i->>'quantity')::int,
    (i->>'unit_price')::numeric,
    (i->>'total_price')::numeric,
    coalesce(i->'modifiers', '[]'::jsonb),
    i->>'note'
  from jsonb_array_elements(p_items) as i;

  return query select v_order.id, v_order.order_number, v_order.public_token;
end;
$$;

