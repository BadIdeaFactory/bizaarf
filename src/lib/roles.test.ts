import { describe, expect, it } from 'vitest';
import {
	DEFAULT_TIER,
	TIERS,
	authRoleForTier,
	isAdmin,
	isUserTier,
	resolveTier,
	tierFromRole,
	tierLabel,
	type UserTier,
} from './roles';

describe('authRoleForTier', () => {
	it('maps the administrator tier to the privileged `admin` role', () => {
		expect(authRoleForTier('administrator')).toBe('admin');
	});

	it('maps every other tier to a plain `user` role', () => {
		for (const { tier } of TIERS) {
			if (tier !== 'administrator') {
				expect(authRoleForTier(tier)).toBe('user');
			}
		}
	});
});

describe('isAdmin', () => {
	it('is true only for the admin role', () => {
		expect(isAdmin('admin')).toBe(true);
		expect(isAdmin('user')).toBe(false);
		expect(isAdmin(null)).toBe(false);
		expect(isAdmin(undefined)).toBe(false);
	});
});

describe('isUserTier', () => {
	it('accepts known tiers and rejects everything else', () => {
		expect(isUserTier('member')).toBe(true);
		expect(isUserTier('everybody-else')).toBe(true);
		expect(isUserTier('overlord-of-nothing')).toBe(false);
		expect(isUserTier(null)).toBe(false);
	});
});

describe('tierFromRole', () => {
	it('treats admins as administrators and everyone else as the default', () => {
		expect(tierFromRole('admin')).toBe<UserTier>('administrator');
		expect(tierFromRole('user')).toBe(DEFAULT_TIER);
		expect(tierFromRole(null)).toBe(DEFAULT_TIER);
	});

	it('defaults new accounts to Everybody Else', () => {
		expect(DEFAULT_TIER).toBe<UserTier>('everybody-else');
	});
});

describe('resolveTier', () => {
	it('prefers a valid stored profile tier', () => {
		expect(resolveTier('corporate-overlord', 'user')).toBe(
			'corporate-overlord',
		);
	});

	it('falls back to the role when the profile tier is missing or invalid', () => {
		expect(resolveTier(null, 'admin')).toBe('administrator');
		expect(resolveTier('bogus', 'user')).toBe(DEFAULT_TIER);
	});
});

describe('tierLabel', () => {
	it('returns the human-readable label for a tier', () => {
		expect(tierLabel('corporate-overlord')).toBe('Corporate Overlord');
		expect(tierLabel('everybody-else')).toBe('Everybody Else');
	});
});
