<script lang="ts">
	import { sendVerificationCode, verifyEmailCode } from '../auth';
	import { refreshSession, session } from '../session.svelte';

	const email = $derived(session.user?.email ?? '');

	let codeSent = $state(false);
	let otp = $state('');
	let busy = $state(false);
	let notice = $state<string | null>(null);
	let error = $state<string | null>(null);

	const send = async () => {
		busy = true;
		error = null;
		notice = null;
		const result = await sendVerificationCode(email);
		busy = false;
		if (result.ok) {
			codeSent = true;
			notice = `We emailed a verification code to ${email}.`;
		} else {
			error = result.error;
		}
	};

	const verify = async (event: SubmitEvent) => {
		event.preventDefault();
		busy = true;
		error = null;
		notice = null;
		try {
			const result = await verifyEmailCode(email, otp.trim());
			if (result.ok) {
				// Refreshing flips emailVerified → this banner stops rendering.
				await refreshSession();
			} else {
				error = result.error;
			}
		} finally {
			busy = false;
		}
	};
</script>

<div class="banner" role="status">
	<div class="message">
		<strong>Email not verified.</strong>
		<span>Verify {email} to confirm it's really you.</span>
	</div>

	{#if codeSent}
		<form class="verify" onsubmit={verify}>
			<input
				type="text"
				inputmode="numeric"
				autocomplete="one-time-code"
				placeholder="Enter code"
				aria-label="Verification code"
				bind:value={otp}
				required
			/>
			<button type="submit" disabled={busy}>
				{busy ? 'Verifying…' : 'Verify'}
			</button>
			<button type="button" class="link" onclick={send} disabled={busy}>
				Resend
			</button>
		</form>
	{:else}
		<button type="button" onclick={send} disabled={busy}>
			{busy ? 'Sending…' : 'Send verification code'}
		</button>
	{/if}

	{#if notice}<p class="notice">{notice}</p>{/if}
	{#if error}<p class="error">{error}</p>{/if}
</div>

<style>
	.banner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		padding: 0.75rem 1.5rem;
		background: #422006;
		border-bottom: 1px solid #854d0e;
		color: #fde68a;
	}

	.message {
		display: flex;
		flex-direction: column;
		margin-right: auto;
	}

	.message span {
		font-size: 0.85rem;
		color: #fcd34d;
	}

	.verify {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.verify input {
		width: 9rem;
	}

	button.link {
		padding: 0;
		font: inherit;
		color: #fcd34d;
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
	}

	.notice {
		flex-basis: 100%;
		margin: 0;
		font-size: 0.85rem;
		color: #fcd34d;
	}

	.error {
		flex-basis: 100%;
		margin: 0;
	}
</style>
