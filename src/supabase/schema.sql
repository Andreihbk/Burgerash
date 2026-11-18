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
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
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
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  ebriza_sku text,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  modifiers jsonb not null default '[]'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

-- RLS & Politici permisive pentru MVP
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