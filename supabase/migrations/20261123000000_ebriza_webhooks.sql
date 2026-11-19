-- Ebriza webhooks (EBRIZA_PLAN section 3). Run AFTER schema.sql and the earlier migrations.
-- Safe to run more than once. All writes come from the server (service_role) webhook routes.

-- 1. Last POS status reported by ChangeStatusUrl (BillStatus number, e.g. 20 InPreparation).
alter table public.orders add column if not exists ebriza_status integer;
alter table public.orders add column if not exists ebriza_status_at timestamptz;

-- 2. POS "snooze" for a product (SetItemUnavailableUrl). Lasts until the next opening.
--    sold_out_source: 'manual' (admin toggle) or 'ebriza'. snoozed_until null = no expiry.
--    A sold-out row whose snoozed_until has passed counts as available (storefront + /api/orders).
alter table public.product_stock add column if not exists sold_out_source text not null default 'manual';
alter table public.product_stock add column if not exists snoozed_until timestamptz;

do $$
begin
  alter table public.product_stock
    add constraint product_stock_sold_out_source_check check (sold_out_source in ('manual', 'ebriza'));
exception when duplicate_object then
  null;
end $$;

-- Staff (role authenticated) may only write sold_out (column grants). Any staff write is a manual
-- decision: it clears the Ebriza snooze expiry, so a manual "sold out" never silently expires.
-- The webhook writes as service_role and is not affected.
create or replace function public.product_stock_manual_override()
returns trigger
language plpgsql
as $$
begin
  if current_user = 'authenticated' then
    new.snoozed_until := null;
    new.sold_out_source := 'manual';
  end if;
  return new;
end;
$$;

drop trigger if exists product_stock_manual_override on public.product_stock;
create trigger product_stock_manual_override
  before insert or update on public.product_stock
  for each row execute function public.product_stock_manual_override();

-- 3. Store-wide "accepting online orders" flag (StartAcceptingOrdersUrl). Single row, id = 1.
--    Separate from NEXT_PUBLIC_ORDERING_ENABLED (pre-launch switch) and the opening hours.
create table if not exists public.store_settings (
  id smallint primary key default 1 check (id = 1),
  accepting_orders boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'manual'
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;
revoke all on table public.store_settings from anon, authenticated;
grant select on table public.store_settings to anon, authenticated;

drop policy if exists "Read store settings" on public.store_settings;
create policy "Read store settings" on public.store_settings
  for select to anon, authenticated using (true);

do $$
begin
  alter publication supabase_realtime add table public.store_settings;
exception when duplicate_object then
  null;
end $$;
