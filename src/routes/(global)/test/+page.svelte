<script lang="ts">
	export let data;

	const embroideryTypes = data.embroideryTypes;

	const dataArray = [
		{ embroideryTypes: '' },
		{ embroideryTypes: '' },
		{ embroideryTypes: '' },
		{ embroideryTypes: '' },
		{ embroideryTypes: '' }
	];
	$: console.log('🚀 ~ file: +page.svelte:13 ~ dataArray:', dataArray);

	// on:change|preventDefault={() => handleEmbroideryType(item)}
</script>

<h1>Test</h1>
<div>
	{#each dataArray as item}
		{#if embroideryTypes}
			<select
				bind:value={item.embroideryTypes}
				class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
			>
				{#each embroideryTypes as type}
					<option value={type.value}>
						{type.label}
					</option>
				{/each}
			</select>
		{/if}
	{/each}
</div>

<style lang="postcss">
</style>
