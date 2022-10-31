<script lang="ts">
	import '../../../styles/app.css';
	import { page } from '$app/stores';
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
</script>

{#if !isPageLoading}
	<slot />
{:else}
	<Loading />
{/if}
