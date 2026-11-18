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
