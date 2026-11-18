#!/usr/bin/env bash
# Burgerash - Claude Code config pack.
# Run from the REPO ROOT:  bash setup-claude-config.sh
# Safe to re-run: it never overwrites existing files.
set -euo pipefail

put() {
  local f="$1"
  mkdir -p "$(dirname "$f")"
  if [ -e "$f" ]; then
    echo "skip (already exists): $f"
    cat >/dev/null
  else
    cat > "$f"
    echo "created: $f"
  fi
}

# ---------------------------------------------------------------- CLAUDE.md
put CLAUDE.md <<'EOF'
# Burgerash

Street-food burger ordering app (Bucharest). Next.js App Router, TypeScript strict,
Tailwind v4, Zustand, Supabase (+Realtime), server-side Ebriza POS adapter. Hosted on Vercel.

## Architecture (do not change)
Dual layer: Supabase = live operational data + realtime for staff views.
`src/lib/ebriza.ts` (server-side ONLY) bridges orders to the Ebriza POS.
Staff apps must keep working if Ebriza is slow or down.

## Structure
- src/app: page, layout, globals.css, kitchen/ dispatch/ rider/ admin/, api/orders/route.ts
- src/components: StoreFront, CartDrawer, BurgerStamp
- src/lib: catalog.ts, supabase.ts, ebriza.ts
- src/store/cartStore.ts - src/types/{database,ebriza}.ts - supabase/schema.sql

## Hard rules
- Brand tokens are fixed: #790D20 wine, #F5E6CC sand, #332420 charcoal; Eatvetica headings;
  fonts Bebas Neue, Roboto Mono, Nunito.
- No /events page.
- Order numbers: BRG-XXXX. Free delivery over 120 RON.
- Secrets only in env vars (see .env.example). NEVER commit keys. The repo is PUBLIC.
- Ebriza credentials are server-side only (no NEXT_PUBLIC_ prefix).
- Naming: PascalCase components, camelCase/kebab-case utilities.

## Where to look
- Plan and status: docs/PLAN.md (do ONE task per session, update the checkboxes when done)
- Ebriza API facts: .claude/skills/ebriza-api/reference.md (source of truth, do not guess)
- Procedures: skills in .claude/skills/ (ebriza-api, staff-screen, pre-push-check)

## Working style
- Plan first for changes touching more than 2 files.
- Read only the files you need; do not scan the whole repo.
- Run `npm run build` and `npm run lint` before saying a task is done.
- Keep diffs small; one commit per task with a clear message.
- If something in the docs or schema is unclear, ask instead of inventing.
EOF

# ---------------------------------------------------------------- PLAN
put docs/PLAN.md <<'EOF'
# Burgerash - Plan

Rule: one task per Claude Code session. Tick the box and commit when done.
Definition of done for every task: `npm run build` + `npm run lint` pass.

## Phase 0 - Foundations
- [ ] 0.1 Supabase cloud project exists, `supabase/schema.sql` applied, `.env.local` set
      DONE WHEN: a test order from the storefront appears in the `orders` table.
- [ ] 0.2 Vercel env vars set (Supabase keys; later Ebriza vars). No secrets in git history.
      DONE WHEN: the live site places an order into Supabase.
- [ ] 0.3 Add `.env.example` names only; confirm `.env*` is gitignored.

## Phase 1 - Ebriza adapter (works in mock mode, no credentials needed)
- [ ] 1.1 Fix `src/types/ebriza.ts` against `.claude/skills/ebriza-api/reference.md`.
- [ ] 1.2 `src/lib/ebriza.ts`: token (Basic auth, cache, refresh on 401), `EBRIZA_MOCK=true` mode,
      `EBRIZA_PATH` (1 = clientid only, 2 = app credentials).
- [ ] 1.3 Payload builder: Supabase order -> `/bills/openbillwithclient`
      (type 1002 delivery fee, 1003 cutlery, 1000 tip; modifiers via lock/isMod).
