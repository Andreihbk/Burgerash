import "server-only";

import { createHmac } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Per-IP order rate limit, stored in Supabase (migrations/20261122000000_order_rate_limit.sql).
// In-memory counters would not work: every Vercel serverless instance has its own memory.
// FAILS OPEN: if the limiter cannot run (no salt, no IP, DB error) the order goes through and it is logged.

export const RATE_LIMIT = {
  max10m: 5,
  maxDay: 20,
  /** Upper bound for the Retry-After header (one 10-minute window). */
  retryAfterSeconds: 600,
} as const;

/** Vercel sets x-real-ip and x-forwarded-for (and overwrites client-sent values). */
export function getClientIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

function ipv6Prefix64(ip: string): string | null {
  const parts = ip.split("%")[0].split("::");
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(":") : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (parts.length === 1 ? head.length !== 8 : missing < 1) return null;
  const groups = [...head, ...Array<string>(parts.length === 2 ? missing : 0).fill("0"), ...tail];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

/**
 * IPv4 stays as is (IPv4-mapped IPv6 is unwrapped). IPv6 is reduced to its /64 prefix:
 * one connection usually owns a whole /64, so rotating addresses inside it must not reset the limit.
 */
export function normalizeIp(ip: string): string {
  const lower = ip.trim().toLowerCase();
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(lower);
  if (mapped) return mapped[1];
  if (!lower.includes(":")) return lower;
  return ipv6Prefix64(lower) ?? lower;
}

export function hashIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(normalizeIp(ip)).digest("hex");
}

/** Counts this attempt and says whether it is allowed. Never throws. */
export async function checkOrderRateLimit(headers: Headers): Promise<{ allowed: boolean }> {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) {
    console.error("[rate-limit] RATE_LIMIT_SALT is not set: rate limit skipped (fail open)");
    return { allowed: true };
  }

  const ip = getClientIp(headers);
  if (!ip) {
    console.warn("[rate-limit] no client IP on the request: rate limit skipped (fail open)");
    return { allowed: true };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("check_order_rate_limit", {
      p_ip_hash: hashIp(ip, salt),
      p_max_10m: RATE_LIMIT.max10m,
      p_max_day: RATE_LIMIT.maxDay,
    });
    if (error) {
      console.error("[rate-limit] check failed, failing open:", error.message);
      return { allowed: true };
    }
    return { allowed: data !== false };
  } catch (err) {
    console.error("[rate-limit] check threw, failing open:", err instanceof Error ? err.message : "unknown");
    return { allowed: true };
  }
}
