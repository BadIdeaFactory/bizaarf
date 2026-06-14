<script lang="ts">
	import { isAdmin, TIERS, type UserTier } from '../roles';
	import { session } from '../session.svelte';
	import { listUsers, setUserTier, type AdminUser } from '../users';
	import RequireAdmin from './RequireAdmin.svelte';

	let users = $state<AdminUser[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let savingId = $state<string | null>(null);
	let loaded = false;

	const load = async () => {
		loading = true;
		error = null;
		try {
			users = await listUsers();
		} catch (caught) {
			error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			loading = false;
		}
	};

	// Load the list only once the session resolves to an admin (so we never fire
	// an admin-only request as an anonymous or non-admin user).
	$effect(() => {
		if (!loaded && session.status === 'authed' && isAdmin(session.user?.role)) {
			loaded = true;
			void load();
		}
	});

	const changeTier = async (user: AdminUser, tier: UserTier) => {
		savingId = user.id;
		error = null;
		try {
			await setUserTier(user.id, tier);
			await load();
		} catch (caught) {
			error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			savingId = null;
		}
	};
</script>

<RequireAdmin>
	<section class="admin">
		<h1>User management</h1>
		{#if error}<p class="error">{error}</p>{/if}
		{#if loading}
			<p>Loading users…</p>
		{:else if users.length === 0}
			<p>No users yet.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Verified</th>
						<th>Tier</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user (user.id)}
						<tr>
							<td>{user.name}</td>
							<td>{user.email}</td>
							<td>{user.emailVerified ? 'Yes' : 'No'}</td>
							<td>
								<select
									aria-label={`Tier for ${user.email}`}
									value={user.tier}
									disabled={savingId === user.id}
									onchange={(event) => {
										void changeTier(
											user,
											event.currentTarget.value as UserTier,
										);
									}}
								>
									{#each TIERS as option (option.tier)}
										<option value={option.tier}>{option.label}</option>
									{/each}
								</select>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</RequireAdmin>

<style>
	.admin {
		width: min(60rem, 92vw);
		margin: 2rem auto;
		padding: 0 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.6rem 0.5rem;
		text-align: left;
		border-bottom: 1px solid #27272a;
	}

	th {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #a1a1aa;
	}
</style>
