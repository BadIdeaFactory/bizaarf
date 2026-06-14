<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { isAdmin, tierLabel } from '../roles';
	import { refreshSession, session } from '../session.svelte';
	import { signOut } from '../auth';

	let menuOpen = $state(false);
	let menuWrap = $state<HTMLElement>();

	const closeMenu = () => {
		menuOpen = false;
	};

	// Close when clicking anywhere outside the menu, or pressing Escape.
	const onPointerDown = (event: PointerEvent) => {
		if (menuOpen && menuWrap && !menuWrap.contains(event.target as Node)) {
			menuOpen = false;
		}
	};
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			menuOpen = false;
		}
	};

	const logOut = async () => {
		menuOpen = false;
		await signOut();
		await refreshSession();
		await push('/');
	};
</script>

<svelte:window onpointerdown={onPointerDown} onkeydown={onKeyDown} />

<header>
	<a class="brand" href="#/" onclick={closeMenu}>bizaarf</a>

	<div class="right">
		{#if session.status === 'authed' && session.user}
			<span class="who">
				<span class="email">{session.user.email}</span>
				{#if !session.user.emailVerified}
					<span class="badge unverified">unverified</span>
				{/if}
				<span class="badge tier">{tierLabel(session.user.tier)}</span>
			</span>
		{/if}

		{#if session.status !== 'loading'}
			<div class="menu-wrap" bind:this={menuWrap}>
				<button
					type="button"
					class="hamburger"
					aria-label="Menu"
					aria-expanded={menuOpen}
					aria-controls="app-menu"
					onclick={() => (menuOpen = !menuOpen)}
				>
					<span class="bars" class:open={menuOpen}></span>
				</button>

				{#if menuOpen}
					<nav id="app-menu" class="menu">
						{#if session.status === 'authed' && session.user}
							{#if isAdmin(session.user.role)}
								<a href="#/admin/users" onclick={closeMenu}>Users</a>
							{/if}
							<button type="button" onclick={logOut}>Sign out</button>
						{:else}
							<a href="#/login" onclick={closeMenu}>Log in</a>
							<a href="#/signup" onclick={closeMenu}>Sign up</a>
						{/if}
					</nav>
				{/if}
			</div>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1.5rem;
		border-bottom: 1px solid #27272a;
	}

	.brand {
		font-weight: 700;
		font-size: 1.15rem;
		color: #f4f4f5;
		text-decoration: none;
	}

	.right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.who {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #d4d4d8;
	}

	.email {
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badge {
		padding: 0.1rem 0.5rem;
		font-size: 0.75rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.tier {
		color: #c7d2fe;
		background: #312e81;
	}

	.unverified {
		color: #fde68a;
		background: #78350f;
	}

	.menu-wrap {
		position: relative;
	}

	.hamburger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		background: none;
		border: 1px solid #3f3f46;
		border-radius: 0.4rem;
		cursor: pointer;
	}

	.hamburger:hover {
		background: #18181b;
	}

	/* Three-bar icon drawn with the middle bar plus two box-shadow bars. */
	.bars,
	.bars::before,
	.bars::after {
		display: block;
		width: 1.1rem;
		height: 2px;
		background: #e4e4e7;
		transition: transform 150ms ease;
	}

	.bars {
		position: relative;
	}

	.bars::before,
	.bars::after {
		content: '';
		position: absolute;
		left: 0;
	}

	.bars::before {
		top: -6px;
	}

	.bars::after {
		top: 6px;
	}

	/* Morph into an X while the menu is open. */
	.bars.open {
		background: transparent;
	}

	.bars.open::before {
		transform: translateY(6px) rotate(45deg);
	}

	.bars.open::after {
		transform: translateY(-6px) rotate(-45deg);
	}

	.menu {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		min-width: 9rem;
		padding: 0.35rem;
		background: #18181b;
		border: 1px solid #3f3f46;
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
	}

	.menu a,
	.menu button {
		padding: 0.5rem 0.65rem;
		font: inherit;
		font-size: 0.9rem;
		text-align: left;
		color: #e4e4e7;
		text-decoration: none;
		background: none;
		border: none;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.menu a:hover,
	.menu button:hover {
		background: #27272a;
	}
</style>
