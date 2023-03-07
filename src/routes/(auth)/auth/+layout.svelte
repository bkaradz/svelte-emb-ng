<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loading from '$lib/components/Loading.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import type { User } from '$lib/types';
	import { svgLogin, svgRegister } from '$lib/utility/svgLogos';
	import '../../../styles/app.css';

	export let data: { user: User };

	$: if (data.user) {
		if (browser) {
			goto('/');
		}
	}

	let isPageLoading = false;

	const navList = [
		{
			url: '/auth/login',
			name: 'Login',
			icon: svgLogin
		},
		{
			url: '/auth/register',
			name: 'Register',
			icon: svgRegister
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
