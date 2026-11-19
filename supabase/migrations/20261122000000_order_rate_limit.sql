-- PLAN B.1: rate limit for /api/orders, stored in Postgres (Vercel serverless has no shared memory).
-- Run AFTER schema.sql and the earlier migrations. Safe to run more than once.
--
-- One row per (hashed IP, bucket, window). The IP is HMAC-SHA256'd server-side with RATE_LIMIT_SALT
-- (src/lib/rate-limit.ts), so no raw IP is ever stored.
--   service_role (server only: /api/orders via supabase-admin) is the ONLY role with access.
--   anon / authenticated: no grants, no policies -> no access at all.
-- Limits are passed in by the caller (src/lib/rate-limit.ts: 5 per 10 minutes, 20 per day).

create table if not exists public.order_rate_limits (
  ip_hash text not null,
  bucket text not null check (bucket in ('10m', 'day')),
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  primary key (ip_hash, bucket, window_start)
);

alter table public.order_rate_limits enable row level security;

-- No policies on purpose. Remove any default table privileges from the API roles.
revoke all on table public.order_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.order_rate_limits to service_role;

-- Returns true and counts the attempt when both windows are under their limit.
-- Returns false (and counts nothing) when either limit is reached, so a blocked
-- attempt does not use up the daily quota.
create or replace function public.check_order_rate_limit(
  p_ip_hash text,
  p_max_10m integer,
  p_max_day integer
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_now timestamptz := now();
  -- Fixed 10-minute window and the calendar day in Bucharest.
  v_10m timestamptz := to_timestamp(floor(extract(epoch from v_now) / 600) * 600);
  v_day timestamptz := date_trunc('day', v_now at time zone 'Europe/Bucharest') at time zone 'Europe/Bucharest';
  v_hits_10m integer;
  v_hits_day integer;
begin
  if p_ip_hash is null or length(p_ip_hash) = 0 then
    return true;
  end if;

  insert into public.order_rate_limits (ip_hash, bucket, window_start, hits)
  values (p_ip_hash, '10m', v_10m, 0), (p_ip_hash, 'day', v_day, 0)
  on conflict (ip_hash, bucket, window_start) do nothing;

  -- Lock both rows (always in the same order) so concurrent requests from one IP cannot overshoot.
  select hits into v_hits_10m from public.order_rate_limits
   where ip_hash = p_ip_hash and bucket = '10m' and window_start = v_10m
   for update;
  select hits into v_hits_day from public.order_rate_limits
   where ip_hash = p_ip_hash and bucket = 'day' and window_start = v_day
   for update;

  if v_hits_10m >= p_max_10m or v_hits_day >= p_max_day then
    return false;
  end if;

  update public.order_rate_limits
     set hits = hits + 1
   where ip_hash = p_ip_hash
     and ((bucket = '10m' and window_start = v_10m) or (bucket = 'day' and window_start = v_day));

  -- Housekeeping on ~1% of calls: old windows are useless after a day.
  if random() < 0.01 then
    delete from public.order_rate_limits where window_start < v_now - interval '2 days';
  end if;

  return true;
end;
$$;

revoke all on function public.check_order_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_order_rate_limit(text, integer, integer) to service_role;
