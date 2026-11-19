-- ==========================================
-- BURGERASH SUPABASE SCHEMA + REALTIME
-- ==========================================

create extension if not exists "pgcrypto";

-- 1. CATEGORII
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. PRODUSE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null,
  weight_grams int,
  image_url text,
  label_text text,
  label_variant text check (label_variant in ('burgundy', 'charcoal', 'cream')),
  ebriza_sku text,
  ebriza_id text,
  allergens text[] not null default '{}',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. MODIFICATORI (Extra-uri, Sosuri, Eliminare ingrediente)
create table if not exists public.modifiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text not null check (group_name in ('extra', 'sauce', 'remove')),
  price numeric(10, 2) not null default 0,
  ebriza_sku text,
  is_available boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. COMENZI
-- Order numbers BRG-XXXX come from a sequence (no random collisions).
create sequence if not exists public.order_number_seq start with 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default 'BRG-' || lpad(nextval('public.order_number_seq')::text, 4, '0'),
  status text not null default 'pending' check (
    status in ('pending', 'preparing', 'ready_for_packing', 'out_for_delivery', 'delivered', 'canceled')
  ),
  fulfillment_type text not null default 'delivery' check (fulfillment_type in ('delivery', 'pickup')),
  payment_method text not null default 'card_on_delivery' check (
    payment_method in ('cash_on_delivery', 'card_on_delivery', 'online_card')
  ),
  is_paid boolean not null default false,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text,
  delivery_details text,
  order_note text,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  tip_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  cutlery_sets int not null default 0,
  rider_name text,
  ebriza_bill_id text,
  ebriza_sync_status text not null default 'pending' check (
    ebriza_sync_status in ('pending', 'synced', 'failed', 'skipped')
  ),
  ebriza_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. LINII COMANDĂ
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  -- Catalog id from src/lib/catalog.ts (e.g. "prod-classic"); name/price/sku are snapshots.
  product_id text,
  product_name text not null,
  ebriza_sku text,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  modifiers jsonb not null default '[]'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Create an order and its items in ONE transaction (called via supabase.rpc).
-- If any insert fails, the whole call is rolled back: no order without items.
-- Prices must already be computed server-side (src/lib/pricing.ts).
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns table (id uuid, order_number text)
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

  return query select v_order.id, v_order.order_number;
end;
$$;

-- RLS & Politici permisive pentru MVP.
-- REPLACED by migrations/20261120000000_staff_rls.sql (L.0b). Always run the migrations after this file.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.modifiers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public access categories" on public.categories for all using (true) with check (true);
create policy "Public access products" on public.products for all using (true) with check (true);
create policy "Public access modifiers" on public.modifiers for all using (true) with check (true);
create policy "Public access orders" on public.orders for all using (true) with check (true);
create policy "Public access order_items" on public.order_items for all using (true) with check (true);

-- Activare Realtime pentru KDS (/kitchen), Dispatch (/dispatch) și Rider (/rider)
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.products;