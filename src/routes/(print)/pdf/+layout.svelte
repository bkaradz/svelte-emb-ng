<script lang="ts">
	
	import Loading from '$lib/components/Loading.svelte';
	import '../../../styles/app.css';

	export let data;

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
