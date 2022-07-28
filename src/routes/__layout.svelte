<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ session }) => {
		if (!session?.user?.authenticated) {
			return {
				status: 302,
				redirect: '/auth/signIn'
			};
		}
		return {};
	};
</script>

<script lang="ts">
	import { toggleMenu } from '$lib/stores/sideMenu.store';
	import Menu from '$lib/components/Menu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import '../styles/app.css';
	// import { goto } from '$app/navigation';
	import Toasts from '$lib/components/Toasts.svelte';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';

	// Ping to connect to database
	const pingHealthCheck = async () => {
		try {
			const res = await fetch('/api/healthcheck.json');
		} catch (err) {
			logger.error(err.message);
		}
	};

	onMount(() => {
		pingHealthCheck();
	});

	// async function redirectToLogin() {
	// 	if (typeof window !== 'undefined') {
	// 		await goto('/auth/signIn');
	// 	}
	// }
</script>

<div class="app flex h-screen {$toggleMenu ? 'big-menu' : 'small-menu'}">
	<SideMenu />
	<Menu />
	<main class="main z-0 flex flex-1 overflow-hidden bg-royal-blue-50 p-6">
		<Toasts />
		<slot />
	</main>
</div>

<style lang="postcss">
	.app {
		display: grid;
		width: 100vw;
		height: 100vh;
		grid-template-areas:
			'sidebar menu'
			'sidebar main';
		grid-template-rows: 70px 1fr;
	}

	.small-menu {
		grid-template-columns: 60px 1fr;
	}

	.big-menu {
		grid-template-columns: 200px 1fr;
	}

	.main {
		grid-area: main;
	}
	/* fixed top-20 right-4 z-50 flex flex-col opacity-50 */
</style>
