# Ebriza integration plan

Status (2026-11-19): part 1 BUILT: C1 (as `EBRIZA_BASE_URL`), C2 (SKU map), C4a (SGR behind `EBRIZA_SEND_SGR`, off),
C7 (4 webhook routes + migration `20261123000000_ebriza_webhooks.sql`). Owner decisions taken: the POS status DRIVES our order
status (forward-only, cancel included), not only stored; SGR flagged for all 4 drinks but not sent/charged yet.
Webhook routes live at `/api/ebriza/<S>/<hook>` (not `/api/webhooks/ebriza/...` as drafted below); the hook names are
`change-status`, `sync-products`, `start-accepting-orders`, `set-item-unavailable`.

Sources
- **API ref** = official Ebriza API reference (https://ebriza.com/app/public/docs). It renders client-side, so a local copy is kept in `docs/vendor/ebriza-api-reference.md`. That folder is **gitignored**: never commit it. Sections below are cited by name, e.g. `[API ref: Open bill with client]`.
- **Help article** = https://help.ebriza.com/ro/articles/5658844-integrate-external-providers-with-ebriza (public). It is the source for stage/live and the 4 webhooks.
- The separate integration guide is not saved locally yet; the webhook and stage facts below come from the Help article.
- Tags: **CONFIRMED** (stated in a source), **NOT DOCUMENTED** (not in any source we have, listed in section 6 as a question for dev@ebriza.com), **TEST** (check on the stage environment).

## 1. Verified facts

### 1.1 Which call for card-paid (Netopia) orders
Three ways to create an order exist [API ref: Open bill with client / Open a paid bill / Push a paid order]:

| | `POST /bills/openbillwithclient` | `POST /bills/openpaid` | `POST /orders/push` |
|---|---|---|---|
| Auth | only `ebriza-clientid` (+ optional `ebriza-appname`), **no token** | token + clientid | token + clientid |
| Result | open **bill**; no table/room = delivery bill; "all other devices/users are notified" | "paid bill", same body as open bill; no table/room = delivery | **completed order** "already paid outside Ebriza (e.g. an online shop)" |
| Client | `client` object found or created in the same call | needs an existing `clientID` (no `client` object documented) | `client` or `clientID` |
| Kitchen / delivery flow in POS | **yes**, it is a normal open bill (the app's own example is a delivery bill with `useProviderIntegration`) | NOT DOCUMENTED what "paid" changes (KDS? receipt?) | **no**: the order is already closed |
| Payments | `payments[]` accepted; "values can be manually changed by the employee before printing the receipt" | same | `payments[]`, may cover part of the total (then Pending); omitted = one bank transfer for the full total |
| Stock | deducted when the receipt/order is closed in POS (standard bill flow, TEST) | NOT DOCUMENTED | deducted only when you issue the invoice (`/orders/invoice`) |

**Recommendation: keep `openbillwithclient` for ALL orders, with `payments: [{ type: 2 (CreditCard), value: total }]` for Netopia orders.**
- It is what the code already does (`ebriza-payload.ts`: `online_card` -> `CreditCard`, `card_on_delivery` -> `CreditCardOnDelivery`, `cash_on_delivery` -> `CashOnDelivery`).
- `/orders/push` is wrong for us: it skips the POS kitchen/delivery flow, which is the point of the integration.
- `/bills/openpaid` adds a token, no client object, and unknown behaviour for no gain. Ask Ebriza what it does (Q3) but do not plan on it.
- Remaining TEST items: does a bill with a CreditCard payment pre-fill the payment at the POS so the cashier only prints the fiscal receipt (Q2)? Does `value` have to equal the bill total, including delivery fee and tip (Q4)?

### 1.2 Environments
- CONFIRMED [Help article]: stage `https://stageapi.ebriza.com`, live `https://api.ebriza.com`. **Different credentials.** Stage keys appear under the app after install; installing generates the location's Client ID. Ebriza creates the app on stage first, then live; until acceptance testing passes the app stays private.
- CONFIRMED [Help article]: webhook URL pairs (stage + live) are **sent by email to dev@ebriza.com**; they are not self-service. The API-based subscription (`/webHooks/subscribe`, see 1.6) is a separate, documented mechanism.
- Acceptance scenarios (Help article): menu sync, order push (modifiers, discounts, SGR deposit, tips, delivery fee, scheduled orders), a callback for each status, StartAcceptingOrdersUrl, SetItemUnavailableUrl.

### 1.3 Matching products (SKU) and prices
- CONFIRMED [API ref: Open bill request examples, BillItem, Items]: a line with `sku` and no `id` is looked up by SKU. Product `sku` "is unique".
- CONFIRMED: if the SKU is not found and the line carries a `name`, Ebriza falls back to a **match by name** and then **adds our SKU to that existing product** ("this way you can have the same product matched by different providers"). If nothing matches and the app may save new items it **creates** the product (needs name, price, VAT).
  - We send SKU only, never `name`, and the app must not be allowed to create items. Then an unknown SKU is error `0104` and nothing is invented. This matches the current builder.
- CONFIRMED: prices come from the POS catalogue, not from our payload. `usePreferentialPrice` (default true) bills matched products at the **preferential price configured for this app/provider, when one exists**. So the POS price for each SKU must equal our menu-board price, and no preferential price should be configured for the Burgerash app unless intended (Q5).
- CONFIRMED: line `price` is only used for products that are created or for promotion lines.
- Items can carry EU `allergens` in Ebriza (`Allergen` enum, items add/update). Useful later for the allergens blocker in PLAN.md; not needed for this task.

### 1.4 Modifiers, SGR, system lines
- CONFIRMED: a product line and its extras share one `lock` GUID; extras have `isMod: true`; the parent is the line with the same lock and `isMod: false`. Modifiers are matched by SKU like products. [API ref: modifiers example, BillItem]
- NOT DOCUMENTED: quantity semantics for a modifier on a product with quantity > 1. The docs only show quantity 1. Current code sends `mod.quantity = product quantity`. TEST (Q6).
- CONFIRMED: `note` per line "appears on the KDS". We could use it for "Fără ..." instead of 0-price modifiers (decision: keep SKU modifiers, they are structured; use `note` only for the customer's free text, as now).
- CONFIRMED SGR: `{ "type": 1001, "lock": "<same lock as the bottle product>", "quantity": n }`. Amount and VAT are resolved from the account's **system products**; SKU/name/price we send are ignored. Example: 2 bottles -> product quantity 2 + deposit quantity 2. [API ref: "open a bill with a returnable bottle and its SGR deposit"]
  - **Gap:** the current builder never sends type 1001. Our drinks (Coca-Cola, Fanta, Sprite 330ml, Water 500ml) are packaged drinks. Whether each needs a deposit, who sets its amount, and whether the website shows/charges it are **owner/accountant decisions** (B-list), then a payload change (section 2).
- CONFIRMED system lines (already used): Tips `1000` (amount in quantity), DeliveryFee `1002` (fee amount in quantity), Cutlery `1003` (number of sets in quantity). System lines are added to the total **after** discounts.
- Discounts exist (`promotionType`, `parentID`, `promotionItems`). We have none today; not planned.

### 1.5 `useProviderIntegration`, BillStatus
- CONFIRMED: `useProviderIntegration: true` is for orders **delivered by your own couriers**: "the POS then hands the order to your courier and closes it automatically when the fiscal receipt is printed" (same as Wolt/Bolt). Only for delivery orders (no table/tab) that are not pickup; ignored otherwise. Leave false when the restaurant delivers with its own staff or for pickup.
- Burgerash uses its own riders but they use **our** `/rider` app, not an Ebriza fleet app. NOT DOCUMENTED: what "hands the order to your courier" means when we have no fleet app registered, and who sets statuses 100-130 (Q7). **Decision: send `false` (omit) until Ebriza answers; revisit during stage TEST.**
- CONFIRMED BillStatus (also in `reference.md`): 0 New, 1 Error, 10 Accepted, 11 Canceled, 15 MovedOnLocation, 20 InPreparation, 21 PreparationFinished, 29 NonFiscalReceiptPrinted, 30 FiscalReceiptPrinted, 31 FiscalReceiptRePrinted, 90 PickedUp, 100 SentToFleetApp, 110 SentToFleetAppFailed, 120 InDelivery, 130 DeliveryFinished.
- CONFIRMED [Help article]: `ChangeStatusUrl` is called for 10, 11, 20, 21, 29, 30, 90, 120, 130 and only for orders our app sent. Statuses 0, 1, 15, 31, 100, 110 are in the enum but not listed as callbacks.
- CONFIRMED: `GET /bills/get/{id}` and `/bills/getExternal` return `billstatusHistory` (status, timestamp, appName). So a status can be **verified by reading it back** (needs the token, i.e. `EBRIZA_PATH=2`).

### 1.6 Webhooks
Two mechanisms appear in the sources; how they relate is Q8.
1. **API subscription** [API ref: WebHooks]: `POST /webHooks/subscribe {callbackUrl, entity}`, `/webHooks/unsubscribe`, `GET /webHooks`. Entities: 0 Order, 1 Bill, 2 Room, 100 Invoice. Per AppID + ClientID; you are notified only for resources your app created. Callback body (`WebHookCallback`): `{ id, ebrizaClientID, entity }`. **No signature, secret or header is documented.**
2. **The 4 app webhooks** [Help article], registered with Ebriza by email:
   - `ChangeStatusUrl`: order status changes (list in 1.5).
   - `SyncProductsUrl`: called when the client pushes the menu; sends name, price, VAT, image, description, modifiers, items, categories.
   - `StartAcceptingOrdersUrl`: client pauses/resumes orders from our provider in the POS ("restaurant snooze").
   - `SetItemUnavailableUrl`: client snoozes a product; the snooze lasts until the next day at the start of the schedule.
   - **NOT DOCUMENTED for any of them: payload format, HTTP method, authentication/signature, retries, expected response.** There is also no documented "item available again" or per-status payload. All in section 6.

### 1.7 Stock
- CONFIRMED: stock can be **read** (`GET /stocks/{key?}` list product stocks with `sku`, `quantity`, `mu`, `unitQuantity`, `vat`, recipe `stockItems`; `GET /stocks/get/{id}/{locationID}`). [API ref: Stocks]
- These are **inventory (ingredient) stocks**, not "is this menu item sellable". NOT DOCUMENTED: how a stock maps to a sellable item, whether a recipe-based product reports a quantity, whether snoozed items are visible in `GET /items` (the only availability flag in the API is `inactive` on `/items/update`). Q9.
- Consequence: the **only documented signal that a product is unavailable is the SetItemUnavailableUrl webhook**. Do not poll stock for sold-out state.

## 2. What must change in the code (exact list, nothing built yet)

| # | File | Change | Source |
|---|---|---|---|
| C1 | `src/lib/ebriza.ts:15` | `BASE_URL` is a hardcoded constant and is also used by `getToken` (`:80`) and `ebrizaRequest` (`:183`). Make it come from `EBRIZA_ENV` (`stage` -> `https://stageapi.ebriza.com`, `live` -> `https://api.ebriza.com`); only these two values are accepted. Outside mock mode, a missing/unknown `EBRIZA_ENV` must fail loudly, **never default to live**. Log the env on startup/first call. | 1.2 |
| C2 | `src/lib/ebriza-sku-map.ts` | All 20 entries are `null` (task E.5). Fill with section 5b. This file is the only SKU source of truth (its header says so). | 5b |
| C3 | `src/lib/catalog.ts` | Still carries `ebriza_sku` for 10 of 14 products (and modifiers have their own), a second source that can drift from the map. Decide: drop the catalog field or add a test that both agree. 4 products are `null` there today (listed in section 5b). | 5b |
| C4 | `src/lib/ebriza-payload.ts` | (a) SGR: add `{type: 1001, lock, quantity}` per deposit-bearing drink line once decided. (b) Modifier quantity after TEST (Q6). (c) `useProviderIntegration` stays omitted; add only if Q7 says yes (env switch `EBRIZA_USE_PROVIDER_INTEGRATION`, delivery orders only). (d) Consider explicit `usePreferentialPrice` after Q5. (e) `adressNeedsValidation`: the docs' examples always send `true`; we omit it. NOT DOCUMENTED what it does (Q10). | 1.3-1.5 |
| C5 | `src/lib/pricing.ts` | If SGR deposits are charged, server-side pricing must include them so that `payments[0].value` equals the POS bill total (Q4). | 1.4 |
| C6 | `src/lib/ebriza-sync.ts` | No change for the push itself. Add retry/reconcile later via `getBillByExternal` (needs token). | 1.5 |
| C7 | new | Webhook routes + `product_stock` columns (section 3). | 1.6 |
| C8 | `.claude/skills/ebriza-api/reference.md` | Updated in this task (stage URL, paid-order calls, stock, 4 webhooks, name matching, preferential price). | all |

Already correct and **unchanged**: no `name` sent (no accidental product creation), SKU-only lines, shared `lock` + `isMod`, `externalOrderID` = our order id and `externalOrderNo` = BRG-XXXX (error 0676 if missing), delivery fee omitted for pickup, tip and cutlery as system lines, client split into first/last name, address required for delivery, token only when `EBRIZA_PATH=2`, 8s timeout, 401 refresh-once, never throws, order kept if Ebriza fails.

## 3. Proposal: webhook routes (4a)

Principles: Ebriza is an **additive** layer. Staff apps (kitchen/dispatch/rider) must never depend on a webhook arriving. Every route returns 200 fast, uses `supabaseAdmin` server-side, is idempotent, and logs with `redact()`. Payload parsing stays defensive until Q1 is answered; unknown shapes return 200 + a logged warning (so Ebriza does not disable the webhook) except bad auth (401).

| Route | Ebriza hook | Effect |
|---|---|---|
| `POST /api/webhooks/ebriza/item-unavailable` | SetItemUnavailableUrl | Map the SKU (or Ebriza item id) to our catalog id with the **reverse of `EBRIZA_SKU_MAP`**, then upsert `product_stock` (`sold_out = true`). Realtime already pushes `product_stock` to the storefront. Unknown SKUs are logged, not stored. |
| `POST /api/webhooks/ebriza/change-status` | ChangeStatusUrl | Find our order by `externalOrderID`, store `ebriza_status` + timestamp (new column or history table). **Do not** drive kitchen/rider status from it by default; one exception to decide with the owner: `11 Canceled` -> flag the order for staff attention. Verify by reading the bill back (`GET /bills/get/{id}`) before trusting a cancel. |
| `POST /api/webhooks/ebriza/start-accepting-orders` | StartAcceptingOrdersUrl | Set a store-wide "accepting orders" flag; the storefront and `/api/orders` refuse new orders with a clear message while paused. Needs a small settings table or reuse of any existing open/closed switch (none found in `schema.sql`; check PLAN.md L-tasks before adding). |
| `POST /api/webhooks/ebriza/sync-products` | SyncProductsUrl | **Accept and ack only, log a summary.** The physical menu board / `catalog.ts` stays the source of truth (CLAUDE.md); Ebriza menu pushes must not overwrite names, prices or descriptions. Optional later: a diff report in admin. Ask whether we must implement it at all for an own-site app (Q11). |
| `POST /api/webhooks/ebriza/entity` | API subscription (entity 0/1) | Only if Q8 says the API subscription is needed: body `{id, ebrizaClientID, entity}` -> re-read the bill/order with the token and update `ebriza_status`. |

**"Available again".** Not documented. The snooze "lasts until the next day at the start of the schedule", so Ebriza may never send a counter-event. Proposal: add to `product_stock` `sold_out_source text` (`'manual'` | `'ebriza'`) and `snoozed_until timestamptz`. A POS snooze sets `snoozed_until` = next opening time (start-of-schedule value from Q12 / `EBRIZA_SNOOZE_RESET_HOUR`); the storefront treats expired rows as available; a manual admin sold-out is never auto-cleared by Ebriza. If Ebriza does send an "available" event it just clears the `'ebriza'` row.

**Verifying the caller.** Nothing is documented (no signature, no secret header, no IP list). Layered plan, strongest first:
1. Ask Ebriza (Q13) for a custom header or HMAC. If yes, use it with constant-time comparison.
2. Until then: an unguessable secret **in the callback URL path** (`/api/webhooks/ebriza/<EBRIZA_WEBHOOK_SECRET>/item-unavailable` via a dynamic segment), different per environment, compared with `timingSafeEqual`, wrong secret -> 401 with no detail, never logged. Rotate by emailing Ebriza the new URL (accept `EBRIZA_WEBHOOK_SECRET_PREVIOUS` during the switch). The repo is public, so the secret lives only in env vars.
3. Treat the payload as an untrusted **hint**: for status/cancel, confirm by calling Ebriza (`/bills/get`); for item-unavailable, the worst case of a forged call is a product shown as sold out, which is low impact and auto-expires.
4. Validate `ebrizaClientID` (if present) equals `EBRIZA_CLIENT_ID`; cap body size; rate-limit per IP (reuse the pre-launch rate-limit task).
5. Only the Ebriza-provided IPs would allow an allowlist: ask in Q13.

## 4. Environments and callback URLs (4b)

**Facts:** Ebriza registers webhook URLs per environment, by email. Vercel preview deployments here have no env vars and their URL changes on every deploy, so a preview cannot be a registered callback or call Ebriza stage.

**Recommended setup**
- **Stage = a second Vercel project** (`burgerash-stage`) connected to the same repo, deploying from a long-lived `stage` branch. In that project, set the env vars as its *Production* variables (so it behaves like a normal deployment), with a **stable** domain, e.g. `stage.<your-domain>` (or the project's `burgerash-stage.vercel.app` alias).
- Stage uses **its own Supabase project** (own URL/keys), the Ebriza **stage** credentials and Client ID, `EBRIZA_ENV=stage`, and (if payments are tested) Netopia sandbox. Never point stage at the live Supabase or live Ebriza: it would send test orders to the real kitchen.
- **Live** = the existing production project with `EBRIZA_ENV=live` and live credentials, only after Ebriza accepts the app.
- Flow: feature branch -> merge to `stage` -> test with Ebriza stage -> merge to `main` -> live.
- Fallback without a second project: Vercel Preview-scoped env vars plus a fixed branch domain. Not recommended here because previews currently have no variables.

**Callback URLs to send to dev@ebriza.com** (host placeholders; `<S>` = `EBRIZA_WEBHOOK_SECRET` of that environment):

| Hook | STAGE | LIVE |
|---|---|---|
| ChangeStatusUrl | `https://<stage-host>/api/webhooks/ebriza/<S>/change-status` | `https://<live-host>/api/webhooks/ebriza/<S>/change-status` |
| SyncProductsUrl | `https://<stage-host>/api/webhooks/ebriza/<S>/sync-products` | `https://<live-host>/api/webhooks/ebriza/<S>/sync-products` |
| StartAcceptingOrdersUrl | `https://<stage-host>/api/webhooks/ebriza/<S>/start-accepting-orders` | `https://<live-host>/api/webhooks/ebriza/<S>/start-accepting-orders` |
| SetItemUnavailableUrl | `https://<stage-host>/api/webhooks/ebriza/<S>/item-unavailable` | `https://<live-host>/api/webhooks/ebriza/<S>/item-unavailable` |

HTTPS only (the API itself is HTTPS-only). Do not paste the real secrets into the repo or into chat; generate them (32+ random bytes) and email them only to Ebriza.

## 5. Env vars (4c), names only, server-side only (no `NEXT_PUBLIC_`)

Already used by `src/lib/ebriza.ts`: `EBRIZA_MOCK`, `EBRIZA_PATH`, `EBRIZA_CLIENT_ID`, `EBRIZA_APP_ID`, `EBRIZA_APP_SECRET`, `EBRIZA_APP_NAME`.

New:
- `EBRIZA_BASE_URL` (built instead of `EBRIZA_ENV`: `https://stageapi.ebriza.com` or `https://api.ebriza.com`; unset = stage outside production, error in production)
- `EBRIZA_SEND_SGR` (optional; `true` adds type 1001 deposit lines for the drinks)
- `EBRIZA_WEBHOOK_SECRET`
- `EBRIZA_WEBHOOK_SECRET_PREVIOUS` (optional, only during rotation)
- `EBRIZA_USE_PROVIDER_INTEGRATION` (optional; stays unset/false until Q7)
- `EBRIZA_SNOOZE_RESET_HOUR` (optional; only if Q12 shows no "available" event)

Each Vercel project (stage, live) gets its own values for all of them. Production must use `EBRIZA_PATH=2` if we want the read-backs in section 3 (`EBRIZA_APP_ID` + `EBRIZA_APP_SECRET` then required).

## 5b. SKU list for the Ebriza nomenclator (4d)

Rules: lowercase, hyphenated, unique, ASCII, stable once in use (SKU matching is the contract). Prefixes follow what already exists in `catalog.ts` (`brg-`, `chk-`, `side-`, `drink-`, `mod-`). "Existing" = already in `catalog.ts`; **PROPOSED** = currently `null` in the catalog (the 4 null SKUs; fine to leave `null` in `catalog.ts` for now, but they must exist in the POS and the map before any order containing them can be pushed). Names in the POS should be the menu-board names. Prices and weights must equal the POS so receipts match the website (price is read from the POS, section 1.3).

### Products
| Catalog id | Product (name on stickers) | SKU | Status | Price RON | Category |
|---|---|---|---|---|---|
| prod-classic | CLASIC | `brg-classic` | existing | 36 | BURGERS |
| prod-hot-boy | HOT BOY | `brg-hot-boy` | existing | 39 | BURGERS |
| prod-double | DOUBLE | `brg-double` | existing | 46 | BURGERS |
| prod-crispy | CRISPY | `chk-crispy` | **PROPOSED (null today)** | 38 | CHICKEN |
| prod-hot-honey | HOT HONEY | `chk-hot-honey` | existing | 38 | CHICKEN |
| prod-crispy-bacon | CRISPY BACON | `chk-crispy-bacon` | **PROPOSED (null today)** | 42 | CHICKEN |
| prod-fries | Fries | `side-fries` | existing | 13 | SIDES & SAUCES |
| prod-chips | Chips | `side-chips` | **PROPOSED (null today)** | 13 | SIDES & SAUCES |
| prod-nuggets | Nuggets (6 buc) | `side-nuggets` | **PROPOSED (null today)** | 27 | SIDES & SAUCES |
| prod-sauces | Sauces | `side-sauce` | existing | 5 | SIDES & SAUCES |
| prod-cola | Coca-Cola 330ml | `drink-cola` | existing | 10 | DRINKS |
| prod-fanta | Fanta 330ml | `drink-fanta` | existing | 10 | DRINKS |
| prod-sprite | Sprite 330ml | `drink-sprite` | existing | 10 | DRINKS |
| prod-water | Water 500ml | `drink-water` | existing | 8 | DRINKS |

### Modifiers (create in the POS as modifier items; sent with `isMod: true`)
| Catalog id | Modifier | SKU | Status | Price RON |
|---|---|---|---|---|
| mod-extra-patty | Extra Chiftea | `mod-extra-patty` | existing | 12 |
| mod-extra-cheddar | Extra American Cheddar | `mod-extra-cheddar` | existing | 5 |
| mod-extra-bacon | Extra Crispy Bacon | `mod-extra-bacon` | existing | 6 |
| mod-extra-jalapeno | Extra Jalapeño | `mod-extra-jalapeno` | existing | 4 |
| mod-no-onion | Fără Ceapă | `mod-fara-ceapa` | existing | 0 |
| mod-no-pickles | Fără Castraveți Murați | `mod-fara-muraturi` | existing | 0 |

Notes
- 20 SKUs total: 14 products, 6 modifiers. Sauces are one SKU (the customer's sauce choice is not modelled; if each sauce needs its own SKU/stock, split into `side-sauce-signature`, `side-sauce-garlic`, `side-sauce-chipotle`: owner decision).
- Existing SKUs were kept to avoid renaming data already referenced in `catalog.ts`. `mod-fara-*` do not follow the Romanian-free pattern of the others, but renaming buys nothing.
- In the POS these must be the **provider SKU** (not only the internal one); entering our SKU on the product is what makes `sku` lookups succeed.
- System lines (tips, delivery fee, cutlery, bottle deposit) need **no SKU**; they resolve to the account's system products. Check those system products exist and have the right VAT in the Ebriza account (error `0109` if VAT is unset).
- Error `0106` ("item found but not available for this location") means a product exists but is not enabled for the location: tick every SKU for the Burgerash location.

## 6. Questions for dev@ebriza.com (not answerable from the docs)

Webhook basics
1. **Payload, method and response** for ChangeStatusUrl, SyncProductsUrl, StartAcceptingOrdersUrl and SetItemUnavailableUrl (a sample JSON for each; which field identifies the product: SKU, id or both; which identifies the order: `externalOrderID`, `externalOrderNo`, bill id). What response/status code do you expect, and what is the retry policy on non-2xx or timeout?
8. How do the 4 URL-based hooks relate to `POST /webHooks/subscribe` (entities Order/Bill/Room/Invoice)? Do we need both, one, or only the URL-based ones for status?
12. SetItemUnavailableUrl: is there an **"available again" event**, or only the snooze with an implicit end "next day at the start of the schedule"? What exactly is that time, per location? Is the snooze visible through the API (`GET /items`)?
13. **Caller verification:** do webhooks carry a signature, a shared-secret header, or come from fixed IPs? Can we register a custom header value or a secret in the callback URL?

Orders and payment
2. For `openbillwithclient` with `payments: [{type: 2 CreditCard, value}]` on an unpaid-at-POS bill: does the POS show it as paid so the cashier only prints the fiscal receipt? Does the receipt print automatically?
3. `POST /bills/openpaid`: what exactly does "paid" change versus `openbillwithclient` (KDS ticket, receipt, delivery room, stock)? Does it accept a `client` object?
4. Must `payments[].value` equal the bill total (products + SGR + delivery fee + tip + cutlery)? What happens on mismatch?
5. Is `usePreferentialPrice` safe to leave at the default if we configure no preferential price? Where is a preferential price set (per app)?
6. Modifier `quantity` on a product line with quantity 2: per product or total?
7. `useProviderIntegration` with our own riders and no Ebriza fleet app: what does "hands the order to your courier" do? Who sets statuses 100-130? Does omitting it leave the order for POS staff to dispatch?
10. What does `adressNeedsValidation` do (the examples send `true`)? Does a failed validation reject the order?
11. Must an app that only pushes orders (own website) implement SyncProductsUrl for acceptance, or only ChangeStatus + SetItemUnavailable + StartAcceptingOrders?
14. Is an order pushed to the stage API visible in a stage POS we can test with? Do we get a stage test location/tablet? How is acceptance testing scheduled?

Stock and products
9. Can the API tell us if a menu item is sellable/snoozed? How do `GET /stocks` entries relate to menu items (recipes)? Do stocks reach 0 trigger an automatic snooze/webhook?
15. SGR: if the product is flagged returnable in the POS, does the POS add the deposit itself, or must we always send a `type 1001` line? What is the deposit amount per bottle and where is it configured?

Rate limits: error `0674` says limits are "in the header"; ask for the actual numbers for push and token calls.

## 7. Owner decisions needed before building
- SGR deposits: charged on the website, and on which drinks? (changes pricing and the payload)
- Sauces: one SKU or three?
- On POS cancel (status 11): flag the order for staff only, or cancel it in Burgerash?
- Stage domain name and a second Vercel + Supabase project for stage.
- Who emails dev@ebriza.com (stage and live webhook URLs, Q1-Q15).

## 8. Suggested build order (separate sessions, one task each)
1. E.5 fill `ebriza-sku-map.ts`, decide C3 (Sonnet).
2. C1 configurable base URL + `EBRIZA_ENV` (Sonnet, small).
3. Stage environment: second Vercel + Supabase project, `stage` branch (owner + Sonnet).
4. Stage test of `openbillwithclient` (TEST items Q2, Q4, Q6) and update this doc.
5. `item-unavailable` route + `product_stock` columns + auth (Opus: security).
6. `change-status` and `start-accepting-orders` routes.
7. SGR payload + pricing, after the owner decision.
