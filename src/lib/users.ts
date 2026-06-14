import { neon } from './client';
import type { UserProfileRow } from './database.types';
import { auth } from './auth';
import { authRoleForTier, resolveTier, type UserTier } from './roles';

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	role: string | null;
	tier: UserTier;
	banned: boolean;
}

// Explicit shapes for the SDK responses we consume: svelte-check and the ESLint
// project service infer the clients' union return types with different
// nullability, so pinning a simple shape keeps both in agreement.
interface ApiUser {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	role?: string | null;
	banned?: boolean | null;
}
interface ListUsersResult {
	data: { users: ApiUser[] } | null;
	error: { message?: string } | null;
}
interface ProfilesResult {
	data: Pick<UserProfileRow, 'user_id' | 'tier'>[] | null;
	error: { message: string } | null;
}
interface MutationResult {
	error: { message?: string } | null;
}

// First-page size; pagination is a later concern.
const PAGE_SIZE = 200;

// Admin-only. Joins identity + role (admin API) with the tier (user_profiles).
export const listUsers = async (): Promise<AdminUser[]> => {
	const { data, error }: ListUsersResult = await auth.admin.listUsers({
		query: { limit: PAGE_SIZE },
	});
	if (error != null || data == null) {
		throw new Error(error?.message ?? 'Failed to load users.');
	}

	const profiles: ProfilesResult = await neon
		.from('user_profiles')
		.select('user_id, tier');
	if (profiles.error != null) {
		throw new Error(profiles.error.message);
	}
	const tierByUser = new Map(
		(profiles.data ?? []).map((row) => [row.user_id, row.tier]),
	);

	return data.users.map((user) => ({
		id: user.id,
		email: user.email,
		name: user.name,
		emailVerified: user.emailVerified,
		role: user.role ?? null,
		tier: resolveTier(tierByUser.get(user.id), user.role),
		banned: user.banned ?? false,
	}));
};

// Admin-only. Persists both the auth role (the admin gate) and the profile tier.
// Write the RLS-gated profile first (the likelier failure) so a rejected write
// can't leave a promoted auth role with a stale tier.
export const setUserTier = async (
	userId: string,
	tier: UserTier,
): Promise<void> => {
	const profileResult: MutationResult = await neon
		.from('user_profiles')
		.upsert({ user_id: userId, tier });
	if (profileResult.error != null) {
		throw new Error(
			profileResult.error.message ?? 'Failed to update the tier.',
		);
	}

	const roleResult: MutationResult = await auth.admin.setRole({
		userId,
		role: authRoleForTier(tier),
	});
	if (roleResult.error != null) {
		throw new Error(
			roleResult.error.message ?? 'Failed to update the user role.',
		);
	}
};
