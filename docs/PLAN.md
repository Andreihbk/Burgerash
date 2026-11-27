# Burgerash - Plan

Rule: one task per Claude Code session. Tick the box and commit when done.
Definition of done for every task: `npm run build` + `npm run lint` pass.

## PRE-LAUNCH BLOCKERS (owner decisions, 2026-11-19; order = priority)
Nothing here is built yet. Do not set `NEXT_PUBLIC_ORDERING_ENABLED=true` in Production until all are done.
1. [x] **B.1 Rate limit + bot protection on `/api/orders`** (basic limit per IP + captcha/bot check). Model: Sonnet.
   - Done 2026-11-19: Supabase rate limit 5/10 min + 20/day per hashed IP (fail open), honeypot (fake success),
     3 s minimum form time (normal 400), server-side input caps. No captcha (no new accounts).
   - Go-live needs: run `supabase/migrations/20261122000000_order_rate_limit.sql`, set `RATE_LIMIT_SALT` in Vercel.
2. [x] **B.2 Legal pages** (see L.5): Terms, GDPR privacy, delivery & returns, ANPC/SOL links, company details.
   - Company data is pending from the owner: use clear placeholders (e.g. `[DENUMIRE SRL]`, `[CUI]`), never invent data.
   - Privacy must mention map tiles from OpenStreetMap and Netopia as payment processor.
   - Comes before Netopia: Netopia reviews the site before activation.
   - Done 2026-11-19: /termeni, /confidentialitate, /livrare-retur, /anpc; company data in `src/lib/legal.ts` (all
     `[DE COMPLETAT]`, owner must fill before launch); footer links + SAL/SOL; required terms checkbox at checkout,
     validated server-side (`terms_accepted`). Texts are a draft: have a lawyer review before launch.
3. [ ] **B.3 Delivery radius** (see L.4): 1 km from the shop. Shop coordinates pending from the owner.
   - [x] Public map section above the footer showing the radius. DONE + locked (owner OK 2026-11-20): MapLibre GL +
     OpenFreeMap tiles, GeoJSON circle, `SITE_COORDS` + `DELIVERY_RADIUS_KM = 1` in `src/lib/site.ts`. Do not restyle.
   - [ ] Radius preview slider in /admin (preview only).
   - [ ] Address check at checkout (and server-side in `/api/orders`) against the radius.
4. [ ] **B.4 Netopia payment: card only, paid online via NETOPIA Payments.** Replaces the `card_on_delivery` default; no cash option.
   - Owner has no Netopia account yet: build and test against the Netopia sandbox first.
   - Depends on B.2 (site review). Design task: use Opus (security, payment flow, order state before/after payment).
5. [ ] **B.5 Allergens for ALL products.** The owner gets them from supplier labels (not just the 4 new products). See L.1.
6. [ ] **B.6 Contact + riders (owner data pending):**
   - Real `CONTACT.phone` and `CONTACT.address` in `src/lib/hours.ts`.
   - Real rider names in `src/lib/riders.ts`, set before opening.

High priority, not a launch gate by itself: **Ebriza integration** (E.1-E.5, L.2). Waiting on the Ebriza support reply.

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
- [x] 0.2 Vercel env vars set (Supabase keys; later Ebriza vars). No secrets in git history.
      DONE WHEN: the live site places an order into Supabase.
- [x] 0.3 Add `.env.example` names only; confirm `.env*` is gitignored.

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
- [x] C.2 Customize modal: sticky footer (qty + live "ADAUGĂ · n LEI"), EXTRA / FĂRĂ groups,
      note label without KDS, thin brand scrollbar (modal + cart drawer). Checkout items already in C.1.
- [x] S.6 /font-test removed (did not exist).
- [x] D.1 Design direction (docs/DESIGN.md) + new hero: menu board (MenuBoard.tsx) in the hero with sticker
      stack over its corner (desktop), board right below on mobile; old board section removed; hero status
      line from hours.ts (never "open" while closed); short status in mobile header.

