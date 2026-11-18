import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EbrizaOpenBillWithClientRequest } from "@/types/ebriza";
import { getBillByExternal, openBillWithClient, redact, resetEbrizaTokenCache } from "./ebriza";

const payload: EbrizaOpenBillWithClientRequest = {
  bill: {
    items: [{ sku: "brg-classic", quantity: 1 }],
    externalOrderID: "11111111-1111-4111-8111-111111111111",
    externalOrderNo: "BRG-1001",
    isForPickup: true,
  },
  client: { firstName: "Ana", lastName: "Pop", phone: "0722123456" },
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  resetEbrizaTokenCache();
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mock mode", () => {
  it("returns a fake bill and never calls the network", async () => {
    vi.stubEnv("EBRIZA_MOCK", "true");
    const res = await openBillWithClient(payload);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.mock).toBe(true);
    expect(res.data.billId).toMatch(/^mock-bill-/);

    const ext = await getBillByExternal(payload.bill.externalOrderID, "BRG-1001");
    expect(ext.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("path 1 (clientid only)", () => {
  it("sends ebriza-clientid and appname, no Authorization", async () => {
    vi.stubEnv("EBRIZA_MOCK", "false");
    vi.stubEnv("EBRIZA_PATH", "1");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");
    vi.stubEnv("EBRIZA_APP_NAME", "Burgerash");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: "bill-42" }));

    const res = await openBillWithClient(payload);
    expect(res.ok && res.data.billId).toBe("bill-42");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.ebriza.com/bills/openbillwithclient");
    const headers = init?.headers as Record<string, string>;
    expect(headers["ebriza-clientid"]).toBe("client-x");
    expect(headers["ebriza-appname"]).toBe("Burgerash");
    expect(headers.Authorization).toBeUndefined();
  });

  it("maps a 400 with an error code to a non-retryable failure", async () => {
    vi.stubEnv("EBRIZA_PATH", "1");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { code: "0104", message: "SKU not found" }));

    const res = await openBillWithClient(payload);
    expect(res).toMatchObject({ ok: false, httpStatus: 400, kind: "validation", errorCode: "0104", retryable: false });
  });
});

describe("path 2 (token)", () => {
  beforeEach(() => {
    vi.stubEnv("EBRIZA_PATH", "2");
    vi.stubEnv("EBRIZA_CLIENT_ID", "client-x");
    vi.stubEnv("EBRIZA_APP_ID", "app-id");
    vi.stubEnv("EBRIZA_APP_SECRET", "app-secret");
  });

  it("uses Basic auth for the token and caches it", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { access_token: "tok-1", expires_in: 1800, token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "b1" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "b2" }));

    await openBillWithClient(payload);
    await openBillWithClient(payload);

    expect(fetchMock).toHaveBeenCalledTimes(3); // one token call only
    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe("https://api.ebriza.com/token");
    const tokenHeaders = tokenInit?.headers as Record<string, string>;
    expect(tokenHeaders.Authorization).toBe(`Basic ${Buffer.from("app-id:app-secret").toString("base64")}`);
    expect(tokenHeaders["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect((fetchMock.mock.calls[2][1]?.headers as Record<string, string>).Authorization).toBe("bearer tok-1");
  });

  it("on 401 refreshes the token and retries once", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { access_token: "tok-old", expires_in: 1800, token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, { access_token: "tok-new", expires_in: 1800, token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "b1" }));

    const res = await openBillWithClient(payload);
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((fetchMock.mock.calls[3][1]?.headers as Record<string, string>).Authorization).toBe("bearer tok-new");
  });

  it("gives up after a second 401", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { access_token: "a", expires_in: 1800, token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, { access_token: "b", expires_in: 1800, token_type: "bearer" }))
      .mockResolvedValueOnce(jsonResponse(401, {}));

    const res = await openBillWithClient(payload);
    expect(res).toMatchObject({ ok: false, httpStatus: 401, kind: "unauthorized" });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe("redact", () => {
  it("masks phone numbers", () => {
    expect(redact("client 0722 123 456 failed")).toBe("client ***456 failed");
    expect(redact("+40722123456")).toBe("***456");
  });
});
