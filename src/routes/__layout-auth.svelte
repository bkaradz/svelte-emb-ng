<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ session }) => {
		if (session?.user?.authenticated) {
			return {
				status: 302,
				redirect: '/'
			};
		}
		return {};
	};
</script>

<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Toasts from '$lib/components/Toasts.svelte';
	import { svgSignIn, svgSignUp } from '$lib/utility/svgLogos';
	import logo from '$lib/assets/logo.ico';
	import logger from '$lib/utility/logger';

	let isPageLoading = false;

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

<svelte:head>
	<!-- <link rel="icon" type="image/svg" href={icon-path} /> -->
	<link rel="icon" href={logo} />
</svelte:head>

{#if !isPageLoading}
	<div class="height_max flex flex-col items-center bg-pickled-bluewood-50">
		<div
			class="mb-16 flex h-[70px] w-screen flex-row items-center justify-center bg-pickled-bluewood-100 drop-shadow-md"
		>
			<ul class="flex flex-row pl-1">
				{#each navList as tag (tag.name)}
					<li>
						<a
							class="m-1 flex appearance-none border bg-transparent px-3 py-2 font-semibold
						{$page.url.pathname === tag.url
								? `border-royal-blue-600 text-royal-blue-600 hover:border-success hover:text-success`
								: `border-pickled-bluewood-600 text-pickled-bluewood-600 hover:border-success hover:text-success`}
						"
							href={tag.url}
						>
							<span class="">{@html tag.icon}</span>
							<span class="ml-1">{tag.name}</span>
						</a>
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
	.loader {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: grid;
		place-items: center;
		background: whitesmoke;
		z-index: 99999;
	}
	.svgHeight {
		width: 100px;
		height: 100px;
		color: blue;
	}
</style>
