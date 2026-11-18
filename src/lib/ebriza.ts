import "server-only";

import type {
  EbrizaHttpErrorKind,
  EbrizaOpenBillResult,
  EbrizaOpenBillWithClientRequest,
  EbrizaResult,
  EbrizaTokenResponse,
} from "@/types/ebriza";
import { EBRIZA_RETRYABLE_CODES } from "@/types/ebriza";

// Server-side ONLY. Never import from a client component.
// Facts: .claude/skills/ebriza-api/reference.md

const BASE_URL = "https://api.ebriza.com";
const TIMEOUT_MS = 8000;
const TOKEN_SAFETY_MARGIN_MS = 60_000;
const MOCK_DELAY_MS = 120;

type EbrizaPath = 1 | 2;

interface EbrizaConfig {
  mock: boolean;
  path: EbrizaPath;
  clientId: string | undefined;
  appId: string | undefined;
  appSecret: string | undefined;
  appName: string | undefined;
}

function getConfig(): EbrizaConfig {
  return {
    mock: process.env.EBRIZA_MOCK === "true",
    path: process.env.EBRIZA_PATH === "2" ? 2 : 1,
    clientId: process.env.EBRIZA_CLIENT_ID || undefined,
    appId: process.env.EBRIZA_APP_ID || undefined,
    appSecret: process.env.EBRIZA_APP_SECRET || undefined,
    appName: process.env.EBRIZA_APP_NAME || undefined,
  };
}

// ---------- Safe logging ----------

/** Masks phone-like digit runs (keeps last 3 digits) so logs never hold full numbers. */
export function redact(text: string): string {
  return text.replace(/\+?\d[\d\s.-]{6,}\d/g, (match) => {
    const digits = match.replace(/\D/g, "");
    return `***${digits.slice(-3)}`;
  });
}

function log(level: "info" | "warn" | "error", message: string): void {
  console[level](`[ebriza] ${redact(message)}`);
}

// ---------- Token (path 2) ----------

let cachedToken: { value: string; expiresAt: number } | null = null;

/** For tests. */
export function resetEbrizaTokenCache(): void {
  cachedToken = null;
}

async function getToken(config: EbrizaConfig, forceRefresh: boolean): Promise<EbrizaResult<string>> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
    return { ok: true, data: cachedToken.value, mock: false };
  }
  cachedToken = null;

  if (!config.appId || !config.appSecret) {
    return failure(null, "unknown", null, "EBRIZA_APP_ID / EBRIZA_APP_SECRET not set (path 2)");
  }

  const basic = Buffer.from(`${config.appId}:${config.appSecret}`).toString("base64");
  const res = await timedFetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "",
  });
  if (!res.ok) return res;

  const response = res.data;
  if (!response.ok) return httpFailure(response);

  const json = (await response.json().catch(() => null)) as Partial<EbrizaTokenResponse> | null;
  if (!json?.access_token) {
    return failure(response.status, "unknown", null, "Token response without access_token");
  }
  const lifetimeMs = (json.expires_in ?? 1800) * 1000;
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + Math.max(lifetimeMs - TOKEN_SAFETY_MARGIN_MS, 0),
  };
  return { ok: true, data: json.access_token, mock: false };
}

// ---------- HTTP ----------

function failure(
  httpStatus: number | null,
  kind: EbrizaHttpErrorKind,
  errorCode: string | null,
  message: string,
): Extract<EbrizaResult, { ok: false }> {
  const retryable =
    kind === "server" ||
    kind === "network" ||
    (errorCode !== null && EBRIZA_RETRYABLE_CODES.includes(errorCode));
  return { ok: false, httpStatus, kind, errorCode, message: redact(message), retryable };
}

function kindFromStatus(status: number): EbrizaHttpErrorKind {
  if (status === 400) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 412) return "missing_client_id";
  if (status >= 500) return "server";
  return "unknown";
}

