<script>
	export let size = '';
	export let type = '';
	export let outlined = '';
</script>

<button class="btn {size} {type} {outlined}" on:click>
	<slot />
</button>
