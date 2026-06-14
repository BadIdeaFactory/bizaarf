# AGENTS.md

Guidance for humans and AI agents working in this repository. `CLAUDE.md` is a
symlink to this file.

## What this is

**bizaarf** is the showcase and community project listing for
[Bad Idea Factory](https://biffud.com) — a catalogue of ideas and projects in
various stages (idea → prototype → active → archived) from the BIF community.

The frontend is a static [Svelte](https://svelte.dev) single-page app built with
[Vite](https://vite.dev) and deployed to GitHub Pages. Accounts, login, and user
management are backed by [Neon](https://neon.tech) — **Neon Auth** for
authentication and the **Neon Data API** for data — reached directly from the
browser (no server of our own; auth-z is enforced by JWT + RLS). See
[`docs/`](./docs) for the architecture, user tiers, and database notes. The
project-listing backend is still to come.

## Tech stack

- **Language:** TypeScript (strict), targeting the browser.
- **UI:** Svelte 5 (runes-era `mount` API).
- **Build/dev:** Vite.
- **Tests:** Vitest (jsdom environment).
- **Lint/format:** ESLint (flat config, type-aware) + Prettier.
- **CI/CD:** GitHub Actions. Hosting: GitHub Pages.
- **Runtime:** Node 24 (see `engines` in `package.json`).

## Layout

```
.
├── index.html              # Vite entry document
├── src/
│   ├── main.ts             # App bootstrap (mounts App.svelte onto #app)
│   ├── App.svelte          # Root shell: header + hash router
│   ├── app.css             # Global styles
│   ├── vite-env.d.ts       # Ambient types (incl. import.meta.env)
│   └── lib/                # Framework-agnostic TS modules + their *.test.ts
│       ├── client.ts       # The Neon client (auth + Data API)
│       ├── database.types.ts # Hand-maintained Data API row types
│       └── components/     # Svelte views (auth forms, admin, guard)
├── db/migrations/          # Hand-applied SQL migrations
├── docs/                   # Architecture, user tiers, database, GitHub setup
├── .env.example            # Public Neon URLs + (secret) DATABASE_URL template
├── vite.config.ts          # Vite + Vitest config
├── svelte.config.js        # Svelte preprocess config
├── eslint.config.mjs       # Flat ESLint config
└── .github/
    ├── workflows/ci.yml    # Lint + test + build on push/PR
    ├── workflows/deploy.yml # Build + publish to GitHub Pages
    └── dependabot.yml      # Grouped monthly dependency updates
```

Keep business logic in `src/lib/` as plain TypeScript so it can be unit-tested
without a DOM. Svelte components should stay thin and lean on `lib/` for
anything non-trivial.

## Commands

| Command                 | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server.                         |
| `npm run build`         | Type-check (`svelte-check`) then build to `dist/`. |
| `npm run preview`       | Serve the production build locally.                |
| `npm test`              | Run the Vitest unit suite once.                    |
| `npm run test:watch`    | Run Vitest in watch mode.                          |
| `npm run test:coverage` | Run tests with a v8 coverage report.               |
| `npm run lint`          | ESLint + Prettier check + `svelte-check`.          |
| `npm run format`        | Auto-fix with ESLint then Prettier.                |

CI runs `npm run lint`, `npm test`, and `npm run build`. Anything that fails CI
fails locally with the same commands — run them before pushing.

## Conventions

These mirror the house style used across BIF/PDC projects
([PhilanthropyDataCommons/service](https://github.com/PhilanthropyDataCommons/service)):

- **Formatting is Prettier's job.** Tabs for indentation, single quotes,
  trailing commas. Don't hand-format; run `npm run format`.
- **Linting is strict and type-aware.** We use `typescript-eslint`'s
  `strictTypeChecked` + `stylisticTypeChecked`. `--max-warnings=0`, so warnings
  are errors in practice.
- **Magic numbers are flagged** outside of tests; name constants instead
  (`-1`, `0`, `1` and enum members are allowed).
- **Prefer named exports** for `lib/` modules. Svelte components and config
  files use default exports because the tooling requires them — that's fine.
- **TypeScript is strict**, including `noUncheckedIndexedAccess`. Handle the
  `undefined` that indexed access and `getElementById` can return.
- **Tests** live next to the code they cover as `*.test.ts` and import from
  `vitest` explicitly. Test files relax the magic-number and non-null-assertion
  rules.
- **Prefer self-documenting code over comments.** Reach for clear names and small
  functions first. Reserve comments for _why_ (non-obvious rationale, a
  workaround, a gotcha) — not _what_ the code already states, since those rot.
- **Lasting documentation lives in `docs/`,** not in long code-comment blocks.
  Design rationale, architecture, and how-tos belong there; reference `docs/`
  from code only when it genuinely helps.

## Deployment & the Pages base path

GitHub Pages serves project sites from a sub-path
(`https://badideafactory.github.io/bizaarf/`), so the production build needs a
matching `base`. The deploy workflow sets `BASE_PATH` from
`actions/configure-pages`, and `vite.config.ts` reads it; local dev and preview
default to `/`.

**If a custom domain (e.g. via a `CNAME`) is ever configured, set `base` back to
`/`** — assets paths will otherwise point at the wrong place.

The deploy workflow also copies `index.html` to `404.html` for SPA deep links.
Routing is currently hash-based (`svelte-spa-router`), which doesn't rely on that
fallback, but it stays in place in case path-based routing is adopted later.

## Dependencies

Dependabot proposes grouped npm and GitHub Actions updates monthly with a
7-day cooldown (see `.github/dependabot.yml`). Related packages (eslint, svelte,
vite/vitest, prettier) update together to keep peer versions in sync.

## Roadmap

- Replace the placeholder landing page with the real project listing UI.
- Add the Neon-backed backend and wire the listing to live data.
