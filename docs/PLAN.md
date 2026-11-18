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
