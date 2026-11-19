-- L.0b step 3: real RLS. Replaces the permissive MVP policies from schema.sql.
-- Run AFTER schema.sql and the earlier migrations, and only AFTER the step 3 code is deployed
-- (the old staff pages used the plain anon client and lose access once this runs).
-- Safe to run more than once.
--
-- Who can do what:
--   service_role (server only: /api/orders, Ebriza sync, /comanda/[token]) bypasses RLS.
--   authenticated (= staff, ONLY while sign-ups and anonymous sign-ins are OFF):
--     SELECT orders + order_items, UPDATE only orders.status and orders.rider_name.
--   anon: no access to orders, order_items or create_order. Read-only on the catalog tables.
--   Nobody deletes anything through the API.

-- ---------- orders / order_items ----------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public access orders" on public.orders;
drop policy if exists "Public access order_items" on public.order_items;
drop policy if exists "Staff read orders" on public.orders;
drop policy if exists "Staff update orders" on public.orders;
drop policy if exists "Staff read order_items" on public.order_items;

-- Table privileges first (Supabase grants ALL to anon/authenticated by default).
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

grant select on table public.orders to authenticated;
grant update (status, rider_name) on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

create policy "Staff read orders" on public.orders
  for select to authenticated using (true);
create policy "Staff update orders" on public.orders
  for update to authenticated using (true) with check (true);
create policy "Staff read order_items" on public.order_items
  for select to authenticated using (true);

-- The order number sequence is only used by create_order (service_role).
revoke all on sequence public.order_number_seq from anon, authenticated;

-- ---------- create_order: server only ----------
revoke execute on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb) to service_role;

-- ---------- catalog tables: read-only for everyone ----------
-- The site menu comes from src/lib/catalog.ts; these tables are not written through the API.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.modifiers enable row level security;

drop policy if exists "Public access categories" on public.categories;
drop policy if exists "Public access products" on public.products;
drop policy if exists "Public access modifiers" on public.modifiers;
drop policy if exists "Read categories" on public.categories;
drop policy if exists "Read products" on public.products;
drop policy if exists "Read modifiers" on public.modifiers;

revoke all on table public.categories, public.products, public.modifiers from anon, authenticated;
grant select on table public.categories, public.products, public.modifiers to anon, authenticated;

create policy "Read categories" on public.categories for select to anon, authenticated using (true);
create policy "Read products" on public.products for select to anon, authenticated using (true);
create policy "Read modifiers" on public.modifiers for select to anon, authenticated using (true);