- [x] S.7 Catalog follows the physical menu board: CLASIC, HOT BOY, DOUBLE, CRISPY, HOT HONEY, CRISPY BACON + Fries,
      Chips, Nuggets, Sauces + drinks, with weights (`weight_label`). CHEESY and CHICKEN BURGER removed (priceOrder rejects them).
      Saved carts drop removed products quietly (`cart-reconcile.ts`). New products have no Ebriza SKU yet (orders still save;
      sync ends `failed` / 0104). BrandLogo tagline "HANDCRAFTED BURGERS". Brand photos with GPS removed from the tree.

## Performance & SEO
- [x] P.1 SEO foundations: `src/lib/site.ts` (SITE_URL from `NEXT_PUBLIC_SITE_URL`, else Vercel production URL),
      metadataBase + canonical + title template + themeColor in layout, `robots.ts` (staff paths + /api disallowed),
      `sitemap.ts`, Restaurant JSON-LD (`src/lib/structured-data.ts`, built from catalog + hours; address/phone only
      when CONTACT is set). `MENU_SECTIONS` moved to catalog.ts. TODO: set `NEXT_PUBLIC_SITE_URL` in Vercel + .env.example.
- [x] P.2 Cleanup + staff hiding + fonts: deleted unused public/images PNGs (menu/ kept), default SVGs, src/_archive;
      /admin added to the proxy matcher; `X-Robots-Tag: noindex, nofollow` on all staff paths (next.config headers, from
      `PRIVATE_PATHS` in site.ts); staff links removed from the footer; Nunito declared as one variable font; unused CSS
      (ticker, scanlines, glitch, marquee, flash, custom-cursor) removed.
      BASELINE for P.3/P.4 (`/`, production build): 10 scripts, 607 KB raw / 185 KB gzip JS, 6 preloaded fonts
      (the font change did not reduce the file count: Google already served one file for all Nunito weights).
- [x] P.3 Refactor 1: `src/store/uiStore.ts` (customizing, lastAdded, addedSeq); server ProductCard / MenuSections /
      LocationSection / SiteFooter in `src/components/storefront/`, client ProductActions; StoreFront takes them as slots.
      Also: OpenCartButton (client, used by LocationSection), `ids.ts` (sectionDomId, isCustomizable); CustomizeModal split out
      inside StoreFront.tsx (keyed by product, local state) ready to move in P.4.
- [x] P.4a Refactor 2 (part 1): client islands in `src/components/storefront/`: SiteHeader, HeroBoard (stickers + board +
      status line), CategoryBar (scroll spy), AddedToast, MobileCartBar. Shared: `layout.ts` (HEADER_HEIGHT, scrollToTab,
      sticky offset read from the DOM), `useStorefrontStatus`, `useCartSummary`. StoreFront.tsx now only composes them +
      CustomizeModal + CartDrawer. Build + lint pass. (Lighthouse/JS comparison is left for P.4b.)
- [x] P.4b Refactor 2 (part 2): `CustomizeModal` island (role=dialog, aria-modal, Escape, focus trap + restore, scroll lock,
      backdrop click) loaded via next/dynamic by `CustomizeModalHost`; `CartDrawerHost` loads CartDrawer via next/dynamic on first
      open (stays mounted after); `TodayStatus` client wrapper; StoreFront.tsx deleted, `page.tsx` composes the islands.
      Result (`/`, production build): 10 scripts, 592 KB raw / 182 KB gzip JS (baseline 607 / 185), 6 fonts. Small gain: most
      of the JS is shared framework + zustand + lucide. Lighthouse not run (no browser here); run it on the Vercel preview.