- [ ] 1.4 `src/lib/ebriza-sku-map.ts` (catalog id -> POS SKU), filled in later.
- [ ] 1.5 Call the adapter from `/api/orders` AFTER the Supabase insert; failure must never
      lose the order (store `ebriza_sync_status` + error, allow retry).
      DONE WHEN: in mock mode an order creates a fake bill and the status is saved.

## Phase 2 - Staff apps (Supabase Realtime)
- [ ] 2.1 `/kitchen` KDS, 3 columns
- [ ] 2.2 `/dispatch` packing + rider assignment
- [ ] 2.3 `/rider` mobile view
- [ ] 2.4 `/admin` stock, menu, hours

## Phase 3 - Ebriza webhooks (needs approved Marketplace app)
- [ ] 3.1 `/api/webhooks/ebriza/[secret]`: on callback, re-fetch the bill, map status to Supabase.
- [ ] 3.2 Subscribe to Order and Bill entities (`POST /webHooks/subscribe`).

## Phase 4 - Hardening before launch
- [ ] 4.1 Staff login (Supabase Auth) on /kitchen /dispatch /rider /admin
- [ ] 4.2 Replace permissive RLS with real policies
- [ ] 4.3 End-to-end test: cart -> order -> POS -> status back

## Parallel track - Ebriza (no code)
- [ ] E.1 Message Ebriza support (see questions below)
- [ ] E.2 Create developer account + Marketplace app (type Global/Location, price Free, claims: bills, items, webhooks)
- [ ] E.3 Provide Ebriza a demo/staging login for their manual review
- [ ] E.4 Venue installs the app -> get `ebriza-clientid`
- [ ] E.5 Export POS product list (names, SKUs, prices, modifiers) for SKU matching

Questions for Ebriza: which application type fits one self-delivery venue; review timeline;
is there a test/demo location; who updates statuses 100-130 with useProviderIntegration;
does an API order appear automatically on the POS tablet and who accepts it.
EOF

# ---------------------------------------------------------------- .env.example
put .env.example <<'EOF'
# Copy to .env.local (never commit .env.local). On Vercel: Project Settings -> Environment Variables.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server-only (NO NEXT_PUBLIC_ prefix):
SUPABASE_SERVICE_ROLE_KEY=
EBRIZA_MOCK=true
EBRIZA_PATH=1
EBRIZA_CLIENT_ID=
EBRIZA_APP_NAME=
EBRIZA_APP_ID=
EBRIZA_APP_SECRET=
EBRIZA_WEBHOOK_SECRET=
EOF

# ---------------------------------------------------------------- Claude Code settings
put .claude/settings.json <<'EOF'
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  }
}
EOF

# ---------------------------------------------------------------- Skill: ebriza-api
put .claude/skills/ebriza-api/SKILL.md <<'EOF'
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
EOF

put .claude/skills/ebriza-api/reference.md <<'EOF'
# Ebriza API reference (distilled from the official docs; verify against the docs if in doubt)

Base URL: https://api.ebriza.com  - HTTPS only.

## Auth
Apps are created in Ebriza Marketplace (Ebriza reviews them). You get an app ID (public key) and secret.
- Token: `POST /token` with HTTP Basic auth (user = public key, password = secret),
  `Content-Type: application/x-www-form-urlencoded`.
- Response: `access_token`, `expires_in` (seconds), `token_type: bearer`.
- Token lives 30 minutes and can be revoked: on 401, get a new one.
- Headers on calls: `Authorization: bearer <token>`, `ebriza-clientid: <location client id>`,
  `Content-Type: application/json`.
- `ebriza-clientid` = the app installed by an Ebriza account on a location (or company, for Global apps).

