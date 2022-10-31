<script lang="ts">
	import Menu from '$lib/components/Menu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import '../../styles/app.css';
	import Toasts from '$lib/components/Toasts.svelte';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Loading from '$lib/components/Loading.svelte';

	export let data: any;

	$: if (!data.user) {
		if (browser) {
			goto('/auth/signIn');
		}
	}
	$: if (data.user) {
		isPageLoading = false;
	}

	let isPageLoading = true;

	// Ping to connect to database
	const pingHealthCheck = async () => {
		try {
			const res = await fetch('/api/healthcheck.json');
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	onMount(() => {
		pingHealthCheck();
	});
</script>

{#if !isPageLoading}
	<div class="app flex h-screen small-menu">
		<SideMenu />
		<Menu />
		<main class="main z-0 flex flex-1 overflow-hidden bg-royal-blue-50 p-6">
			<Toasts />
			<slot />
		</main>
	</div>
{:else}
	<Loading />
{/if}

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

	.main {
		grid-area: main;
	}
</style>
