<script lang="ts">
	type $$Props = Partial<HTMLSelectElement> & {
		selected: string;
		list: Array<any>;
		selectChange: Function;
	};
	export let selected = '';
	export let list = [];
	export let selectChange;
</script>

<select
	class="input"
	bind:value={selected}
	on:change|preventDefault={selectChange}
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
