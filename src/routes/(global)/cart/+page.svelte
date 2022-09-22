<script lang="ts">
	import { format } from '$lib/services/monetary';
	import { cartItem } from '$lib/stores/cart.store';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';

	let products: any[] = [];
	$: console.log('🚀 ~ file: +page.svelte ~ line 7 ~ products', products);

	const getProducts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/cart.json?' + searchParams.toString());
			products = await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	onMount(() => {
		const query = {
			id: [...$cartItem].join(',')
		};
		getProducts(query);
	});

	let canDecrease = false;
	const removeItem = (item) => {};
	const onDecrease = (params) => {};
	const onIncrease = (params) => {};
</script>

<div class="container">
	<div class="cart">
		{#each products as item (item.id)}
			<div class="flex items-center px-6 py-5 hover:bg-pickled-bluewood-200">
				<div class="flex w-2/5">
					<!-- <div class="flex items-center flex-none w-20 p-2 bg-white rounded xl:w-24">
          <img
            class="object-contain h-12 mx-auto xl:h-16"
            src={item.image}
            alt=""
          />
        </div> -->
					<div class="flex flex-col items-start justify-between flex-grow ml-4">
						<div>
							<h2 class="mb-1 text-sm font-bold">{item.name}</h2>
							<!-- <h3 class="text-sm mb-1.5">{item.brand}</h3> -->
						</div>
						<button
							on:click={() => removeItem(item)}
							class="text-xs font-semibold text-left text-gray-500 transition-colors ease-in-out hover:text-danger"
						>
							Remove
						</button>
					</div>
				</div>
				<div class="flex justify-end w-1/5">
					<button
						class="border rounded px-1 {!canDecrease
							? 'border-gray-500 cursor-not-allowed opacity-10'
							: 'border-gray-200 hover:bg-gray-200'}"
						disabled={!canDecrease}
						on:click={() => onDecrease(item)}
						aria-label="Decrease amount"
					>
						{@html `<svg
							class="w-4 text-gray-600 fill-current"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
						</svg>`}
					</button>
					<div class="w-8 mx-2 text-center">{item?.amount}</div>
					<button
						class="px-1 border border-gray-200 rounded hover:bg-gray-200"
						on:click={() => onIncrease(item)}
						aria-label="Increase amount"
					>
						{@html `<svg
							class="w-4 text-gray-600 fill-current"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>`}
					</button>
				</div>
				<span class="w-1/5 text-sm font-semibold text-right">
					{item?.quantity}
				</span>
				<span class="w-1/5 text-sm font-semibold text-right">
					{format(item.unitPrice)}
				</span>
			</div>
		{/each}
	</div>
	<div class="customer">
		<h1>customer</h1>
	</div>
</div>

<style lang="postcss">
	.container {
		display: flex;
		margin-inline: auto;
	}
	.cart {
		flex-grow: 8;
		border-radius: 4px 0 0 4px;
		@apply bg-pickled-bluewood-50 p-4;
	}
	.customer {
		flex-grow: 4;
		border-radius: 0 4px 4px 0;
		@apply bg-pickled-bluewood-200 p-4;
	}
</style>