- [x] P.5 SEO round 2: homepage title/description with brand + "burgeri Sector 6, București"; JSON-LD `@graph` with WebSite
      (name + alternateName, for the "burgerash" search) + Restaurant (`@id`, logo, image, hasMap, `sameAs` from
      `SOCIAL_LINKS`); share image = top-view photo + logo; `manifest.ts`; optional `GOOGLE_SITE_VERIFICATION` env.
      `sameAs` = Instagram + the Google Maps link. TODO(owner): phone in `CONTACT` (hours.ts), Facebook/Glovo URLs in
      `SOCIAL_LINKS` (site.ts) when they exist, Search Console + claim the Google Business Profile (off-site).
- [x] P.6 Vercel Web Analytics + Speed Insights (`SiteAnalytics.tsx`, cookieless, no keys; staff and /comanda/ pages
      not counted). Turn both on in the Vercel dashboard.
- [ ] R.1-R.15 Audit 2026-11-27 (SEO, speed, code): findings + ready prompts in `docs/AUDIT-2026-11-27.md`.
      Phase 1 first (R1 map on demand, R2 sold-out without supabase-js at load, R3 menu rendered once, R4 fonts, R5 SEO fixes).
      Baseline `/` mobile Lighthouse 63 (TBT 870 ms, LCP 4.6 s, 1,739 DOM nodes), desktop 98.

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
- [x] 1.4 `src/lib/ebriza-sku-map.ts` (catalog id -> POS SKU), filled in later.
      All values `null` (TODO, fill in E.5). Unmapped ids log `0104` loudly and are never pushed;
      in mock mode only they get a `TODO-<id>` placeholder so the pipeline can be tested.
      The push uses this map, not the `ebriza_sku` snapshot from catalog.ts.
- [x] 1.5 Call the adapter from `/api/orders` AFTER the Supabase insert; failure must never
      lose the order (store `ebriza_sync_status` + error, allow retry).
      DONE WHEN: in mock mode an order creates a fake bill and the status is saved.
      `src/lib/ebriza-sync.ts`, run via `after()` so the customer response never waits for Ebriza.
      Migration `supabase/migrations/20261118000000_ebriza_sync_columns.sql` (run it in the
      Supabase SQL Editor): status `pending|sent|failed|skipped` (`synced` -> `sent`) + `ebriza_error_code`.
      Not built yet: the retry action itself (the data to drive it is stored). On retry on path 2,
      call `getBillByExternal` first (skill rule 7).

## Phase 2 - Staff apps (Supabase Realtime)
- [x] 2.1 `/kitchen` KDS, 3 columns (Nou = pending, În preparare = preparing, Gata = ready_for_packing)
      Supabase only (no Ebriza), Realtime on `orders`, optimistic one-tap advance + undo, sound toggle.
      Phone = tabs, md+ = 3 columns. No auth yet (see "Before launch").
- [x] 2.2 `/dispatch` handoff + rider assignment (option A: `src/lib/riders.ts` list -> `orders.rider_name`)
      Supabase only, Realtime on `orders`. Columns De predat (ready_for_packing) and În livrare
      (out_for_delivery). Delivery: ready -> out_for_delivery -> delivered; pickup: ready -> "Predat" (delivered).
      Behind the staff Supabase Auth proxy. Delivery orders need a rider picked before "Plecat la client";
      no schema change. Rider names are placeholders in `src/lib/riders.ts`.
- [x] 2.3 `/rider` mobile view (pick name from riders.ts, saved in localStorage; out_for_delivery for that rider, Realtime, SUNĂ/HARTĂ/LIVRAT + 6s undo, shows total + cash/card to collect)
- [x] 2.4 `/admin` day one: "stoc epuizat" per product (`product_stock` table, staff-only RLS, shown on the
      storefront, rejected by /api/orders with 409) + today's orders count and total (Bucharest day, canceled excluded)
- [ ] 2.5 `/admin` menu/price edits and opening hours (hours stay in `src/lib/hours.ts` until then)

