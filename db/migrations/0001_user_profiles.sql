-- 0001_user_profiles: the per-user tier plus the authorization helpers and RLS
-- that protect it, served via the Neon Data API. See docs/user-tiers.md for the
-- design — why the tier lives here rather than in the auth role, and why policies
-- resolve role/verification from neon_auth rather than from JWT claims.
--
-- NOTE: assumes the Better Auth user table is neon_auth."user" with columns
-- `id` (uuid), `role` (text) and `"emailVerified"` (boolean). Confirm against
-- your project; adjust the names here if they differ.

create table if not exists public.user_profiles (
	user_id uuid primary key,
	tier text not null default 'everybody-else'
);

-- SECURITY DEFINER so policies can read role/verification from neon_auth without
-- granting the Data API's `authenticated` role access to that schema. Empty
-- search_path, so every name below is fully qualified.
create or replace function public.current_user_is_verified() returns boolean
	language sql stable security definer
	set search_path = '' as $$
		select coalesce(
			(select u."emailVerified" from neon_auth."user" u where u.id = auth.uid()),
			false
		);
$$;

create or replace function public.current_user_is_admin() returns boolean
	language sql stable security definer
	set search_path = '' as $$
		select coalesce(
			(select u.role = 'admin' and u."emailVerified"
				from neon_auth."user" u where u.id = auth.uid()),
			false
		);
$$;

-- The caller's effective tier (mirrors the app's resolveTier): stored profile
-- tier, else role-derived, else default. Verification is gated separately, so
-- this stays composable for future per-tier capability policies. Unused so far.
create or replace function public.current_user_tier() returns text
	language sql stable security definer
	set search_path = '' as $$
		select coalesce(
			(select p.tier from public.user_profiles p where p.user_id = auth.uid()),
			(
				select case when u.role = 'admin' then 'administrator' else 'everybody-else' end
				from neon_auth."user" u where u.id = auth.uid()
			),
			'everybody-else'
		);
$$;

revoke all on function public.current_user_is_verified() from public;
revoke all on function public.current_user_is_admin() from public;
revoke all on function public.current_user_tier() from public;
grant execute on function public.current_user_is_verified() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_tier() to authenticated;

-- Row Level Security: a user may always read their own row; only a VERIFIED admin
-- may read everyone's or write. An unverified user gets no elevated access even
-- if their Better Auth role is admin.
alter table public.user_profiles enable row level security;

drop policy if exists user_profiles_self_read on public.user_profiles;
create policy user_profiles_self_read on public.user_profiles
	for select
	to authenticated
	using (
		user_id = auth.uid()
		or public.current_user_is_admin()
	);

drop policy if exists user_profiles_admin_write on public.user_profiles;
create policy user_profiles_admin_write on public.user_profiles
	for all
	to authenticated
	using (public.current_user_is_admin())
	with check (public.current_user_is_admin());

-- Expose the table to the Data API role for signed-in users.
grant select, insert, update on public.user_profiles to authenticated;
