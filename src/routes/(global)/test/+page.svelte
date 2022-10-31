<script lang="ts">
	import trpcClient from '$lib/client/trpc';
	import { onMount } from 'svelte';

	onMount(async () => {
		const greeting = await trpcClient.query('trpc:hello');
		console.log(greeting.json); // => 👈 world
	});
</script>

<h1>Test</h1>

<style lang="postcss">
</style>
