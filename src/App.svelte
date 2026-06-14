<script lang="ts">
	import BifLogo from './lib/BifLogo.svelte';

	const tagline =
		'A showcase of ideas and projects in various stages from the Bad Idea Factory community.';
</script>

<main>
	<a class="logo" href="https://biffud.com" rel="noopener">
		<BifLogo />
	</a>
	<h1>bizaarf</h1>
	<p class="tagline">{tagline}</p>
	<p class="status">The community project listing is under construction.</p>
</main>

<style>
	main {
		max-width: 40rem;
		padding: 2rem;
		text-align: center;
	}

	.logo {
		display: inline-block;
		width: min(20rem, 80vw);
		color: #f4f4f5;
		transition: opacity 150ms ease;
	}

	.logo:hover,
	.logo:focus-visible {
		opacity: 0.7;
	}

	.logo :global(svg) {
		width: 100%;
		height: auto;
	}

	h1 {
		margin: 1.5rem 0 1rem;
		font-size: clamp(2.5rem, 8vw, 4rem);
	}

	.tagline {
		font-size: 1.125rem;
		color: #d4d4d8;
	}

	.status {
		margin-top: 2rem;
		font-size: 0.9rem;
		color: #71717a;
	}
</style>
