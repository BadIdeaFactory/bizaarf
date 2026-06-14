import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
	{
		// Build output, caches and dependencies are never linted.
		ignores: ['dist/', 'coverage/', 'node_modules/', '.vite/'],
	},
	js.configs.recommended,

	// Type-aware linting for the application source. The project service reads
	// tsconfig.json to resolve types, so only files it knows about belong here.
	{
		files: ['**/*.ts', '**/*.svelte', '**/*.svelte.ts'],
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.browser,
			},
		},
	},

	// Svelte component rules and the .svelte parser wiring.
	...svelte.configs.recommended,
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig: './svelte.config.js',
			},
		},
	},

	// Plain JS config files (this file, svelte.config.js) run in Node and are
	// not part of the TypeScript program, so type-aware rules are turned off.
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		extends: [tseslint.configs.disableTypeChecked],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},

	{
		files: ['**/*.{test,spec}.ts'],
		rules: {
			// Tests lean on hard-coded fixtures and assertions; the strictness
			// that helps production code mostly adds noise here.
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
	{
		files: ['**/*.ts', '**/*.svelte'],
		rules: {
			'@typescript-eslint/no-magic-numbers': [
				'error',
				{
					detectObjects: false,
					ignoreEnums: true,
					ignoreReadonlyClassProperties: true,
					ignore: [-1, 0, 1],
				},
			],
		},
	},

	// Keep these last so Prettier owns all formatting decisions.
	prettier,
	...svelte.configs.prettier,
);