## Phase 3 - Ebriza webhooks (needs approved Marketplace app)
- [x] 3.0 (2026-11-19) The 4 URL webhooks, `/api/ebriza/[secret]/{change-status,sync-products,start-accepting-orders,set-item-unavailable}`
      (`src/lib/ebriza-webhook.ts` auth/parsing, `ebriza-webhook-handlers.ts`). Secret in the path (no signature is documented),
      constant-time check, `EBRIZA_WEBHOOK_SECRET` + `_PREVIOUS`. Defensive parsing until Ebriza sends sample payloads (Q1).
      change-status drives `orders.status` forward-only (owner decision) + stores `ebriza_status`; set-item-unavailable snoozes
      `product_stock` until the next opening; start-accepting-orders sets `store_settings.accepting_orders` (checked by /api/orders);
      sync-products acks + logs only. Migration `20261123000000_ebriza_webhooks.sql` (run it in the Supabase SQL Editor).
      `EBRIZA_BASE_URL` (stage default outside production). Tests: `src/lib/ebriza-webhooks.test.ts`.
- [ ] 3.1 Re-fetch the bill (`GET /bills/get`, path 2) before trusting a cancel; adjust parsers once Ebriza sends real payloads.
- [ ] 3.2 Subscribe to Order and Bill entities (`POST /webHooks/subscribe`), only if Q8 says it is needed.
- [ ] 3.3 Storefront banner while `store_settings.accepting_orders` is false (today only /api/orders refuses).

## Phase 4 - Hardening before launch
- [x] 4.1 Staff login (Supabase Auth) on /kitchen /dispatch /rider /admin
- [x] 4.2 Replace permissive RLS with real policies
- [ ] 4.3 End-to-end test: cart -> order -> POS -> status back

## Before launch
- [ ] L.1 (see B.5: all products, from supplier labels) Confirm allergens with the owner/kitchen. Since 2026-11-26 CRISPY, CRISPY BACON, Chips and Nuggets
      show TYPICAL allergens (marked in catalog.ts), not confirmed yet. Also re-check allergens of CLASIC/HOT BOY/DOUBLE/HOT HONEY
      against the new menu board ingredients (Gouda, bacon, sos spicy, hot honey).
- [x] L.2 `ebriza-sku-map.ts` filled with all 20 SKUs (EBRIZA_PLAN 5b). The same SKUs must be entered in the POS (E.5).
      SGR deposit flagged for the 4 drinks; sent only with `EBRIZA_SEND_SGR=true` (website does not charge it yet).
- [ ] L.3 docs/brand history: IMG_4143.jpeg and image.png (phone photos, possible GPS) were removed from the tree only; they stay in
      git history of this public repo. Decide later if a history rewrite is worth it.
- [x] L.0 TODO staff auth + RLS: /kitchen (and later /dispatch /rider /admin) are open to anyone with the URL,
      and RLS is `using (true)` on orders (anyone with the anon key can read/update orders). Add Supabase Auth
      + staff-only policies (tasks 4.1, 4.2). Do not launch without it.
