<script lang="ts">
	import { format } from '$lib/services/monetary';
	import { cartItem } from '$lib/stores/cart.store';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';

	const currencies = [
		{
			currency: 'USD',
			symbol: '$'
		},
		{
			currency: 'EUR',
			symbol: '€'
		}
	];

	let selectedCurrency;

	let canDecrease = false;
	const removeItem = (item) => {
		cartItem.remove(item);
	};
	const onDecrease = (item) => {
		cartItem.update(item, { amount: item.amount > 1 ? item.amount - 1 : 1 });
	};
	const onIncrease = (item) => {
		cartItem.update(item, { amount: item.amount + 1 });
	};
</script>

<div class="w-full flex">
	<div class="cart">
		{#if Array.from($cartItem.values()).length > 0}
			<div class="flex items-center justify-between pb-5 border-b">
				<h1 class="text-2xl font-semibold capitalize">Shopping cart</h1>
				<div class="flex items-center">
					<label class="mr-3 text-sm whitespace-nowrap">
						Select a currency
						<select 
						class="py-1 pl-1 text-sm border-gray-300 rounded-md shadow-sm pr-7 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
						 id="currency" name="currency" bind:value={selectedCurrency}>
							{#each currencies as currency}
								<option value={currency}>
									{`${currency.symbol}, ${currency.currency}`}
								</option>
							{/each}
						</select>
					</label>
				</div>
			</div>
			<div class="flex px-6 mt-5 mb-5">
				<span class="w-2/6 text-xs font-semibold tracking-wide text-gray-500 uppercase">
					Product
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Stitches
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Emb Type
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Emb Position
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Quantity
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Price
				</span>
				<span class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase">
					Total
				</span>
			</div>
			<div class="scrollHeight overflow-y-auto">
				{#each Array.from($cartItem.values()) as item (item.id)}
					<div class="flex items-center px-6 py-5 hover:bg-pickled-bluewood-200">
						<div class="flex w-2/6">
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
						<span class="w-1/6 text-sm font-semibold text-right">
							{item?.stitches}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{item?.embroideryTypes}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{item?.embroideryPositions}
						</span>
						<div class="flex justify-end w-1/6">
							<button
								class="border rounded px-1 {!(item.amount > 1)
									? 'border-gray-500 cursor-not-allowed opacity-10'
									: 'border-gray-200 hover:bg-gray-200'}"
								disabled={!(item.amount > 1)}
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
						<span class="w-1/6 text-sm font-semibold text-right">
							{item?.quantity}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{format(item.unitPrice)}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="customer">
		<h1>customer</h1>
	</div>
</div>

<style lang="postcss">
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
	.scrollHeight {
		height: calc(100% - 75px);
	}
</style>
