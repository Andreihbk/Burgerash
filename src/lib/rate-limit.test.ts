import { afterEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: { rpc: (...args: unknown[]) => rpc(...args) },
}));

import { checkOrderRateLimit, getClientIp, hashIp, normalizeIp, RATE_LIMIT } from "./rate-limit";

function headers(init: Record<string, string> = { "x-real-ip": "203.0.113.7" }) {
  return new Headers(init);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  rpc.mockReset();
});

describe("getClientIp", () => {
  it("prefers x-real-ip", () => {
    expect(getClientIp(headers({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "5.6.7.8" }))).toBe("1.2.3.4");
  });
  it("falls back to the first x-forwarded-for entry", () => {
    expect(getClientIp(headers({ "x-forwarded-for": " 5.6.7.8 , 10.0.0.1" }))).toBe("5.6.7.8");
  });
  it("returns null without headers", () => {
    expect(getClientIp(new Headers())).toBeNull();
  });
});

describe("normalizeIp", () => {
  it("keeps IPv4 and unwraps IPv4-mapped IPv6", () => {
    expect(normalizeIp("203.0.113.7")).toBe("203.0.113.7");
    expect(normalizeIp("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });
  it("reduces IPv6 to its /64 prefix", () => {
    expect(normalizeIp("2001:db8:abcd:12:1111:2222:3333:4444")).toBe("2001:db8:abcd:12::/64");
    expect(normalizeIp("2001:DB8:ABCD:0012::9")).toBe("2001:db8:abcd:12::/64");
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8:0:0::/64");
  });
  it("two addresses in the same /64 share one bucket", () => {
    expect(hashIp("2001:db8:1:2::a", "s")).toBe(hashIp("2001:db8:1:2:ffff::b", "s"));
    expect(hashIp("2001:db8:1:2::a", "s")).not.toBe(hashIp("2001:db8:1:3::a", "s"));
  });
});

describe("hashIp", () => {
  it("is stable, salted and never the raw IP", () => {
    const a = hashIp("203.0.113.7", "salt-a");
    expect(a).toBe(hashIp("203.0.113.7", "salt-a"));
    expect(a).not.toBe(hashIp("203.0.113.7", "salt-b"));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("203.0.113.7");
  });
});

describe("checkOrderRateLimit", () => {
  it("calls the RPC with the hashed IP and the limits; allows when it returns true", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await checkOrderRateLimit(headers())).toEqual({ allowed: true });
    expect(rpc).toHaveBeenCalledWith("check_order_rate_limit", {
      p_ip_hash: hashIp("203.0.113.7", "test-salt"),
      p_max_10m: RATE_LIMIT.max10m,
      p_max_day: RATE_LIMIT.maxDay,
    });
  });

  it("blocks when the RPC returns false", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await checkOrderRateLimit(headers())).toEqual({ allowed: false });
  });

  it("limits are 5 per 10 minutes and 20 per day", () => {
    expect(RATE_LIMIT.max10m).toBe(5);
    expect(RATE_LIMIT.maxDay).toBe(20);
  });

  it("fails open and logs when the RPC returns an error (e.g. table missing)", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockResolvedValue({ data: null, error: { message: "relation does not exist" } });
    expect(await checkOrderRateLimit(headers())).toEqual({ allowed: true });
    expect(log).toHaveBeenCalled();
  });

  it("fails open and logs when the RPC throws", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    rpc.mockRejectedValue(new Error("network"));
    expect(await checkOrderRateLimit(headers())).toEqual({ allowed: true });
    expect(log).toHaveBeenCalled();
  });

  it("fails open and logs, without calling Supabase, when RATE_LIMIT_SALT is missing", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await checkOrderRateLimit(headers())).toEqual({ allowed: true });
    expect(rpc).not.toHaveBeenCalled();
    expect(log.mock.calls[0][0]).toContain("RATE_LIMIT_SALT");
  });

  it("fails open, without calling Supabase, when there is no client IP", async () => {
    vi.stubEnv("RATE_LIMIT_SALT", "test-salt");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await checkOrderRateLimit(new Headers())).toEqual({ allowed: true });
    expect(rpc).not.toHaveBeenCalled();
  });
});
