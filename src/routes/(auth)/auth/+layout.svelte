<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../../../styles/app.css';
	import Toasts from '$lib/components/Toasts.svelte';
	import { svgSignIn, svgSignUp } from '$lib/utility/svgLogos';
	import logger from '$lib/utility/logger';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if ($page.data?.user?.authenticated) {
		if (browser) {
			goto('/');
		}
	}

	let isPageLoading = false;

	// Ping to connect to database
	const pingHealthCheck = async () => {
		try {
			const res = await fetch('/api/healthcheck.json');
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	onMount(() => {
		pingHealthCheck();

		// setTimeout(function () {
		// 	isPageLoading = false;
		// }, 450);
	});

	const navList = [
		{
			url: '/auth/signIn',
			name: 'Sign In',
			icon: svgSignIn
		},
		{
			url: '/auth/signUp',
			name: 'Sign Up',
			icon: svgSignUp
		}
	];
</script>

<svelte:head />

{#if !isPageLoading}
	<div class="height_max flex flex-col items-center bg-pickled-bluewood-50">
		<div
			class="mb-16 flex h-[70px] w-screen flex-row items-center justify-end bg-pickled-bluewood-100 drop-shadow-md"
		>
			<ul class="flex flex-row pl-1 mr-2">
				{#each navList as tag (tag.name)}
					<li>
						{#if !($page.url.pathname === tag.url)}
							<a
								class="m-1 flex appearance-none border px-5 py-1 font-semibold btn btn-primary"
								href={tag.url}
							>
								<span class="">{@html tag.icon}</span>
								<span class="ml-1">{tag.name}</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
		<Toasts />
		<slot />
	</div>
{:else}
	<Loading />
{/if}

<style lang="postcss">
	.height_max {
		height: 100vh !important;
	}
</style>
