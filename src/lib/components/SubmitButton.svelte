<script lang="ts">
	export let disabled: boolean;
	export let name: string;
</script>

<button
	{disabled}
	type="submit"
	class="relative flex w-full justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2"
>
	<span class="absolute inset-y-0 left-0 flex items-center pl-3">
		<slot />
	</span>
	{name}
</button>
