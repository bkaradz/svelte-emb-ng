<script>
	export let name = '';
	export let disabled = false;
	export let checked = false;
	export let label = '';
	export let onChange = () => {};
	export let validityClass;

	let style;

	if (validityClass === 'success') {
		style = `peer-checked:bg-success peer-focus:ring-success`;
	}

	if (validityClass === 'error') {
		style = `peer-checked:bg-error peer-focus:ring-error`;
	}
</script>

<div>
	<label for={name} class={`relative inline-flex items-center cursor-pointer ${validityClass}`}>
		<input
			type="checkbox"
			bind:checked
			{disabled}
			on:change={onChange}
			id={name}
			{name}
			class="peer sr-only"
		/>
		<div
			class={`toggle peer peer-checked:bg-royal-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-royal-blue-500 dark:border-pickled-bluewood-600 dark:bg-pickled-bluewood-700 dark:peer-focus:ring-royal-blue-800 ${style}`}
		/>
		<span class={`ml-3 text-sm font-medium text-pickled-bluewood-600 ${validityClass}`}
			>{label}</span
		>
	</label>
</div>

<style lang="postcss">
	.toggle {
		@apply h-6 w-11 rounded-full bg-pickled-bluewood-200;
	}

	.toggle::after {
		@apply absolute top-[2px] left-[2px] h-5 w-5 rounded-full border border-pickled-bluewood-300 bg-white transition-all content-[''];
	}
	.error {
		/* color: var(--color-error); */
		@apply text-error;
	}

	.success {
		/* color: var(--color-success); */
		@apply text-success;
	}
</style>
