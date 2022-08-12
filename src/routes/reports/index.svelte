<script lang="ts">
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';

	let options: any[];
	let selected: any;
  $: console.log("🚀 ~ file: index.svelte ~ line 7 ~ selected", selected)

	onMount(() => {
		getOptions();
	});

	const filterOptionsGroup = (group: string) => {
		return options.filter((option: { group: string }) => option.group === group);
	};

	const getOptions = async () => {
		try {
			const res = await fetch('/api/options.json');
			options = await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};
</script>

<div>
	{#if options?.length}
		<select bind:value={selected}>
			{#each filterOptionsGroup('embroideryTypes') as item}
				<option value={item}>
					{item.name}
				</option>
			{/each}
		</select>
	{/if}
</div>

<style>
</style>
