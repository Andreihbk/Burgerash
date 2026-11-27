---
name: pre-push-check
description: Use before committing or pushing, or when asked to check, review, or ship changes. Runs build, lint, secret and RLS checks (repo is private now, same secret rules as a public repo).
---

# Pre-push check (repo is private now; keep the same secret rules as if it were public)

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
