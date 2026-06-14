# Architecture

bizaarf is a **static single-page app** (Vite + Svelte 5) served from GitHub
Pages. There is no backend we run. Authentication and data both go straight from
the browser to Neon's managed services, with security enforced server-side by
JWTs and Postgres Row Level Security (RLS) — never by hiding anything in the
client.

## The two Neon services

| Service           | What it does                                                                                                            | Client surface       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Neon Auth**     | Managed auth (built on Better Auth). Stores users in the `neon_auth` schema, issues JWT sessions, exposes an admin API. | `neon.auth.*`        |
| **Neon Data API** | PostgREST over our Postgres tables, with the session JWT injected automatically so RLS applies.                         | `neon.from('table')` |

Both are reached through a single client created in
[`src/lib/client.ts`](../src/lib/client.ts) via `@neondatabase/neon-js`'s
`createClient`, configured from two **public** env vars (`VITE_NEON_AUTH_URL`,
`VITE_NEON_DATA_API_URL`).

## Request flow

1. **Sign up / log in** — `neon.auth.signUp.email` / `signIn.email`
   ([`src/lib/auth.ts`](../src/lib/auth.ts)) talk to Neon Auth, which sets the
   session and returns a JWT.
2. **Session state** — [`src/lib/session.svelte.ts`](../src/lib/session.svelte.ts)
   holds a reactive `$state` snapshot of the current user (id, email, role,
   resolved tier). Hydrated on boot and after each auth action.
3. **Data access** — `neon.from('user_profiles')…` calls hit the Data API; the
   JWT rides along automatically and RLS decides what the caller may read/write.

## Key modules

- `src/lib/client.ts` — the one Neon client.
- `src/lib/auth.ts` — thin sign-up / sign-in / sign-out wrappers.
- `src/lib/session.svelte.ts` — app-wide reactive session.
- `src/lib/roles.ts` — the five user tiers and how they map onto auth roles
  (see [user-tiers.md](./user-tiers.md)).
- `src/lib/users.ts` — admin user-management (list users, set a user's tier).
- `src/lib/components/` — Svelte views: `Login`, `SignUp`, `AdminUsers`,
  the `RequireAdmin` guard, and the `Home` landing page. `App.svelte` is the
  shell (header + hash router).

## Routing

Routing is **hash-based** (`svelte-spa-router`): `#/`, `#/login`, `#/signup`,
`#/admin/users`. Hash routes need no server rewrites, so GitHub Pages deep links
just work (the deploy's `404.html` fallback remains valid).

## Why static

Neon Auth being a managed REST API means an SPA needs no server of its own. This
keeps hosting on GitHub Pages, keeps the deploy trivial, and lets preview
environments (a later concern) branch auth + data together with a Neon branch.
