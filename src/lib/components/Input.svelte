<script lang="ts">
	import { selectTextOnFocus, blurOnEscape } from '$lib/utility/inputSelectDirective';
	import { svgLoaderSmall } from '$lib/utility/svgLogos';
	export let value = null;
	export let disabled = false;
	export let type = 'text';
	export let label = '';
	export let name = '';
	export let pending = false;
	export let messages = [];
	export let validityClass = '';
	export let onInput = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {};

	function typeAction(node: HTMLInputElement) {
		node.type = type;
	}
</script>

<div class:pending class={`${validityClass} form-input`}>
	<label for={name}>
		<span class="text-sm text-pickled-bluewood-600">{label}</span>
		{#if messages.length}
			<span class="validation-message text-sm">{messages[0]}</span>
		{/if}
	</label>
	<div class="relative">
		{#if pending}
			<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center pl-3">
				{@html svgLoaderSmall}
			</div>
		{/if}
		<input
			{name}
			use:selectTextOnFocus
			use:blurOnEscape
			bind:value
			{disabled}
			on:input={(e) => onInput(e)}
			use:typeAction
			id={name}
			class="input"
			autocomplete="off"
		/>
	</div>
</div>

<style lang="postcss">
	/* input:focus {
		border-color: steelblue;
	} */
	div {
		@apply border-none bg-transparent text-color;
	}
	label {
		@apply block;
	}

	.form-input {
		@apply relative py-0 px-0;
	}

	.form-input label {
		@apply block;
	}

	.form-input .validation-message {
		@apply float-right font-normal;
	}

	.form-input input {
		@apply border border-inactive bg-white text-active transition duration-200;
	}

	.form-input input:focus {
		@apply border border-royal-blue-500;
	}

	.form-input.success .validation-message {
		@apply text-success;
	}

	.form-input.warning .validation-message {
		@apply text-warning;
	}

	.form-input.error .validation-message {
		@apply text-error;
	}

	.form-input.success input {
		@apply border border-success text-success;
	}

	.form-input.warning input {
		@apply border border-warning text-warning;
	}

	.form-input.error input {
		@apply border border-error text-error;
	}
</style>
