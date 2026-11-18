---
name: ebriza-api
description: Use when writing or changing code that talks to the Ebriza POS API (src/lib/ebriza.ts, src/types/ebriza.ts, /api/orders, /api/webhooks/ebriza), mapping orders or SKUs to Ebriza, or debugging Ebriza error codes.
---

# Ebriza integration rules

Always read `reference.md` in this folder first. It is the source of truth. Do not invent
endpoints, fields, or webhook signatures that are not in it.

## Rules
1. Server-side only. Never import `ebriza.ts` into a client component. No NEXT_PUBLIC_ Ebriza vars.
2. Never log secrets, tokens, or full customer phone numbers.
3. Support `EBRIZA_MOCK=true`: return realistic fake responses and never hit the network.
4. Support `EBRIZA_PATH`: 1 = only `ebriza-clientid` (openbillwithclient, no token);
   2 = app ID/secret token flow (reads, webhooks, bill lookup).
5. Token: cache in memory; on any 401 fetch a new one and retry once. Do not rely on a timer alone.
6. Supabase is the source of truth for staff screens. Insert the order FIRST, then call Ebriza.
   If Ebriza fails, keep the order, store status + error code, allow retry. Never lose an order.
7. Idempotency: `externalOrderID` = Supabase order UUID, `externalOrderNo` = BRG-XXXX.
   Before retrying a failed push (path 2), check `GET /bills/getExternal`.
8. Webhooks carry only an ID + entity type and are not signed (per docs). Protect the route with a
   secret in the URL path, then re-fetch the bill/order from the API; trust the fetch, not the payload.
9. SKU matching lives in `src/lib/ebriza-sku-map.ts`. Unmapped SKUs must fail loudly in logs
   (error 0104 / 0100), not silently create products.
10. Delivery fee, tip, cutlery are system lines: `{ type, quantity }` only (see reference).

## Before finishing
Run build + lint. Add or update a mock-mode test for any payload change.