- [x] L.0b Replace the TEMPORARY password gate (`STAFF_PASSWORD` env var, `src/proxy.ts`, `/staff-login`,
      `/api/staff-login`, `src/lib/staff-auth.ts`) with Supabase Auth + RLS. The gate only hides the /kitchen
      page: the anon key can still read/update `orders` directly until RLS is real. Gate covers /kitchen only;
      extend the `proxy.ts` matcher to /dispatch /rider /admin when they are built. Set STAFF_PASSWORD in
      Vercel (no password = nobody gets in).
  - Plan (decided 2026-11-19): Option B. `/api/orders` and the Ebriza sync use a server-only service_role
    client (`src/lib/supabase-admin.ts`, `SUPABASE_SERVICE_ROLE_KEY`); anon gets NO execute on `create_order`
    and no table access to orders/order_items. Staff (`authenticated`) can SELECT orders/items and UPDATE
    only `status` and `rider_name`. No delete for anyone. Steps: 1 admin client (done) / 2 Supabase Auth
    login / 3 RLS migration + remove old gate / 4 sign-out button.
  - Step 2 DONE (code): `@supabase/ssr` added; `/staff/login` (email + password) posts to `/api/staff-auth/login`
    (`signInWithPassword`, session cookies set on the redirect). `safeNext` moved to `src/lib/safe-next.ts`. The old
    gate (`proxy.ts`, `/staff-login`) is still active and untouched. Create staff users in Supabase Dashboard >
    Authentication > Users (sign-ups OFF). Nothing reads the new session yet.
  - Step 3 must: swap `proxy.ts` to verify the Supabase session (`createServerClient` + `getUser()`, refresh cookies);
    switch the /kitchen /dispatch /rider browser queries + Realtime to `createBrowserClient` from `@supabase/ssr`
    (the plain anon client has no session, so it would lose access once RLS closes); write the RLS migration;
    delete `staff-auth.ts`, `/staff-login`, `/api/staff-login`, `STAFF_PASSWORD`.
  - Step 3 DONE (code): `proxy.ts` checks `getUser()` and redirects to `/staff/login`; `src/lib/supabase.ts` is now
    `createBrowserClient` (session cookies -> queries + Realtime as `authenticated`); old gate deleted.
    Migration `20261120000000_staff_rls.sql` (YOU run it in Supabase AFTER this deploy is live, then the anon curl
    tests). Once run + tested, tick L.0 and 4.2. Remove `STAFF_PASSWORD` from Vercel. Run + tested 2026-11-19 (anon denied, orders and staff login OK).
  - Step 4 DONE: `SignOutButton` (IEȘI) in the /kitchen /dispatch /rider /admin headers; `supabase.auth.signOut()` then
    full navigation to /staff/login.
  - NOTE: "authenticated = staff" only holds while sign-ups AND anonymous sign-ins are OFF in Supabase Auth.
    If we add customer accounts later (loyalty), policies must check a staff table instead of the role.
- [x] L.7 Opening hours + open/closed badge (block or warn on orders when closed)
  - Hours live in src/lib/hours.ts only; server rejects closed orders (403). TODO: set real CONTACT.phone / CONTACT.address there (hidden on the site until set).
- [x] L.8 Order status page via secret link
  - Part A done (code): migration `20261119000000_order_public_token.sql` (YOU must run it in Supabase before deploying), `/comanda/[token]` server page (service_role lookup, no phone/address/rider shown, noindex, auto-refresh 20s), `public_token` returned by `/api/orders`. Part B done: "URMĂREȘTE COMANDA" button on the cart success screen, last order saved in localStorage (`src/lib/last-order.ts`), small "COMANDA TA" link in SiteHeader until the order is delivered/canceled (status page clears it).
- [ ] L.4 Delivery zone (check address before accepting delivery orders). Decided: 1 km radius, see B.3
- [x] L.5 Legal pages: terms, GDPR privacy, ANPC links, company details. Pre-launch blocker, see B.2
- [x] L.6 Cart upsell (fries, sauces, drinks). "MERGE LÂNGĂ" block in the cart (`CartUpsell.tsx`, logic in `src/lib/upsell.ts` + tests):
      only with a burger/chicken in the cart, one tap per missing group (side, sauce, drink), first product not sold out.

## Parallel track - Ebriza (no code)
- [ ] E.1 Message Ebriza support (see questions below)
- [ ] E.2 Create developer account + Marketplace app (type Global/Location, price Free, claims: bills, items, webhooks)
- [ ] E.3 Provide Ebriza a demo/staging login for their manual review
- [ ] E.4 Venue installs the app -> get `ebriza-clientid`
- [ ] E.5 Export POS product list (names, SKUs, prices, modifiers) for SKU matching

Questions for Ebriza: which application type fits one self-delivery venue; review timeline;
is there a test/demo location; who updates statuses 100-130 with useProviderIntegration;
does an API order appear automatically on the POS tablet and who accepts it.