/** The error body shape is not documented: look for a 4-digit Ebriza code anywhere in it. */
async function httpFailure(response: Response): Promise<Extract<EbrizaResult, { ok: false }>> {
  const text = await response.text().catch(() => "");
  const code = text.match(/\b0\d{3}\b/)?.[0] ?? null;
  return failure(
    response.status,
    kindFromStatus(response.status),
    code,
    `HTTP ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
  );
}

async function timedFetch(url: string, init: RequestInit): Promise<EbrizaResult<Response>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    return { ok: true, data: response, mock: false };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return failure(null, "network", null, aborted ? `Timeout after ${TIMEOUT_MS}ms` : "Network error");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calls the Ebriza API. Path 1: only ebriza-clientid. Path 2: adds the bearer token;
 * on 401 the token is refreshed and the call retried once.
 */
async function ebrizaRequest(
  config: EbrizaConfig,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<EbrizaResult<unknown>> {
  if (!config.clientId) {
    return failure(null, "missing_client_id", "0664", "EBRIZA_CLIENT_ID not set");
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const headers: Record<string, string> = {
      "ebriza-clientid": config.clientId,
      "Content-Type": "application/json",
    };
    if (config.appName) headers["ebriza-appname"] = config.appName;

    if (config.path === 2) {
      const token = await getToken(config, attempt > 0);
      if (!token.ok) return token;
      headers.Authorization = `bearer ${token.data}`;
    }

    const res = await timedFetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) return res;

    const response = res.data;
    if (response.status === 401 && config.path === 2 && attempt === 0) {
      log("warn", `401 on ${path}, refreshing token and retrying once`);
      cachedToken = null;
      continue;
    }
    if (!response.ok) return httpFailure(response);

    const text = await response.text().catch(() => "");
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return { ok: true, data, mock: false };
  }

  return failure(401, "unauthorized", "0665", "Still unauthorized after token refresh");
}

function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// ---------- Public API ----------

/** POST /bills/openbillwithclient. Never throws; returns a result to store on the order. */
export async function openBillWithClient(
  payload: EbrizaOpenBillWithClientRequest,
): Promise<EbrizaResult<EbrizaOpenBillResult>> {
  const config = getConfig();
  const orderNo = payload.bill.externalOrderNo;

  if (config.mock) {
    await mockDelay();
    const id = `mock-bill-${crypto.randomUUID()}`;
    log("info", `MOCK openbillwithclient ${orderNo} -> ${id} (${payload.bill.items.length} lines)`);
    return {
      ok: true,
      mock: true,
      data: {
        billId: id,
        raw: { id, externalOrderID: payload.bill.externalOrderID, externalOrderNo: orderNo, mock: true },
      },
    };
  }

  const res = await ebrizaRequest(config, "POST", "/bills/openbillwithclient", payload);
  if (!res.ok) {
    log("error", `openbillwithclient ${orderNo} failed: status=${res.httpStatus} code=${res.errorCode} kind=${res.kind}`);
    return res;
  }

  // Response shape not documented yet: take `id` if present, keep raw.
  const raw = res.data;
  const id = raw && typeof raw === "object" && "id" in raw ? (raw as { id: unknown }).id : null;
  const billId = typeof id === "string" || typeof id === "number" ? String(id) : null;
  log("info", `openbillwithclient ${orderNo} ok, billId=${billId ?? "unknown"}`);
  return { ok: true, mock: false, data: { billId, raw } };
}

/** GET /bills/getExternal (path 2 only). Used to check before retrying a failed push. */
export async function getBillByExternal(
  externalOrderID: string,
  externalOrderNo: string,
): Promise<EbrizaResult<unknown>> {
  const config = getConfig();

  if (config.mock) {
    await mockDelay();
    return { ok: true, mock: true, data: null };
  }
  if (config.path !== 2) {
    return failure(null, "unknown", null, "getExternal needs EBRIZA_PATH=2 (token)");
  }

  const query = new URLSearchParams({ externalOrderID, externalOrderNo });
  return ebrizaRequest(config, "GET", `/bills/getExternal?${query.toString()}`);
}
