-- PLAN 2.4 step 1: per-product "stoc epuizat" flag.
-- Run AFTER schema.sql and the earlier migrations. Safe to run more than once.
--
-- A row with sold_out = true means the product is sold out. No row = available.
--   service_role (server only: /api/orders) bypasses RLS.
--   anon: read-only (the storefront shows the flag, so it is public by nature).
--   authenticated (= staff, ONLY while sign-ups and anonymous sign-ins are OFF): read, insert, update sold_out.
--   Nobody deletes through the API.
create table if not exists public.product_stock (
  product_id text primary key,            -- catalog id from src/lib/catalog.ts, e.g. 'prod-classic'
  sold_out boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.product_stock enable row level security;

drop policy if exists "Read stock" on public.product_stock;
drop policy if exists "Staff insert stock" on public.product_stock;
drop policy if exists "Staff update stock" on public.product_stock;

revoke all on table public.product_stock from anon, authenticated;
grant select on table public.product_stock to anon, authenticated;
grant insert (product_id, sold_out, updated_at) on table public.product_stock to authenticated;
grant update (sold_out, updated_at) on table public.product_stock to authenticated;

create policy "Read stock" on public.product_stock
  for select to anon, authenticated using (true);
create policy "Staff insert stock" on public.product_stock
  for insert to authenticated with check (true);
create policy "Staff update stock" on public.product_stock
  for update to authenticated using (true) with check (true);

-- Live updates for the storefront and /admin.
do $$
begin
  alter publication supabase_realtime add table public.product_stock;
exception when duplicate_object then
  null;
end $$;
