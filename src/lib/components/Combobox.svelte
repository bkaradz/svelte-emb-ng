<script lang="ts">
	import { selectTextOnFocus, blurOnEscape } from '$lib/utility/inputSelectDirective';
	import { clickOutside } from '$lib/utility/clickOutside';
	import { svgLoaderSmall, svgSelector, svgXSmall } from '$lib/utility/svgLogos';

	// interface disabledInterface {
	// 	disabled?: boolean;
	// }
	export let label = '';
	export let name = '';
	export let value = { name: '' };
	export let list: Array<any | null> = [];
	export let pending = false;
	export let messages = [];
	export let validityClass = '';
	export let disabled = false;
	export let onInput = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {};

	let userEnter = false;

	let highlightIndex = -1;

	let showList = false;

	function handleShowList() {
		if (showList) {
			showList = false;
		}
	}

	const heandleReset = () => {
		if (!userEnter) {
			value = { name: '' };
		}
		highlightIndex = -1;
		userEnter = false;
	};

	async function handleKeyDown(event: { key: any }) {
		const listLenght = list.length;
		switch (event.key) {
			case 'Escape':
				showList = false;
				break;
			case 'Backspace':
				showList = true;
				break;
			case 'Enter':
				value = list[highlightIndex];
				userEnter = true;
				showList = false;
				highlightIndex = -1;
				break;
			case 'ArrowUp':
				showList = true;
				highlightIndex <= 0 ? (highlightIndex = 0) : (highlightIndex -= 1);
				break;
			case 'ArrowDown':
				showList = true;
				highlightIndex === listLenght - 1
					? (highlightIndex = listLenght - 1)
					: (highlightIndex += 1);
				break;
			default:
				break;
		}
	}

	// const makeMatchBold = (searchMatchString: string) => {
	// 	let MatchedWords = [];
	// 	if (value.name) {
	// 		const regex = new RegExp(value.name, 'ig');
	// 		MatchedWords = searchMatchString.trim().match(regex);
	// 	}

	// 	let makeBold = `<strong>${MatchedWords[0]}</strong>`;
	// 	let boldedStr = searchMatchString.replace(MatchedWords[0], makeBold);

	// 	return boldedStr;
	// };

	if (!disabled) {
		list.length ? (disabled = false) : (disabled = true);
	}
</script>

<!-- ###################################################### -->
<div class="w-full">
	<div class="bg-transparent">
		<div class="mx-auto">
			<label for={name} class="flex justify-between text-sm text-pickled-bluewood-600">
				<span class="text-sm">{label}</span>
				{#if messages.length}
					<span class="validation-message text-sm">{messages[0]}</span>
				{/if}
			</label>
			<div class={`${validityClass} input relative p-0`}>
				<div class="flex items-center  bg-white">
					<!-- ComboBox Input -->
					<input
						use:selectTextOnFocus
						use:blurOnEscape
						bind:value={value.name}
						on:keydown={handleKeyDown}
						on:focus|preventDefault={() => (showList = true)}
						on:click|preventDefault={() => (showList = true)}
						on:input|preventDefault={(e) => onInput(e)}
						autocomplete="off"
						{name}
						id="select"
						class="input border-transparent"
						type="text"
						{disabled}
						{...$$restProps}
					/>
					<!-- Loader -->
					{#if pending}
						<div class="icons pointer-events-none border-none">
							{@html svgLoaderSmall}
						</div>
					{/if}
					<!-- Reset Button -->
					<button on:click|preventDefault={heandleReset} class="icons">
						{@html svgXSmall}
					</button>
					<!-- Dropdown Label -->
					<label for="show_more" class="icons">
						{@html svgSelector}
					</label>
				</div>

				<input
					type="checkbox"
					name="show_more"
					id="show_more"
					class="peer hidden"
					bind:checked={showList}
				/>
				{#if list.length}
					<ul
						use:clickOutside
						on:clickOutside|preventDefault={handleShowList}
						class="list peer-checked:flex"
					>
						{#each list as listItem, index (listItem._id)}
							<li class="list--item group">
								<!-- svelte-ignore a11y-missing-attribute -->
								<a
									on:click|preventDefault={() => {
										value = listItem;
										showList = false;
									}}
									class="{index === highlightIndex
										? 'block border-l-4 border-transparent border-royal-blue-600 bg-pickled-bluewood-100'
										: ''} block border-l-4 border-transparent p-2 text-sm text-pickled-bluewood-600 hover:border-royal-blue-600 hover:bg-pickled-bluewood-100"
									>{listItem.name}</a
								>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.icons {
		@apply cursor-pointer border-l border-pickled-bluewood-200 px-1 text-pickled-bluewood-300 outline-none transition-all;
	}
	.icons:hover {
		@apply text-pickled-bluewood-600;
	}
	.icons:focus {
		@apply outline-none;
	}
	.list {
		@apply absolute z-50 mt-1 hidden w-full flex-col overflow-hidden border border-pickled-bluewood-200 bg-white shadow;
	}
	.list--item {
		@apply cursor-pointer border-t border-pickled-bluewood-200;
	}
	.list--item:first-child {
		@apply border-t-0;
	}
</style>
