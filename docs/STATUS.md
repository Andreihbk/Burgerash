# Burgerash - Launch status (audit of 2026-11-19, read-only)

> **Outdated (2026-11-19).** Kept for history. Current status: `docs/PLAN.md` and `docs/AUDIT-2026-11-27.md`.

Git: branch `main`, clean, in sync with origin (HEAD ee3ae54).
Health: `npm run build` OK, `npm run lint` OK, `npm test` OK (56 tests, 9 files).
`npx tsc --noEmit` FAILS with 2 errors, both in `src/lib/ebriza-payload.test.ts` (lines 26 and 66: `subtotal`
is not in type `EbrizaPayloadOrder`). Only the test file is wrong; the build is not affected.

## Done and verified in code
- Storefront, cart, checkout, server-side pricing (client prices ignored), phone and email checks, opening hours (403 when closed).
- Ordering switch: `/api/orders` returns 503 `ordering_closed` unless `NEXT_PUBLIC_ORDERING_ENABLED` is exactly "true". The banner, cart and add buttons also read it.
- Sold-out: `/api/orders` returns 409 `sold_out` (503 if stock cannot be read); storefront shows EPUIZAT live; cart blocks checkout.
- Order saved in one transaction (`create_order`), number BRG-XXXX, secret `public_token`.
- Ebriza push runs after the response (`after()`); result saved on the order. Customer never waits for it.
- Staff pages /kitchen /dispatch /rider /admin: all four are in the `proxy.ts` matcher; no session = redirect to /staff/login (`getUser()`, fails closed).
- RLS migration: anon has no access to orders/order_items and cannot run `create_order`; staff can read orders and update only `status` and `rider_name`; nobody can delete.
- Every browser query (kitchen, dispatch, rider, admin, stock) matches those rights. The only writes are `orders.status`, `orders.rider_name`, `product_stock`.
- Secrets: no keys in the tree or in git history (searched for JWT-style and `sb_secret_` strings). Only `.env.example` is tracked. `SUPABASE_SERVICE_ROLE_KEY` and `EBRIZA_*` are read only in server-only files; no client component imports them.
- Order status page `/comanda/[token]` shows no phone, address or rider; noindex.

## Done but needs a manual test by me
1. **Order end to end (real Supabase):** set `NEXT_PUBLIC_ORDERING_ENABLED=true` on a Vercel Preview, redeploy, place a pickup order and a delivery order. Check: row in `orders` + `order_items`, BRG number, "URMĂREȘTE COMANDA" opens `/comanda/<token>`.
2. **Staff flow:** log in on /staff/login on a phone. Order appears in /kitchen with sound; move it Nou > În preparare > Gata; it shows in /dispatch; pick a rider, "Plecat la client"; open /rider as that rider, press LIVRAT; the customer page shows the new status within 20 s.
3. **Sold-out:** in /admin toggle CRISPY to epuizat. Storefront shows EPUIZAT without refresh. With a cart that already has CRISPY, checkout must be blocked. Toggle back.
4. **RLS after the stock migration:** the anon curl tests were done 2026-11-19 for orders. Repeat once after running `20261121000000_product_stock.sql`: with the anon key, `GET /rest/v1/orders` must return `[]`/401, `PATCH /rest/v1/product_stock` must fail, `GET product_stock` must work.
5. **Closed hours:** order outside hours returns the "closed" message.
6. **Ordering switch OFF** on Production: the site shows the banner and a direct POST to `/api/orders` returns 503.
7. **Ebriza in mock mode:** with `EBRIZA_MOCK=true` the order's `ebriza_sync_status` becomes `sent`.

