<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { signUpEmail } from '../auth';
	import { refreshSession, session } from '../session.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);
	let needsVerification = $state(false);

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		busy = true;
		error = null;
		const result = await signUpEmail(name, email, password);
		if (!result.ok) {
			error = result.error;
			busy = false;
			return;
		}
		// New accounts default to the "Everybody Else" tier (no profile row yet).
		await refreshSession();
		if (session.status === 'authed') {
			await push('/');
		} else {
			// Email verification is required before a session is issued.
			needsVerification = true;
			busy = false;
		}
	};
</script>

<section class="card">
	<h1>Create an account</h1>
	{#if needsVerification}
		<p>
			Account created. Check your email to verify your address, then
			<a href="#/login">log in</a>.
		</p>
	{:else}
		<form onsubmit={submit}>
			<div class="field">
				<label for="signup-name">Name</label>
				<input
					id="signup-name"
					type="text"
					autocomplete="name"
					bind:value={name}
					required
				/>
			</div>
			<div class="field">
				<label for="signup-email">Email</label>
				<input
					id="signup-email"
					type="email"
					autocomplete="email"
					bind:value={email}
					required
				/>
			</div>
			<div class="field">
				<label for="signup-password">Password</label>
				<input
					id="signup-password"
					type="password"
					autocomplete="new-password"
					bind:value={password}
					required
				/>
			</div>
			{#if error}<p class="error">{error}</p>{/if}
			<button type="submit" disabled={busy}>
				{busy ? 'Creating…' : 'Create account'}
			</button>
		</form>
		<p class="alt">
			Already have an account? <a href="#/login">Log in</a>.
		</p>
	{/if}
</section>

<style>
	.card {
		width: min(24rem, 90vw);
		margin: 4rem auto;
		padding: 2rem;
	}

	h1 {
		margin-top: 0;
	}

	.alt {
		margin-top: 1.25rem;
		font-size: 0.9rem;
		color: #d4d4d8;
	}
</style>
