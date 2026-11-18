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
- src/lib: catalog.ts, pricing.ts (server-side order pricing), supabase.ts, ebriza.ts
- src/store/cartStore.ts - src/types/{database,ebriza}.ts - supabase/schema.sql (repo root)

## Hard rules
- Brand tokens are fixed: #790D20 wine, #F5E6CC sand, #332420 charcoal.
- Product sticker accents (globals.css `--color-sticker-*`, each used ONLY on that product's sticker):
  classic #0B391C, double #6D050A, cheesy #EE9E23 (wine text), hot-boy #B50711,
  hot-honey #650329, chicken #063640. These + the 3 brand tokens are the ONLY allowed colors.
- Fonts (latin-ext subset): Bebas Neue for display/headings, Nunito for body and form labels,
  Roboto Mono only for small accents. No other fonts.
- Product visuals are SVG stickers (BurgerStamp.tsx), not photos.
- Product names follow the stickers, in Romanian, everywhere (catalog, cards, cart, stickers):
  CLASIC, DUBLE, HOT BOY, CHEESY, HOT HONEY, CHICKEN BURGER. Fries, sauces, drinks keep their
  names. Prices follow the menu board.
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

## Session hygiene (remind the user)
- At the end of every task, after commit + push, say: "Task done. Run /clear before the next task."
- Before starting a task, recommend a model in one line: Sonnet for normal building and fixes,
  Opus only for architecture, Ebriza integration design, security/RLS, or a bug Sonnet failed twice.
- If the conversation gets long or you start re-reading the same files, suggest /compact or /clear.
- If a task touches more than ~5 files, suggest splitting it.