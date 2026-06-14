# bizaarf

A showcase of ideas and projects in various stages from the
[Bad Idea Factory](https://biffud.com) community.

This is a static [Svelte](https://svelte.dev) app built with
[Vite](https://vite.dev) and deployed to GitHub Pages. A Neon-backed backend is
planned for a future release; for now the site is a placeholder landing page.

## Getting started

Requires **Node 24**.

```sh
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Common commands

```sh
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
npm test         # run the unit tests
npm run lint     # lint and check formatting
npm run format   # auto-fix lint and formatting issues
```

## Contributing

See [AGENTS.md](./AGENTS.md) for the project layout, conventions, and tooling
details. CI runs `npm run lint`, `npm test`, and `npm run build` on every pull
request — run those locally before pushing.

## License

[AGPL-3.0](./LICENSE)
