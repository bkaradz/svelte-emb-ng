<script lang="ts">
	import Combobox from '$lib/components/Combobox.svelte';
	import { format } from '$lib/services/monetary';
	import { cartItem } from '$lib/stores/cart.store';
	import logger from '$lib/utility/logger';
	import { svgCart } from '$lib/utility/svgLogos';
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
	let embroideryPositions;
	let embroideryTypes;
	let customers;
	let pricelists;
	let pricelistValue;
	let customerQueryParams = {
		limit: 7,
		page: 1
	};

	const getOptions = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/options.json?' + searchParams.toString());
			return await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	const getCustomers = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			return await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	const getPricelists = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/pricelists.json?' + searchParams.toString());
			const jsonRes = await res.json();
			const defaultPricelist = jsonRes.find((list) => list.isDefault === true);
			pricelistValue = defaultPricelist.id;
			return jsonRes;
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	onMount(async () => {
		embroideryTypes = await getOptions({ group: 'embroideryTypes' });
		embroideryPositions = await getOptions({ group: 'embroideryPositions' });
		customers = await getCustomers(customerQueryParams);
		pricelists = await getPricelists({});
	});

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

	const handleChange = () => {};

	let customerSearch: any = { name: null };

	const handleComboInput = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		customerQueryParams = {
			...customerQueryParams,
			name: (event.target as HTMLInputElement).value
		};
		customers = await getCustomers(customerQueryParams);
	};
</script>

<div class="w-full flex">
	<div class="cart">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Shopping cart</h1>
			<div class="flex items-center">
				<label class="mr-3 text-sm whitespace-nowrap">
					Select a currency
					<select
						class="py-1 pl-1 text-sm border-gray-300 rounded-md shadow-sm pr-7 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
						id="currency"
						name="currency"
						bind:value={selectedCurrency}
					>
						{#each currencies as currency}
							<option value={currency}>
								{`${currency.symbol}, ${currency.currency}`}
							</option>
						{/each}
					</select>
				</label>
			</div>
		</div>
		{#if Array.from($cartItem.values()).length > 0}
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
							<!-- {item?.embroideryTypes} -->
							{#if embroideryTypes}
								<select
									bind:value={item.embroideryTypes}
									on:change|preventDefault={handleChange}
									class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
								>
									{#each embroideryTypes as type}
										<option value={type.value}>
											{type.name}
										</option>
									{/each}
								</select>
							{/if}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							<!-- {item?.embroideryPositions} -->
							{#if embroideryPositions}
								<select
									bind:value={item.embroideryPositions}
									on:change|preventDefault={handleChange}
									class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
								>
									{#each embroideryPositions as type}
										<option value={type.value}>
											{type.name}
										</option>
									{/each}
								</select>
							{/if}
						</span>
						<div class="flex justify-end w-1/6">
							<button
								class="border rounded px-1 bg-royal-blue-200 {!(item.amount > 1)
									? 'border-royal-blue-700 cursor-not-allowed opacity-10'
									: 'border-royal-blue-500 hover:bg-royal-blue-300'}"
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
								class="px-1 border bg-royal-blue-200 border-royal-blue-500 rounded hover:bg-royal-blue-300"
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
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Order summary</h1>
			<div class="relative mx-2">
				{@html svgCart}
				<span
					class="absolute top-0 right-0 -mt-1.5 -mr-2 bg-blue-200 text-blue-700 font-normal rounded-full px-1 text-xs"
				>
					<!-- {items.length > 0 && count} -->
				</span>
			</div>
		</div>

		<div class="mt-8">
			<div class="flex flex-col my-5 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="orderNo">Order Number</label>
				<input class="grow input" type="text" name="orderNo" id="orderNo" />
			</div>
			<div class="flex justify-between my-5 text-sm font-medium uppercase">
				{#if customers}
					<!-- <Combobox label="Customer" list={customers.results} /> -->
					<Combobox
						label="Customer"
						name="customer"
						list={customers.results}
						bind:value={customerSearch}
						onInput={handleComboInput}
					/>
				{/if}
			</div>
			<div class="flex flex-col my-5 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="pricelist">Pricelist</label>
				{#if pricelists}
					<select
						name="pricelist"
						id="pricelist"
						bind:value={pricelistValue}
						on:change|preventDefault={handleChange}
						class="text-sm input grow"
					>
						{#each pricelists as pricelist}
							<option value={pricelist.id}>
								{pricelist.name}
							</option>
						{/each}
					</select>
				{/if}
			</div>
		</div>

		<div class="flex justify-between mt-10 mb-5 border-t border-royal-blue-500">
			<span class="text-sm font-medium uppercase pt-8">Subtotal</span>
			<span class="text-sm font-semibold">
				<!-- {format(subtotal)} -->
			</span>
		</div>
		<div class="flex justify-between mt-4 mb-5">
			<span class="text-sm font-medium uppercase"> VAT </span>
			<span class="text-sm font-semibold">
				<!-- {format(vatAmount)} -->
			</span>
		</div>

		<div class="mt-8 border-t border-royal-blue-500">
			<div class="flex justify-between my-5 text-sm font-medium uppercase">
				<span>Total</span>
				<!-- <span>{format(total)}</span> -->
			</div>
			<button
				class="w-full py-3 text-sm font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Create Order
			</button>
		</div>
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
		@apply bg-royal-blue-100 p-4;
	}
	.scrollHeight {
		height: calc(100% - 75px);
	}
	section {
		background-color: inherit;
	}
</style>
