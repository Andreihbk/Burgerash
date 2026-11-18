-- Task 1.5: Ebriza sync tracking on orders.
-- Run AFTER supabase/schema.sql. Safe to run more than once.
-- schema.sql is left as it was; this migration changes what it created.

-- 1. Error code of the last failed push (Ebriza code like '0104', or an HTTP/network kind).
alter table public.orders add column if not exists ebriza_error_code text;

-- 2. Status values become: pending | sent | failed | skipped  ('synced' is renamed to 'sent').
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%ebriza_sync_status%'
  loop
    execute format('alter table public.orders drop constraint %I', c.conname);
  end loop;
end
$$;

update public.orders set ebriza_sync_status = 'sent' where ebriza_sync_status = 'synced';

alter table public.orders
  add constraint orders_ebriza_sync_status_check
  check (ebriza_sync_status in ('pending', 'sent', 'failed', 'skipped'));
