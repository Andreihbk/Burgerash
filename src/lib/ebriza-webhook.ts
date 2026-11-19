import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { redact } from "@/lib/ebriza";

// Shared plumbing for the 4 Ebriza URL webhooks (/api/ebriza/<secret>/<hook>).
//
// Auth: Ebriza documents no signature or header for these hooks (EBRIZA_PLAN 1.6, Q13). The only
// working check is an unguessable secret in the URL path that we register with Ebriza by email.
// EBRIZA_WEBHOOK_SECRET (and EBRIZA_WEBHOOK_SECRET_PREVIOUS during rotation) must be 32+ chars.
// An `x-ebriza-webhook-secret` header is accepted too, in case Ebriza adds one later.
//
// Payload formats are NOT documented (Q1), so parsing is defensive. Unknown shapes get 200 +
// a log line listing the field NAMES (never values), so Ebriza does not disable the hook and we
// can learn the format from the logs. Bad auth: 401. Our own DB failure: 500 (lets Ebriza retry).

const MIN_SECRET_LENGTH = 32;
const MAX_BODY_BYTES = 256 * 1024;

export type WebhookName = "change-status" | "sync-products" | "start-accepting-orders" | "set-item-unavailable";

export interface WebhookResult {
  status: number;
  body: Record<string, unknown>;
}

export type WebhookHandler = (payload: Record<string, unknown>) => Promise<WebhookResult>;

export const ok = (body: Record<string, unknown> = {}): WebhookResult => ({ status: 200, body: { ok: true, ...body } });
export const ignored = (reason: string): WebhookResult => ({ status: 200, body: { ok: true, ignored: reason } });

export function webhookLog(hook: WebhookName, level: "info" | "warn" | "error", message: string): void {
  console[level](`[ebriza-webhook] ${hook}: ${redact(message)}`);
}

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time check against the current and (optional) previous secret. Fails closed. */
export function isValidWebhookSecret(provided: string | null | undefined): boolean {
  if (!provided) return false;
  const candidates = [process.env.EBRIZA_WEBHOOK_SECRET, process.env.EBRIZA_WEBHOOK_SECRET_PREVIOUS].filter(
    (s): s is string => typeof s === "string" && s.length >= MIN_SECRET_LENGTH,
  );
  const given = digest(provided);
  let match = false;
  for (const secret of candidates) {
    if (timingSafeEqual(given, digest(secret))) match = true;
  }
  return match;
}

/** Top-level field names only: safe to log, useful to learn the undocumented format. */
export function describeShape(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).slice(0, 30);
  return keys.length ? `fields [${keys.join(", ")}]` : "empty body";
}

/** Objects to search for a field: the body itself plus common wrappers (data, payload, order, bill, item). */
function scopes(payload: Record<string, unknown>): Record<string, unknown>[] {
  const out = [payload];
  for (const key of ["data", "payload", "order", "bill", "item", "product"]) {
    const value = payload[key];
    if (value && typeof value === "object" && !Array.isArray(value)) out.push(value as Record<string, unknown>);
  }
  return out;
}

/** First value under any of `keys` (case-insensitive) in the body or a common wrapper. */
export function pick(payload: Record<string, unknown>, keys: string[]): unknown {
  const wanted = keys.map((k) => k.toLowerCase());
  for (const scope of scopes(payload)) {
    for (const [key, value] of Object.entries(scope)) {
      if (wanted.includes(key.toLowerCase()) && value !== undefined && value !== null && value !== "") return value;
    }
  }
  return undefined;
}

export function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function asInt(value: unknown): number | null {
  const n = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) ? n : null;
}

export function asBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

type RouteContext = { params: Promise<{ secret: string }> };

/** Wraps a handler into a Next.js POST route: auth, body limits, JSON parsing, client id check. */
export function ebrizaWebhookRoute(hook: WebhookName, handler: WebhookHandler) {
  return async function POST(req: Request, ctx: RouteContext): Promise<Response> {
    const { secret } = await ctx.params;
    if (!isValidWebhookSecret(secret) && !isValidWebhookSecret(req.headers.get("x-ebriza-webhook-secret"))) {
      // No detail, and the secret is never logged.
      webhookLog(hook, "warn", "rejected: bad or missing secret");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const text = await req.text().catch(() => "");
    if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

    let payload: Record<string, unknown> = {};
    if (text.trim()) {
      try {
        const parsed: unknown = JSON.parse(text);
        payload =
          parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : { items: parsed };
      } catch {
        webhookLog(hook, "warn", `ignored: body is not JSON (${text.length} bytes)`);
        return NextResponse.json(ignored("not_json").body);
      }
    }

    // A valid secret with another location's client id = stage/live mix-up: never apply it.
    const clientId = asString(pick(payload, ["ebrizaClientID", "clientID", "clientId"]));
    const ourClientId = process.env.EBRIZA_CLIENT_ID;
    if (clientId && ourClientId && clientId !== ourClientId) {
      webhookLog(hook, "warn", "ignored: ebrizaClientID does not match EBRIZA_CLIENT_ID");
      return NextResponse.json(ignored("client_mismatch").body);
    }

    try {
      const result = await handler(payload);
      return NextResponse.json(result.body, { status: result.status });
    } catch (err) {
      webhookLog(hook, "error", `failed: ${err instanceof Error ? err.message : "unknown error"}`);
      return NextResponse.json({ error: "internal" }, { status: 500 });
    }
  };
}
