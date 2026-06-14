import { createClient } from '@neondatabase/neon-js';
import type { Database } from './database.types';

// App-wide Neon client: `neon.auth` (Neon Auth) + `neon.from()` (Data API, with
// the session JWT injected). The URLs are public; security is server-side via
// JWT + RLS. See docs/architecture.md.
export const neon = createClient<Database>({
	auth: { url: import.meta.env.VITE_NEON_AUTH_URL },
	dataApi: { url: import.meta.env.VITE_NEON_DATA_API_URL },
});
