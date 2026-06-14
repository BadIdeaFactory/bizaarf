<script lang="ts">
	import type { Snippet } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { isAdmin } from '../roles';
	import { session } from '../session.svelte';

	const { children }: { children: Snippet } = $props();

	const allowed = $derived(
		session.status === 'authed' && isAdmin(session.user?.role),
	);

	// Once the session has resolved, bounce anyone who isn't an admin: signed-out
	// visitors to the login page, signed-in non-admins back to the home page.
	$effect(() => {
		if (session.status === 'anon') {
			void push('/login');
		} else if (session.status === 'authed' && !isAdmin(session.user?.role)) {
			void push('/');
		}
	});
</script>

{#if allowed}
	{@render children()}
{:else if session.status === 'loading'}
	<p class="notice">Loading…</p>
{/if}

<style>
	.notice {
		padding: 4rem 2rem;
		text-align: center;
		color: #d4d4d8;
	}
</style>
