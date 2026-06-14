/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Neon Auth base URL (public; security is via JWT + RLS). */
	readonly VITE_NEON_AUTH_URL: string;
	/** Neon Data API (PostgREST) base URL (public; security is via JWT + RLS). */
	readonly VITE_NEON_DATA_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
