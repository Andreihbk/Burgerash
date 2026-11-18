# Burgerash - Plan

Rule: one task per Claude Code session. Tick the box and commit when done.
Definition of done for every task: `npm run build` + `npm run lint` pass.

## Phase 0 - Foundations
- [x] 0.0 Fix order pipeline
      - Build fix (BurgerStamp null text).
      - `order_items.product_id` is text (catalog id); name, unit price, SKU kept as snapshots.
      - Schema moved to `supabase/schema.sql`; `.env.example` tracked via `!.env.example`.
      - `/api/orders` recalculates prices, modifiers, subtotal, delivery fee, total from `catalog.ts`
        (`src/lib/pricing.ts`); client prices ignored.
      - Order numbers BRG-XXXX from Postgres sequence `order_number_seq`.
      - Order + items saved in one transaction via `create_order` rpc; error returned on failure.
      - `updated_at` trigger on `orders`. Removed `files.txt`, `setup-claude-config.sh`.
- [x] 0.1 Supabase cloud project exists, `supabase/schema.sql` applied, `.env.local` set
      DONE WHEN: a test order from the storefront appears in the `orders` table.
- [ ] 0.2 Vercel env vars set (Supabase keys; later Ebriza vars). No secrets in git history.
      DONE WHEN: the live site places an order into Supabase.
- [ ] 0.3 Add `.env.example` names only; confirm `.env*` is gitignored.

## Storefront
- [x] S.1 Rename DUBLE to DOUBLE (catalog, sticker, menu board); other names unchanged.
- [x] S.2 Hero: video removed (file deleted); stack of 3 rotated stickers (CLASIC, HOT BOY, DOUBLE)
      with hard shadow, sized for 375px.
- [x] S.3 Header: real SVG logo (burger icon + lowercase "burgerash", as on the menu board).
- [x] S.4 Menu: all categories shown as sections with headings; sticky category bar ("TOT MENIUL"
      first) scrolls to each section and highlights the current one.
- [x] S.5 Cart: adding does not open the drawer; toast "Adăugat în coș" + "Vezi coșul", badge
      animation; mobile (<768px) sticky bottom bar "COȘ (n) · total LEI →" opens the drawer.
- [x] C.1 Checkout polish: RO phone validation (client inline + server, normalized to 07xxxxxxxx),
      autocomplete attrs, total on submit button, new error/confirmation copy (no POS mention).
- [x] S.6 /font-test removed (did not exist).

## Phase 1 - Ebriza adapter (works in mock mode, no credentials needed)
- [x] 1.1 Fix `src/types/ebriza.ts` against `.claude/skills/ebriza-api/reference.md`.
      Const objects instead of enums; undocumented fields removed; error codes + result types.
- [x] 1.2 `src/lib/ebriza.ts`: token (Basic auth, cache, refresh on 401), `EBRIZA_MOCK=true` mode,
      `EBRIZA_PATH` (1 = clientid only, 2 = app credentials).
      8s timeout, never throws (returns `EbrizaResult`), phone numbers redacted in logs.
      Tests: `npm test` (vitest, `src/lib/ebriza.test.ts`).
- [x] 1.3 Payload builder: Supabase order -> `/bills/openbillwithclient`
      (type 1002 delivery fee, 1003 cutlery, 1000 tip; modifiers via lock/isMod).
      `src/lib/ebriza-payload.ts` (pure) + tests. Missing SKU throws `EbrizaPayloadError` 0104.
      Defaults: name split first word / rest (single word -> both); address street = full string,
      city/county București, country România; one payment = total (cash 0, card on delivery 10,
      online 2).
      Open questions for the real Ebriza test:
      - Modifier quantity: we send product quantity (2x CLASIC + cheddar -> cheddar qty 2).
        Confirm Ebriza does not multiply it again.
      - openbillwithclient response shape is undocumented: we read `id` as bill id if present
        (else null) and keep the raw response. Confirm the real field.
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

## Before launch
- [ ] L.1 Opening hours + open/closed badge (block or warn on orders when closed)
- [ ] L.2 Allergens per product (shown on cards / product detail)
- [ ] L.3 Order status page via secret link
- [ ] L.4 Delivery zone (check address before accepting delivery orders)
- [ ] L.5 Legal pages: terms, GDPR privacy, ANPC links, company details
- [ ] L.6 Cart upsell (fries, sauces, drinks)

## Parallel track - Ebriza (no code)
- [ ] E.1 Message Ebriza support (see questions below)
- [ ] E.2 Create developer account + Marketplace app (type Global/Location, price Free, claims: bills, items, webhooks)
- [ ] E.3 Provide Ebriza a demo/staging login for their manual review
- [ ] E.4 Venue installs the app -> get `ebriza-clientid`
- [ ] E.5 Export POS product list (names, SKUs, prices, modifiers) for SKU matching

Questions for Ebriza: which application type fits one self-delivery venue; review timeline;
is there a test/demo location; who updates statuses 100-130 with useProviderIntegration;
does an API order appear automatically on the POS tablet and who accepts it.
