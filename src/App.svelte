<script lang="ts">
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router';
	import { refreshSession, session } from './lib/session.svelte';
	import Header from './lib/components/Header.svelte';
	import Home from './lib/components/Home.svelte';
	import Login from './lib/components/Login.svelte';
	import SignUp from './lib/components/SignUp.svelte';
	import AdminUsers from './lib/components/AdminUsers.svelte';
	import EmailVerification from './lib/components/EmailVerification.svelte';

	const routes = {
		'/': Home,
		'/login': Login,
		'/signup': SignUp,
		'/admin/users': AdminUsers,
		'*': Home,
	};

	onMount(() => {
		void refreshSession();
	});
</script>

<Header />

{#if session.status === 'authed' && session.user && !session.user.emailVerified}
	<EmailVerification />
{/if}

<main>
	<Router {routes} />
</main>

<style>
	main {
		display: grid;
		place-items: start center;
	}
</style>
