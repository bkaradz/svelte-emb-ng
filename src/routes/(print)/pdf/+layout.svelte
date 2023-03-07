<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import type { User } from '$lib/types';
	import '../../../styles/app.css';

	export let data: { user: User };

	$: if (!data.user) {
		if (browser) {
			goto('/auth/login');
		}
	}
	$: if (data.user) {
		isPageLoading = false;
	}

	let isPageLoading = true;
</script>

{#if !isPageLoading}
	<slot />
{:else}
	<Loading />
{/if}
