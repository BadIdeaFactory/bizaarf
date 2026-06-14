# Database

Data lives in Neon Postgres and is reached from the browser through the **Neon
Data API** (PostgREST), with the session JWT injected automatically so RLS
applies. There is no ORM and no migration runner yet — migrations are plain SQL
applied by hand.

## Tables

### `user_profiles`

One row per user holding the fine-grained tier (see
[user-tiers.md](./user-tiers.md)). The auth role (`admin`/`user`) gates admin
access; this table holds the precise tier.

| Column    | Type | Notes                               |
| --------- | ---- | ----------------------------------- |
| `user_id` | text | Primary key; the Neon Auth user id. |
| `tier`    | text | Defaults to `everybody-else`.       |

RLS: a user may read **their own** row; admins may read and write **all** rows
(keyed on the JWT `sub` and `role` claims).

## Applying migrations

Migrations are SQL files in [`db/migrations/`](../db/migrations), numbered in
order. Apply pending ones with:

```sh
npm run migrate
```

The runner ([`db/migrate.mjs`](../db/migrate.mjs)) applies each unseen `*.sql`
file once, in a transaction, in filename order, and records it in a
`schema_migrations` table so re-runs are no-ops. It is **forward-only** (no
down-migrations) and expects each file to run inside a single transaction (avoid
statements like `CREATE INDEX CONCURRENTLY`). The files are also written to be
idempotent, so a manual re-run in the Neon SQL editor is harmless too.

`npm run migrate` loads `.env` automatically. `DATABASE_URL` is the **direct
Postgres connection string** — a secret, used only locally / in tooling, never
bundled into the client (note: no `VITE_` prefix). See
[`.env.example`](../.env.example).

## TypeScript types

[`src/lib/database.types.ts`](../src/lib/database.types.ts) describes the schema
for the typed Data API client. It is **hand-maintained** — the schema is small,
so add a table's `Row`/`Insert`/`Update` shape there when you add it in a
migration. (If the schema grows enough that this becomes tedious, a codegen tool
like `neon-js gen-types` can generate this file from the live database instead.)

This file covers **database row types only**. The `{ data, error }` envelopes and
user fields returned by the Neon Auth client come from the SDK, not from the
schema — a couple of small explicit interfaces in
[`src/lib/users.ts`](../src/lib/users.ts) pin those shapes purely to reconcile a
nullability difference between svelte-check and ESLint.
