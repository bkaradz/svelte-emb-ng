<script>
	export let size = '';
	export let type = '';
	export let outlined = '';
	export let name = '';
</script>

<button
	class="{name
		? `px-3`
		: `aspect-square`} {size} {type} {outlined} btn inline-flex items-center justify-center"
	on:click
>
	<span>
		<slot />
	</span>
	{#if name}
		<span class="ml-2">{name}</span>
	{/if}
</button>