## Push an order (the main call)
`POST /bills/openbillwithclient` - NO token needed, only `ebriza-clientid`.
Optional header `ebriza-appname: <your app name>` -> POS shows your app name/icon (otherwise the order is
created under Ebriza's default Web Ordering app).
Body: `{ "bill": BillRequest, "client": ClientRequest }`

BillRequest (key fields):
- `items[]`: `{ sku | id, quantity, lock?, isMod?, note?, type? }`
- `externalOrderNo` (string, shown in POS) and `externalOrderID` (our ID) - send both (error 0676 if externalOrderNo is missing)
- `isForPickup` (bool), `note`, `payments[]`, `preparationTime`, `deliveryDate`
- `useProviderIntegration` (bool): for orders delivered by your OWN couriers; POS hands the order to the courier
  and closes it automatically when the fiscal receipt is printed. Delivery orders only (not pickup). Needs a real test.
- `usePreferentialPrice` (default true)
- No tableID/roomName = treated as a delivery order (needs a POS user that handles deliveries, else error 0099).
Prices come from the POS catalogue (matched by sku or id). Unmatched products: error 0104 unless the app may create items.

Modifiers: the product line and its extras share the same `lock` GUID; extras have `isMod: true`.
```
{ "sku":"brg-classic","lock":"<guid>","quantity":1 }
{ "sku":"extra-cheddar","lock":"<guid>","isMod":true,"quantity":1 }
```

System lines (name/price/sku you send are IGNORED; amounts go in quantity):
- `{ "type": 1000, "quantity": <tip amount> }`            Tips
- `{ "type": 1002, "quantity": <delivery fee amount> }`   DeliveryFee
- `{ "type": 1003, "quantity": <number of sets> }`        Cutlery
- `{ "type": 1001, "lock": "<product lock>", "quantity": n }` BottleDeposit

payments[]: `{ "type": <OrderPaymentType>, "value": <number>, "units?", "details?" }`
OrderPaymentType: 0 CashOnDelivery, 1 Cash, 2 CreditCard, 3 BankTransfer, 4 Protocol, 5 CashWithInvoiceReceipt,
6 MealTickets, 7 FiscalProtocol, 8 CashNotFiscal, 9 Other, 10 CreditCardOnDelivery

ClientRequest: `{ firstName, lastName, phone, email?, address?: { street, city, county, country, details?, isDeliveryAddress }, adressNeedsValidation? }`
(note the doc's spelling `adressNeedsValidation`). At least phone OR email is required; first+last name required together;
delivery address needs street, city, county, country.

## Other endpoints (all need token + ebriza-clientid)
- `GET /bills/get/{id}` - bill details; `GET /bills/getExternal?externalOrderID=..&externalOrderNo=..`
- `POST /bills/update` `{ id, items[] }`; `POST /bills/cancel` `{ id }`
- `GET /items?locationID=&sku=&name=&includeProducts=true` - list POS products
- `GET /orders/get/{id}`, `GET /orders?...` - closed (paid) bills
- `GET /tables`, `GET /users?pos=true` - rooms/tables, POS users
- Bills are open orders; an "order" is a paid/closed bill. A POS user must close/print.

## Webhooks
- `POST /webHooks/subscribe` `{ callbackUrl, entity }`, `POST /webHooks/unsubscribe` `{ entity }`, `GET /webHooks`
- entity: 0 Order, 1 Bill, 2 Room, 100 Invoice
- Callback body: `{ id, ebrizaClientID, entity }` only. No signature is documented.
  Subscriptions are per app + client; you are notified only for resources created by your app.

## BillStatus
0 New, 1 Error, 10 Accepted, 11 Canceled, 15 MovedOnLocation, 20 InPreparation, 21 PreparationFinished,
29 NonFiscalReceiptPrinted, 30 FiscalReceiptPrinted, 31 FiscalReceiptRePrinted, 90 PickedUp,
100 SentToFleetApp, 110 SentToFleetAppFailed, 120 InDelivery, 130 DeliveryFinished

## HTTP errors
400 validation (see code), 401 new token needed, 403 API claim not approved, 404 not found,
412 `ebriza-clientid` missing, 5xx Ebriza side.

## Error codes that matter for Burgerash
0002 required field - 0099 no delivery user - 0100 item not found (need id or sku) - 0103 new item needs name+price+vat -
0104 SKU not found and saving new items not allowed - 0105 item missing id/sku/name - 0106 item not available for this location -
0109 product VAT not set in Ebriza - 0110 need phone/email/company - 0111 first+last name required -
0114-0117 address city/country/county/street required - 0664 clientid header missing - 0665 token expired/missing -
0668 app not installed - 0669 API claim not approved by the client - 0671 app not installed on location -
0673 resource locked, retry in a few seconds - 0674 too many requests (limits in response headers) -
0675 invalid request object - 0676 missing externalOrderNo - 0101 no bill found with this id

## Open questions (confirm with Ebriza / real test)
- Does an API order appear automatically on the POS tablet; who accepts it?
- With useProviderIntegration, who updates statuses 100-130 for our own riders?
- Is there a staging/test location?
EOF

# ---------------------------------------------------------------- Skill: staff-screen
put .claude/skills/staff-screen/SKILL.md <<'EOF'
---
name: staff-screen
description: Use when building or changing the internal staff apps (/kitchen KDS, /dispatch, /rider, /admin) that read and update orders in real time through Supabase Realtime.
---

# Building a staff screen

First read `supabase/schema.sql` and `src/types/database.ts` for the REAL order status values and columns.
Do not invent statuses; if one is missing, propose a schema change and ask.

## Pattern (all four screens)
1. Page is a Client Component under `src/app/<route>/`. Load initial orders, then subscribe to
   Realtime `postgres_changes` on `orders` (and `order_items` if needed). Unsubscribe on unmount.
2. Keep state in one list keyed by order id; apply INSERT / UPDATE / DELETE events to it.
3. Status changes are explicit button taps that update Supabase (optimistic UI, roll back on error).
4. New order -> visible alert (and sound) on kitchen and dispatch.
5. Show order number (BRG-XXXX), age of the order (live timer), items with modifiers, notes, cutlery, delivery/pickup.
6. Touch-first: large targets, readable at arm's length on a tablet; /rider is phone-first.
7. Brand tokens only (#790D20, #F5E6CC, #332420; Eatvetica / Bebas Neue / Roboto Mono). No new colors.
8. Staff screens must keep working if Ebriza is down; never block on Ebriza calls in the UI.
9. Auth: leave a clear TODO guard until Supabase Auth is added (plan task 4.1). Do not ship without it.

## Screens
- /kitchen: 3 columns (new / in preparation / ready), oldest first, one tap to advance.
- /dispatch: ready orders, packing checklist (bags, sauces, cutlery), assign a rider.
- /rider: assigned orders, address + phone buttons, mark picked up / delivered.
- /admin: stock toggles, menu/price edits, opening hours.

## Before finishing
Build + lint. Test with two browser tabs: place an order in one, watch it appear in the other.
EOF

# ---------------------------------------------------------------- Skill: pre-push-check
put .claude/skills/pre-push-check/SKILL.md <<'EOF'
---
name: pre-push-check
description: Use before committing or pushing, or when asked to check, review, or ship changes. Runs build, lint, secret and RLS checks for this public repo.
---

# Pre-push check (the repo is PUBLIC)

Run in order and report a short pass/fail list:

1. `npm run build` and `npm run lint`.
2. Secrets: `git diff --staged` and `git ls-files` - fail if any of these are tracked or in the diff:
   `.env`, `.env.local`, service role keys, `EBRIZA_APP_SECRET`, bearer tokens, long random-looking strings.
   Quick check: `git ls-files | grep -E '^\.env'` must print nothing except `.env.example`.
3. Client leakage: no Ebriza or service-role variable is referenced in a file with "use client",
   and none starts with `NEXT_PUBLIC_`.
4. RLS: if `supabase/schema.sql` changed, list tables with permissive policies and say whether
   the change makes it worse. (Known debt: permissive RLS until plan task 4.2.)
5. Scope: changes match the plan task; no unrelated files; no new `/events` page.

If a secret was ever committed, say so clearly: it must be rotated, deleting the file is not enough.
EOF

# ---------------------------------------------------------------- .gitignore
touch .gitignore
for pat in ".env" ".env*.local" ".claude/settings.local.json"; do
  grep -qxF "$pat" .gitignore || { echo "$pat" >> .gitignore; echo "added to .gitignore: $pat"; }
done

echo
echo "Done. Next: git add -A && git commit -m 'Add Claude Code config' && git push"
