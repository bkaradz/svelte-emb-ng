<script lang="ts">
	import '../../../styles/app.css';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Loading from '$lib/components/Loading.svelte';
	import type { User } from '$lib/types';

	export let data: { user: User };

	$: if (!data.user) {
		if (browser) {
			goto('/auth/signIn');
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
