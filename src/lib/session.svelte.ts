import { neon } from './client';
import type { UserProfileRow } from './database.types';
import { auth } from './auth';
import { resolveTier, type UserTier } from './roles';

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: string | null;
	emailVerified: boolean;
	tier: UserTier;
}

type SessionStatus = 'loading' | 'authed' | 'anon';

interface SessionState {
	status: SessionStatus;
	user: SessionUser | null;
}

// App-wide reactive session ($state must live in a .svelte.ts module).
export const session = $state<SessionState>({ status: 'loading', user: null });

// The user's own tier, falling back to the role-derived tier when there is no
// profile row yet (or the Data API is unreachable).
const fetchOwnTier = async (
	userId: string,
	role: string | null,
): Promise<UserTier> => {
	try {
		// Annotated explicitly so svelte-check and ESLint agree on nullability.
		const result: { data: Pick<UserProfileRow, 'tier'>[] | null } = await neon
			.from('user_profiles')
			.select('tier')
			.eq('user_id', userId);
		return resolveTier(result.data?.[0]?.tier, role);
	} catch {
		return resolveTier(null, role);
	}
};

// Sync the store from Neon Auth; call on boot and after each auth action.
// disableCookieCache forces a fresh read so just-changed fields (e.g.
// emailVerified) aren't masked by the cached session cookie.
export const refreshSession = async (): Promise<void> => {
	const { data } = await auth.getSession({
		query: { disableCookieCache: true },
	});
	const user = data?.user;
	if (user) {
		const role = user.role ?? null;
		session.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			role,
			emailVerified: user.emailVerified,
			tier: await fetchOwnTier(user.id, role),
		};
		session.status = 'authed';
	} else {
		session.user = null;
		session.status = 'anon';
	}
};
