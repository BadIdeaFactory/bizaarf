# User tiers

bizaarf has five user tiers (from
[issue #3](https://github.com/BadIdeaFactory/bizaarf/issues/3)):

1. **Administrators** — full control; can set any user's tier.
2. **Corporate Overlords**
3. **Members**
4. **Accomplices**
5. **Everybody Else** — the default for every new account.

The taxonomy lives in [`src/lib/roles.ts`](../src/lib/roles.ts).

## How tiers are stored

Neon Auth's managed admin plugin only recognises **two** Better Auth roles,
`admin` and `user`. So we can't put five tiers in the auth role field. Instead:

- **Better Auth role** gates administrator access only:
  - Administrators → role `admin` (required to call the admin APIs).
  - Everyone else → role `user`.
- **The fine-grained tier** is stored per user in the **`user_profiles`** table
  (`user_id` → `tier`), served via the Data API. Rows are created lazily the
  first time an admin assigns a tier.

`resolveTier(profileTier, role)` computes the effective tier: the stored profile
tier if present, otherwise a fallback from the role (`admin` → Administrator,
else Everybody Else). This means a user with no profile row still resolves
sensibly, and the bootstrapped first admin shows as Administrator without needing
a profile row.

Setting a tier (`setUserTier` in [`src/lib/users.ts`](../src/lib/users.ts))
writes **both**: the auth role (`admin`/`user`) and the `user_profiles.tier`.

## Bootstrapping the first administrator

There is no automatic promotion yet, and the in-app admin UI requires you to
already be an admin — so the first one is set in the Neon Console:

1. Sign up normally in the app.
2. In the Neon Console, go to **Auth → Users**, find the user, open the
   three-dot (⋯) menu, and choose **Make admin** (sets the Better Auth `role`
   to `admin`).
3. **Sign out and back in** so a fresh JWT carries the new role, then you'll see
   **Users** in the header and can set anyone's tier from there.

## Where access is actually enforced

Frontend checks (`isAdmin`, `RequireAdmin`) are **UX only**. Real enforcement is
server-side, and the Data API JWT carries only identity (`sub`, `email`, and a
`role` claim hard-set to the Postgres role `authenticated`) — **not** the Better
Auth admin role and **not** email-verified status. So authorization is resolved
from the authoritative `neon_auth."user"` row, not from token claims:

- **Data API (`user_profiles`, and future tables): RLS.** Migration `0001` adds
  `SECURITY DEFINER` helpers `public.current_user_is_admin()` /
  `current_user_is_verified()` that read `role` + `"emailVerified"` from
  `neon_auth."user"`. Elevated access requires a **verified admin**, so an
  unverified user — even one whose role is `admin` — gets no special data access.

- **Neon Auth admin API (`listUsers` / `setRole`): role-gated by Neon**, not
  under our RLS, and it does **not** check email verification (managed; we can't
  add that). Practical consequence: an unverified admin could still call those
  endpoints, but the `user_profiles` write that an admin tier-change also makes
  is RLS-blocked until they verify. To keep this clean, **only promote verified
  users to admin**. The nuclear option — Console **"require email verification to
  sign in"** — blocks unverified users entirely (no session, no JWT, no API), but
  that removes the logged-in "unverified" banner UX, so we keep verification
  optional and enforce via RLS instead.

### Future per-tier capabilities

Capabilities that don't exist yet (members create projects, corporate overlords
approve them, …) follow one shape: combine **verification** (from `neon_auth`)
with **tier** (from `user_profiles`) in the table's RLS policy. The `0001`
helpers — `current_user_is_verified()` and `current_user_tier()` — are the
building blocks, so an unverified user is denied every elevated capability:

```sql
-- members and up may create projects, but only once verified
create policy projects_insert on public.projects
	for insert to authenticated
	with check (
		public.current_user_is_verified()
		and public.current_user_tier() in
			('member', 'accomplice', 'corporate-overlord', 'administrator')
	);

-- only verified corporate overlords (and admins) may approve
create policy projects_approve on public.projects
	for update to authenticated
	using (
		public.current_user_is_verified()
		and public.current_user_tier() in ('corporate-overlord', 'administrator')
	);
```

## Enforced now vs. deferred

- **Now:** account creation, login, the admin user-management view, and storing /
  displaying each user's tier.
- **Deferred** (lands with the projects work): per-tier capabilities (idea
  submission limits, approvals, BIF/“glitz” highlighting) and **automatic**
  admin elevation for a verified email domain (e.g. `@biffud.com`).