## LAUNCH BLOCKERS (must fix before real customers), most important first
1. **Payment choice is missing.** The checkout has no payment selector: every order is saved as `card_on_delivery` (`CartDrawer.tsx` line 45), even for pickup, and there is no cash option. Decide with the owner what is offered, then add the selector. Online card payment is not built (no payment provider in the code).
2. **No legal pages (L.5):** terms, GDPR privacy, ANPC links, company details. Required in Romania when you collect names, phones and addresses.
3. **Allergens missing (L.1):** CRISPY, CRISPY BACON, Chips, Nuggets show "întreabă-ne"; the other four need a re-check against the new menu board. Get the real list from the owner.
4. **Real contact details not set:** `CONTACT.phone` and `CONTACT.address` in `src/lib/hours.ts` are `null`, so the site shows no phone number or address and the JSON-LD has none.
5. **Rider names are placeholders** ("Rider 1", "Rider 2" in `src/lib/riders.ts`). Put the real names in.
6. **Orders do not reach the POS.** `ebriza-sku-map.ts` has no SKUs and there are no Ebriza credentials, so every real order ends with sync `failed` (0104). Kitchen/dispatch still work. Either fill the map and credentials (L.2, E.1-E.5) or launch knowingly with the POS side done by hand.
7. **No delivery zone check (L.4):** any address is accepted for delivery.
8. **No rate limit or bot check on `/api/orders`:** anyone can post fake orders in a loop. A basic limit or captcha is advisable before the switch goes to `true`.
9. **No alert for failed Ebriza syncs and no retry button** (data is stored; the action is not built). Someone must look at failed orders in Supabase.
10. **Supabase Auth settings:** "staff = any logged-in user" is safe only with sign-ups AND anonymous sign-ins OFF. Confirm both are off (see the checklist).

## Manual steps outside the code
- [ ] Supabase: all 4 migrations in `supabase/migrations` have been run, in order (sync columns, public token, staff RLS, product stock). Do NOT re-run `schema.sql` on the live DB: it re-creates the open "Public access" policies.
- [ ] Supabase Auth: sign-ups OFF, anonymous sign-ins OFF, staff users created, one test login per staff role.
- [ ] Supabase Realtime: `orders` and `product_stock` are in the `supabase_realtime` publication.
- [ ] Vercel (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (not public), `NEXT_PUBLIC_SITE_URL` (optional, defaults to https://www.burgerash.ro), `NEXT_PUBLIC_ORDERING_ENABLED`. Remove old `STAFF_PASSWORD`. Redeploy after changing any `NEXT_PUBLIC_` value.
- [ ] Domain www.burgerash.ro points to Vercel; HTTPS works.
- [ ] Ebriza: E.1-E.5 (support message, Marketplace app, demo login, install, product export); then set `EBRIZA_*` and fill the SKU map.
- [ ] Owner: allergens, phone, address, rider names, payment methods, delivery zone, company/legal details.
- [ ] Last step: set `NEXT_PUBLIC_ORDERING_ENABLED=true` in Production and redeploy.

## Can wait until after launch
- 2.5 admin price/menu/hours edits; Phase 3 Ebriza webhooks; 4.3 full POS round-trip test; L.6 cart upsell.
- Customer emails (email is stored, none are sent). Online card payment.
- Fix the 2 `tsc` errors in the test file; add `tsc --noEmit` to the pre-push check.
- Remove old unused `public/images/menu/*.png` (chapo, chicken, dirty, veggie...) and unused font files `src/fonts/eatvetica*.otf`.

## Known issues
- `EBRIZA_WEBHOOK_SECRET` is in `.env.example` but no code reads it (webhooks not built).
- `NEXT_PUBLIC_ORDERING_ENABLED` and `NEXT_PUBLIC_SITE_URL` are read by the code but missing from `.env.example`. `EBRIZA_*` vars are server-only and correctly not public.
- The demo font files `src/fonts/eatvetica.otf` and `EatveticaRoundedDemo-*.otf` are in the PUBLIC repo but not used by the code. Eatvetica is not licensed: remove them (they stay in git history).
- PLAN.md has duplicate IDs (L.1, L.2 appear twice with different meanings) and stale items: L.0b is still `[ ]` but its note says done; L.3 (docs/brand history) vs the ticked "order status page" L.3; L.1 "opening hours" is ticked and L.1 "allergens" is not.
- Old photos with possible GPS data remain in git history (PLAN L.3).
- `/comanda/[token]` and other pages use the CSS class `font-bebas`; it now maps to Nunito 900 on purpose (see globals.css).
- Rider screen filters by name only in the browser; any logged-in staff user can read all orders (accepted design).
- Env vars read by the code (names only): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (supabase.ts, proxy.ts, staff login route, supabase-admin.ts); SUPABASE_SERVICE_ROLE_KEY (supabase-admin.ts); EBRIZA_MOCK, EBRIZA_PATH, EBRIZA_CLIENT_ID, EBRIZA_APP_ID, EBRIZA_APP_SECRET, EBRIZA_APP_NAME (ebriza.ts); NEXT_PUBLIC_ORDERING_ENABLED (ordering.ts); NEXT_PUBLIC_SITE_URL (site.ts); NODE_ENV (useStorefrontStatus.ts).
