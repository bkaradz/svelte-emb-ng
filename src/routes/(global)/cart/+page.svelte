<script lang="ts">
	import Combobox from '$lib/components/Combobox.svelte';
	import { format } from '$lib/services/monetary';
	import { cartItem } from '$lib/stores/cart.store';
	import logger from '$lib/utility/logger';
	import { svgCart } from '$lib/utility/svgLogos';
	import { onMount } from 'svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import dayjs from 'dayjs';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import { add, dinero, multiply, toSnapshot } from 'dinero.js';

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

	const today = dayjs('2019-01-25').format('YYYY-MM-DDTHH:mm');
	type MainPricelist = {
		id?: number | null;
		customersID: number | null;
		pricelistsID: number | null;
		isActive: true;
		accountsStatus: string | null;
		orderDate: string | null;
		deliveryDate?: string | null;
		comment?: string;
		orderLine: any[];
	};

	let mainPricelist: MainPricelist = {
		id: null,
		customersID: null,
		pricelistsID: null,
		isActive: true,
		accountsStatus: null,
		orderDate: today,
		orderLine: Array.from($cartItem.values()) || []
	};

	let idValue = generateSONumber(mainPricelist.id);
	let selectedCurrency;
	let embroideryPositions;
	let embroideryTypes;
	let customers;
	let pricelists;

	let pricelistValue: number | undefined;
	let customerQueryParams = {
		limit: 7,
		page: 1
	};

	// const vat = 14.5;
	const vat = 0;

	const calculateVat = (vat, subTotal) => {
		return multiply(subTotal, { amount: vat, scale: 2 });
	};

	$: calclculatedVat = calculateVat(vat, subTotal);

	$: calclculatedTotal = add(calclculatedVat, subTotal);

	const calcSubTotal = (cart: any[]) => {
		const arrayTotals = cart.map((item) => dinero(item.total));
		if (!arrayTotals.length) {
			return;
		}
		const addMany = (addends) => addends.reduce(add);
		return addMany(arrayTotals);
	};

	const calcTotalCartItems = (cart: any[]) => {
		const arrayTotals = cart.map((item) => item.quantity);
		if (!arrayTotals.length) {
			return;
		}

		return arrayTotals.reduce((accumulator, quantity) => accumulator + quantity);
	};

	$: totalCartItems = calcTotalCartItems(Array.from($cartItem.values()));

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
			mainPricelist.pricelistsID = defaultPricelist.id;
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
		handleChange();
	});

	$: mainPricelist.orderLine = Array.from($cartItem.values());

	const removeItem = (item) => {
		cartItem.remove(item);
	};
	const onDecrease = (item) => {
		cartItem.update(item, { quantity: item.quantity > 1 ? item.quantity - 1 : 1 });
		handleChange();
	};
	const onIncrease = (item) => {
		cartItem.update(item, { quantity: item.quantity + 1 });
		handleChange();
	};

	const deneroZero = {
		scale: 3,
		amount: 0,
		currency: {
			base: 10,
			code: 'USD',
			exponent: 2
		}
	};

	$: subTotal = calcSubTotal(Array.from($cartItem.values())) || dinero(deneroZero);

	const handleChange = async () => {
		try {
			const res = await fetch('/api/cart.json', {
				method: 'POST',
				body: JSON.stringify({
					pricelistsID: mainPricelist.pricelistsID,
					orderLine: Array.from($cartItem.values())
				})
			});
			if (res.ok) {
				const cartData = await res.json();
				cartData.forEach((item) => {
					cartItem.update(item, {});
				});
			}
		} catch (err: any) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured', type: 'error' });
		}
	};

	let customerSearch: any = { name: null };

	$: if (customerSearch.name) {
		mainPricelist.customersID = customerSearch.id;
	}

	const handleComboInput = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		customerQueryParams = {
			...customerQueryParams,
			name: (event.target as HTMLInputElement).value
		};
		customers = await getCustomers(customerQueryParams);
	};

	const heandleSubmit = async (status: string) => {
		/**
		 * Check if the fields are filled
		*/
		if (!mainPricelist.orderLine.length ) {
			toasts.add({ message: 'A products must be selected', type: 'error' });
			return
		}
		if (!mainPricelist.customersID) {
			toasts.add({ message: 'A customer must be selected', type: 'error' });
			return
		}
		if (!mainPricelist.pricelistsID ) {
			toasts.add({ message: 'A pricelist must be selected', type: 'error' });
			return
		}
		if (!mainPricelist.id ) {
			delete mainPricelist.id
		}

		mainPricelist.accountsStatus = status

		try {
			const res = await fetch('/api/orders.json', {
				method: 'POST',
				body: JSON.stringify(mainPricelist)
			});

			if (res.ok) {
				toasts.add({ message: `The ${status} was created`, type: 'success' });
			}
			
		} catch (err: any) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured', type: 'error' });
		}
		
	}
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
								{` ${currency.currency} (${currency.symbol})`}
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
								class="border rounded px-1 bg-royal-blue-200 {!(item.quantity > 1)
									? 'border-royal-blue-700 cursor-not-allowed opacity-10'
									: 'border-royal-blue-500 hover:bg-royal-blue-300'}"
								disabled={!(item.quantity > 1)}
								on:click|preventDefault={() => onDecrease(item)}
								aria-label="Decrease quantity"
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
							<div class="w-8 mx-2 text-center">{item?.quantity}</div>
							<button
								class="px-1 border bg-royal-blue-200 border-royal-blue-500 rounded hover:bg-royal-blue-300"
								on:click={() => onIncrease(item)}
								on:change|preventDefault={handleChange}
								aria-label="Increase quantity"
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
							{format(item.unitPrice)}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{format(item.total)}
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="customer">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Order summary</h1>
			<div class="relative mx-2 text-danger">
				{@html svgCart}
				<span
					class="absolute top-0 right-0 -mt-1.5 -mr-2 text-white bg-success text-blue-700 font-normal rounded-full px-1 text-xs"
				>
					{totalCartItems ? totalCartItems : 0}
				</span>
			</div>
		</div>

		<div class="mt-5 mb-7">
			<div class="flex flex-col my-3 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="orderNo">Order Number</label>
				<input
					bind:value={idValue}
					class="grow input"
					type="text"
					name="orderNo"
					id="orderNo"
					disabled
				/>
			</div>
			<div class="flex justify-between my-3 text-sm font-medium uppercase">
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
			<div class="flex flex-col my-3 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="pricelist">Pricelist</label>
				{#if pricelists}
					<select
						name="pricelist"
						id="pricelist"
						bind:value={mainPricelist.pricelistsID}
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
			<div class="flex flex-col my-3 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="pricelist">Order Date</label>
				{#if pricelists}
					<input
						class="input w-full"
						type="datetime-local"
						name="orderDate"
						id="orderDate"
						bind:value={mainPricelist.orderDate}
					/>
				{/if}
			</div>
			<div class="flex flex-col my-3 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="pricelist">Due Date</label>
				{#if pricelists}
					<input
						class="input w-full"
						type="datetime-local"
						name="deliveryDate"
						id="deliveryDate"
						bind:value={mainPricelist.deliveryDate}
					/>
				{/if}
			</div>
		</div>

		<div class="flex justify-between  border-t border-royal-blue-500">
			<span class="text-sm font-medium uppercase pt-5">Subtotal</span>
			<span class="text-sm font-semibold pt-5">
				{format(toSnapshot(subTotal))}
			</span>
		</div>
		<div class="flex justify-between mt-4 mb-5">
			<span class="text-sm font-medium uppercase"> VAT({vat}%) </span>
			<span class="text-sm font-semibold">
				{format(toSnapshot(calclculatedVat))}
			</span>
		</div>

		<div class="mt-5 border-t border-royal-blue-500">
			<div class="flex justify-between my-5 font-medium uppercase text-danger text-base">
				<span>Total</span>
				<span class="text-base font-semibold ">{format(toSnapshot(calclculatedTotal))}</span>
			</div>
			<button
				on:click|preventDefault={() => heandleSubmit('Quotation')}
				class="w-full py-3 text-sm mb-2 font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Create Quotation
			</button>
			<button
			on:click|preventDefault={() => heandleSubmit('Sales Order')}
				class="w-full py-3 text-sm mb-2 font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Create Sales Order
			</button>
			<button
				on:click|preventDefault={() => heandleSubmit('Invoice')}
				class="w-full py-3 text-sm mb-2 font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Create Invoice
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
</style>
