import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// When deploying to GitHub Pages project sites the app is served from
// https://<org>.github.io/<repo>/, so assets must be requested from that
// sub-path. The deploy workflow sets BASE_PATH accordingly; local dev and
// preview fall back to the root. If a custom domain (CNAME) is configured this
// should be set back to '/'.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
	base,
	plugins: [svelte()],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
		},
	},
});
