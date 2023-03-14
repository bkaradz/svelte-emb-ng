<script lang="ts">
	type $$Props = Partial<HTMLSelectElement> & {
		selected: string;
		list: Array<any>;
		selectChange: Function;
	};
	export let selected = '';
	export let list: Partial<{ name: string }>[] = [];
	export let selectChange: Function;
</script>

<select
	class="input"
	bind:value={selected}
	on:change|preventDefault={(e) => selectChange}
	{...$$restProps}
>
	{#each list as item}
		<option value={item}>
			{item.name}
		</option>
	{/each}
</select>

<style>
</style>
