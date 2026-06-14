<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { signInEmail } from '../auth';
	import { refreshSession } from '../session.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let busy = $state(false);

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		busy = true;
		error = null;
		const result = await signInEmail(email, password);
		if (result.ok) {
			await refreshSession();
			await push('/');
		} else {
			error = result.error;
			busy = false;
		}
	};
</script>

<section class="card">
	<h1>Log in</h1>
	<form onsubmit={submit}>
		<div class="field">
			<label for="login-email">Email</label>
			<input
				id="login-email"
				type="email"
				autocomplete="email"
				bind:value={email}
				required
			/>
		</div>
		<div class="field">
			<label for="login-password">Password</label>
			<input
				id="login-password"
				type="password"
				autocomplete="current-password"
				bind:value={password}
				required
			/>
		</div>
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={busy}>
			{busy ? 'Logging in…' : 'Log in'}
		</button>
	</form>
	<p class="alt">
		No account? <a href="#/signup">Create one</a>.
	</p>
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
