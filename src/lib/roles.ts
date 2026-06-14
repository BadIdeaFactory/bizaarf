// The five bizaarf user tiers and how they map onto Neon Auth's two-value auth
// role. See docs/user-tiers.md for the design.

export type UserTier =
	| 'administrator'
	| 'corporate-overlord'
	| 'member'
	| 'accomplice'
	| 'everybody-else';

export interface TierInfo {
	readonly tier: UserTier;
	readonly label: string;
}

export const DEFAULT_TIER: UserTier = 'everybody-else';

// Ordered most-privileged first (drives the admin UI order).
export const TIERS: readonly TierInfo[] = [
	{ tier: 'administrator', label: 'Administrator' },
	{ tier: 'corporate-overlord', label: 'Corporate Overlord' },
	{ tier: 'member', label: 'Member' },
	{ tier: 'accomplice', label: 'Accomplice' },
	{ tier: 'everybody-else', label: 'Everybody Else' },
];

// The only roles Neon Auth's admin plugin accepts.
export type AuthRole = 'admin' | 'user';
const ADMIN_ROLE: AuthRole = 'admin';
const USER_ROLE: AuthRole = 'user';

const TIER_VALUES = new Set<string>(TIERS.map(({ tier }) => tier));

export const isAdmin = (role: string | null | undefined): boolean =>
	role === ADMIN_ROLE;

// Administrators need the `admin` role so the admin plugin recognises them;
// every other tier is a plain `user`.
export const authRoleForTier = (tier: UserTier): AuthRole =>
	tier === 'administrator' ? ADMIN_ROLE : USER_ROLE;

export const isUserTier = (
	value: string | null | undefined,
): value is UserTier => value != null && TIER_VALUES.has(value);

// Fallback tier when no profile row exists yet.
export const tierFromRole = (role: string | null | undefined): UserTier =>
	isAdmin(role) ? 'administrator' : DEFAULT_TIER;

// Stored profile tier wins; otherwise fall back to the auth role.
export const resolveTier = (
	profileTier: string | null | undefined,
	role: string | null | undefined,
): UserTier => (isUserTier(profileTier) ? profileTier : tierFromRole(role));

export const tierLabel = (tier: UserTier): string =>
	TIERS.find((info) => info.tier === tier)?.label ?? tier;
