# GitHub setup

## Build variables

The app needs two values at build time:

- `VITE_NEON_AUTH_URL`
- `VITE_NEON_DATA_API_URL`

Both are **public** (security is via JWT + RLS), so they are stored as repo-level
**Variables**, not Secrets. The deploy workflow
([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) passes them
into `npm run build` from `${{ vars.* }}`, alongside the existing `BASE_PATH`.

To set them: repo **Settings → Secrets and variables → Actions → Variables →
New repository variable**.

`DATABASE_URL` (the direct Postgres connection string) is a **secret** and is
**not** needed by CI — migrations and type generation are run locally. Keep it in
your local `.env`, never in a repo Variable.

## Environments and PR previews — deferred

Prod/preview GitHub Environments and PR preview deploys are intentionally **out
of scope here** and tracked on a separate branch. GitHub Pages hosts a single
(production) site, so previews need a different mechanism (and ideally a separate
Neon branch for isolated auth + data). Until then, the single existing
`github-pages` environment with repo Variables is all that's wired up.
