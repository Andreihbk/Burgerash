# Automations

## Running now (in the repo)
- **CI** (`.github/workflows/ci.yml`): on every PR and push to main, runs lint, tests, build, type check
  (Build/lint/types/tests job) and `npm audit` for high/critical issues in shipped packages (Security audit job).
  Placeholder env only, no secrets. Vercel previews are separate: they only build and deploy.
- **Dependabot** (`.github/dependabot.yml`): Mondays 08:00 Bucharest, one grouped PR for npm minor+patch,
  majors as separate PRs, security fixes grouped; GitHub Actions monthly. Dependabot PRs also run CI.
- **Weekly health check**: Claude scheduled task, Sundays (read-only).

## Outside the repo (Andrei's accounts)
- Uptime monitoring for www.burgerash.ro: UptimeRobot free, 5-minute HTTP(S) check, push alerts via the app.

## Later (after the ordering launch)
| Idea | How |
|---|---|
| Daily closing report | Claude scheduled task reading Supabase (needs a read-only key/view) |
| Stuck-order alert | Code: Vercel cron + Supabase query + push/SMS (must be fast, not Claude) |
| Ebriza vs site price check | Claude scheduled task, or a CI script once the Ebriza API is live |
| Monthly Google report | Claude scheduled task (Search Console / PageSpeed numbers) |
