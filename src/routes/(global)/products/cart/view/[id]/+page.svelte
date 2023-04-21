<!-- <script lang="ts">
	import { browser } from '$app/environment';
	import Combobox from '$lib/components/Combobox.svelte';
	import { createConverter, format } from '$lib/services/monetary';
	import { cartItem, cartOrder } from '$lib/stores/cart.store';
	import { selectedCurrency, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import logger from '$lib/utility/logger';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import { svgCart } from '$lib/utility/svgLogos';
	import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
	import { add, dinero, multiply, toSnapshot, type DineroOptions } from 'dinero.js';

	type OrderLineType = DataType['order']['OrderLine'][0];

	export let data;

	type DataType = typeof data

	const updateCart = (data: DataType) => {
		if (!data?.order) {
			return;
		}
		const { OrderLine, ...restOrder } = data.order;
		mainOrder = data.order;
		customerSearch = data.order.customerContact;
		data.order.OrderLine.forEach((item) => {
			const id = item?.productsID;
			if (!id) {
				return;
			}
			cartItem.addProduct(item);
		});
		cartOrder.add({ ...restOrder });
	};

	$: updateCart(data);

	$: handleCurrency(Array.from($cartItem.values()), $selectedCurrency);

	let zero = dinero({ amount: 0, currency: $selectedCurrency.dineroObj });

	const handleCalculations = async (lineArray: (SaveOrdersLine & { quantity: number })[]) => {
		try {
			if (!mainOrder.pricelistsID) {
				return;
			}
			if (!Array.isArray(lineArray)) {
				return;
			}

			return await trpc().cart.calculateCart.mutate({
				pricelistsID: mainOrder.pricelistsID,
				OrderLine: lineArray
			});
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occurred', type: 'error' });
		}
	};

	const handleCurrency = async (lineArray: SaveOrdersLine[], selectedCurrency: CurrencyOption) => {
		zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });
		/**
		 * Calculate using the cart default usd currency
		 */
		let newArray;
		if (browser) {
			newArray = await handleCalculations(lineArray);
		}
		if (!Array.isArray(newArray)) {
			return;
		}

		const convert = createConverter(selectedCurrency.dineroObj);
		mainOrder.OrderLine = newArray.map((item) => {
			let unitPrice = convert(
				dinero(item.unitPrice as unknown as DineroOptions<number>),
				selectedCurrency.dineroObj
			);
			if (!unitPrice) {
				unitPrice = zero;
			}

			return { ...item, unitPrice: toSnapshot(unitPrice) };
		});

		getCountAndSubTotal(mainOrder.OrderLine);
	};

	let mainOrder = data.order;
	mainOrder = { ...$cartOrder, OrderLine: Array.from($cartItem.values()) } as SaveOrder;

	$: idValue = generateSONumber(mainOrder.id);
	let embroideryPositions = data.embroideryPositions;
	let embroideryTypes = data.embroideryTypes;
	let customers = data.customers;
	let pricelists = data.pricelists;

	type CustomerQueryTypes = {
		limit: number;
		page: number;
		name?: string;
	};

	let customerQueryParams: CustomerQueryTypes = {
		limit: 7,
		page: 1
	};

	// const vat = 14.5;
	let totalCartItems = 0;
	let subTotal = zero;

	const vat = 0;

	$: calculatedVat = multiply(subTotal, { amount: vat, scale: 2 });

	$: calculatedTotal = add(calculatedVat, subTotal);

	const getCountAndSubTotal = (cart: any[]) => {
		const totals = cart.reduce(
			(acc, item) => {
				return {
					totalCartItems: acc.totalCartItems + item.quantity,
					subTotal: add(acc.subTotal, multiply(dinero(item.unitPrice), item.quantity))
				};
			},
			{ totalCartItems: 0, subTotal: zero }
		);
		totalCartItems = totals.totalCartItems;
		subTotal = totals.subTotal;
	};

	const getCustomers = async (paramsObj: any) => {
		try {
			return await trpc().contacts.getContacts.query(paramsObj);
		} catch (err: any) {
			handleErrors(err);
		}
	};

	$: handleCurrency(Array.from($cartItem.values()), $selectedCurrency);

	const removeItem = (item: OrderLineType) => {
		const id = item.id;
		if (!id) {
			return;
		}
		cartItem.remove(id);
	};
	const onDecrease = (item: OrderLineType) => {
		if (!item.quantity) {
			return;
		}
		cartItem.update(item, { quantity: item.quantity > 1 ? item.quantity - 1 : 1 });
	};
	const onIncrease = (item: OrderLineType) => {
		cartItem.update(item, { quantity: item.quantity + 1 });
	};

	const handleEmbroideryType = (item: OrderLineType) => {
		cartItem.update(item, { embroideryTypes: item.embroideryTypes });
		handleCurrency(Array.from($cartItem.values()), $selectedCurrency);
	};

	let customerSearch: any = $cartOrder.customerContact;

	$: if (customerSearch.name) {
		mainOrder.customersID = customerSearch.id;
	}

	const handleComboInput = async (event: { target: { value: any } }) => {
		const name = event?.target?.value;

		customerQueryParams = {
			...customerQueryParams,
			name
		};
		const customersReturn = await getCustomers(customerQueryParams);
		if (!customersReturn) {
			return;
		}
		customers = customersReturn;
	};
</script>

<div class="w-full flex">
	<div class="cart">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Shopping cart</h1>
			<div class="flex items-center" />
		</div>
		{#if mainOrder?.OrderLine?.length > 0}
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
				{#each mainOrder.OrderLine as item (item.id)}
					{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
					<div class="flex items-center px-6 py-5 hover:bg-pickled-bluewood-200">
						<div class="flex w-2/6">
							<div class="flex flex-col items-start justify-between flex-grow ml-4">
								<div>
									<h3 class="mb-1 text-sm font-bold">{item?.Products?.name}</h3>
								</div>
								<button
									on:click={() => removeItem(item)}
									disabled
									class="text-xs font-semibold text-left text-gray-500 transition-colors ease-in-out hover:text-danger"
								>
									Remove
								</button>
							</div>
						</div>
						<span class="w-1/6 text-sm font-semibold text-right">
							{item?.Products?.stitches}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{#if embroideryTypes}
								<select
									bind:value={item.embroideryTypes}
									on:change|preventDefault={() => handleEmbroideryType(item)}
									disabled
									class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
								>
									{#each embroideryTypes as type}
										<option value={type.value}>
											{type.label}
										</option>
									{/each}
								</select>
							{/if}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{#if embroideryPositions}
								<select
									disabled
									bind:value={item.embroideryPositions}
									class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
								>
									{#each embroideryPositions as type}
										<option value={type.value}>
											{type.label}
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
								disabled
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
								disabled
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
							{format(dinero(item.unitPrice))}
						</span>
						<span class="w-1/6 text-sm font-semibold text-right">
							{format(totalPrice)}
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
					disabled
					bind:value={idValue}
					class="grow input"
					type="text"
					name="orderNo"
					id="orderNo"
				/>
			</div>
			<div class="flex justify-between my-3 text-sm font-medium uppercase">
				{#if customers}
					<Combobox
						disabled
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
						disabled
						name="pricelist"
						id="pricelist"
						bind:value={mainOrder.pricelistsID}
						on:change|preventDefault={() =>
							handleCurrency(Array.from($cartItem.values()), $selectedCurrency)}
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
						disabled
						class="input w-full"
						type="datetime-local"
						name="orderDate"
						id="orderDate"
						bind:value={mainOrder.orderDate}
					/>
				{/if}
			</div>
			<div class="flex flex-col my-3 text-sm font-medium uppercase">
				<label class="text-sm text-pickled-bluewood-600" for="pricelist">Due Date</label>
				{#if pricelists}
					<input
						disabled
						class="input w-full"
						type="datetime-local"
						name="deliveryDate"
						id="deliveryDate"
						bind:value={mainOrder.deliveryDate}
					/>
				{/if}
			</div>
		</div>

		<div class="flex justify-between  border-t border-royal-blue-500">
			<span class="text-sm font-medium uppercase pt-5">Subtotal</span>
			<span class="text-sm font-semibold pt-5">
				{format(subTotal)}
			</span>
		</div>
		<div class="flex justify-between mt-4 mb-5">
			<span class="text-sm font-medium uppercase"> VAT({vat}%) </span>
			<span class="text-sm font-semibold">
				{format(calculatedVat)}
			</span>
		</div>

		<div class="mt-5 border-t border-royal-blue-500">
			<div class="flex justify-between my-5 font-medium uppercase text-danger text-base">
				<span>Total</span>
				<span class="text-base font-semibold ">
					{format(calculatedTotal)}00
				</span>
			</div>
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
</style> -->

<script lang="ts">
	import { goto } from '$app/navigation';
	import ShowBancAbc from '$lib/components/cart/ShowBancABC.svelte';
	import ShowCash from '$lib/components/cart/ShowCash.svelte';
	import ShowEcoCash from '$lib/components/cart/ShowEcoCash.svelte';
	import ShowOthers from '$lib/components/cart/ShowOthers.svelte';
	import ShowSave from '$lib/components/cart/ShowSave.svelte';
	import ShowStewartBank from '$lib/components/cart/ShowStewartBank.svelte';
	import Combobox from '$lib/components/Combobox.svelte';
	import { format } from '$lib/services/monetary';
	import { cartItem, cartOrder } from '$lib/stores/cart.store';
	import { selectedCurrency } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { handleCartCalculations } from '$lib/utility/handleCartCalculations';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import { svgArrow, svgCart, svgCartMinus, svgCartPlus } from '$lib/utility/svgLogos';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { saveOrdersSchema, type SaveOrder } from '$lib/validation/saveOrder.validate';
	import type { Contacts } from '@prisma/client';
	import dayjs from 'dayjs';
	import { dinero, multiply } from 'dinero.js';
	import type { Snapshot } from './$types';
	import isBetween from 'dayjs/plugin/isBetween';
	import weekday from 'dayjs/plugin/weekday';
	import { onMount } from 'svelte';
	dayjs.extend(isBetween);
	dayjs.extend(weekday);

	type OrderLineType = SaveOrder['OrderLine'][0];

	export let data;

	type DataType = typeof data

	const updateCart = (data: DataType) => {
		console.log("🚀 ~ file: +page.svelte:485 ~ updateCart ~ data:", data)
		if (!data?.order) {
			return;
		}
		const { OrderLine, ...restOrder } = data.order;
		mainOrder = data.order;
		customerSearch = data.order.customerContact;
		data.order.OrderLine.forEach((item) => {
			const id = item?.productsID;
			if (!id) {
				return;
			}
			cartItem.addOrderLine(item);
		});
		cartOrder.add({ ...restOrder });
	};

	onMount(()=> {
		updateCart(data)
	})


	const TODAY = dayjs().format('YYYY-MM-DDTHH:mm');
	let FOUR_DAYS = dayjs().add(4, 'day').format('YYYY-MM-DDTHH:mm');
	const sundayInBetween = dayjs().weekday(7).isBetween(TODAY, FOUR_DAYS);

	if (sundayInBetween) {
		FOUR_DAYS = dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm');
	}

	let mainOrderInit: SaveOrder = {
		customersID: data.order.customersID,
		pricelistsID: data.order.pricelistsID,
		isActive:  data.order.isActive,
		accountsStatus: data.order.accountsStatus,
		orderDate: data.order.orderDate,
		deliveryDate: data.order.deliveryDate,
		OrderLine: Array.from($cartItem.values()) || []
	};

	let mainOrder = structuredClone(mainOrderInit);

	let promise = handleCartCalculations(mainOrder, $selectedCurrency);

	$: $selectedCurrency, recalculateCart();

	const recalculateCart = () => {
		mainOrder.OrderLine = Array.from($cartItem.values());
		promise = handleCartCalculations(mainOrder, $selectedCurrency);
	};

	let idValue = generateSONumber(mainOrder.id);
	let embroideryPositions = data.embroideryPositions;
	let embroideryTypes = data.embroideryTypes;
	let customers = data.customers;
	let pricelists = data.pricelists;

	type customerQueryType = { limit: number; page: number; name: string };

	let customerQueryParams: Partial<customerQueryType> = {
		limit: 7,
		page: 1
	};

	const getCustomers = async (paramsObj: any) => {
		try {
			return await trpc().contacts.getContacts.query(paramsObj);
		} catch (err: any) {
			handleErrors(err);
		}
	};

	const removeItem = (item: OrderLineType) => {
		const id = item.productsID;
		if (!id) {
			return;
		}
		cartItem.remove(id);
		if ($cartItem.size === 0) {
			goto(`/products`);
			return;
		}
		recalculateCart();
	};

	const onDecrease = (item: OrderLineType) => {
		if (!item.quantity) {
			return;
		}
		cartItem.update(item, { quantity: item.quantity > 1 ? item.quantity - 1 : 1 });
		recalculateCart();
	};

	const onIncrease = (item: OrderLineType) => {
		cartItem.update(item, { quantity: item.quantity + 1 });
		recalculateCart();
	};

	const handleEmbroideryType = (item: OrderLineType) => {
		cartItem.update(item, { embroideryTypes: item.embroideryTypes });
		recalculateCart();
	};

	let customerSearch: Partial<Omit<Contacts, 'name'>> & { name: string } = { name: '' };

	$: if (customerSearch.name) {
		if (!customerSearch.id) {
			throw new Error('id not found');
		}
		mainOrder.customersID = customerSearch.id;
	}

	const handleComboInput = async (event: { target: { value: any } }) => {
		const name = event?.target?.value;

		customerQueryParams = {
			...customerQueryParams,
			name
		};
		const customersReturn = await getCustomers(customerQueryParams);
		if (!customersReturn) {
			return;
		}
		customers = customersReturn;
	};

	const handleSubmit = async (status: string) => {
		/**
		 * Check if the fields are filled
		 */
		if (!mainOrder?.OrderLine?.length) {
			toasts.add({ message: 'A products must be selected', type: 'error' });
			return;
		}
		if (mainOrder.customersID < 1) {
			toasts.add({ message: 'A customer must be selected', type: 'error' });
			return;
		}
		if (!mainOrder.pricelistsID) {
			toasts.add({ message: 'A pricelist must be selected', type: 'error' });
			return;
		}
		if (!mainOrder.id) {
			delete mainOrder.id;
		}

		mainOrder.accountsStatus = status;
		if (status === 'Invoice') {
			mainOrder.isInvoiced = true;
		}

		if (mainOrder.deliveryDate) {
			mainOrder.deliveryDate = new Date(mainOrder.deliveryDate).toJSON();
		}

		if (mainOrder.orderDate) {
			mainOrder.orderDate = new Date(mainOrder.orderDate).toJSON();
		}

		const parsedOrder = saveOrdersSchema.safeParse(mainOrder);

		if (!parsedOrder.success) {
			zodErrorMessagesMap(parsedOrder);

			return;
		}

		try {
			await trpc().orders.saveOrderOrUpdate.mutate(parsedOrder.data);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			mainOrder = { ...mainOrderInit, OrderLine: [] };
			customerSearch = { name: '' };
			cartItem.reset();
			toasts.add({ message: `The order was created`, type: 'success' });
		}
	};

	const restPayment = () => {
		return new Map([
			['showSave', true],
			['showCash', false],
			['showEcoCash', false],
			['showBancABC', false],
			['showStewartBank', false],
			['showOthers', false]
		]);
	};

	let paymentTabs = restPayment();

	const setPaymentTab = (nameType: string) => {
		paymentTabs = restPayment();
		paymentTabs.set('showSave', false);
		paymentTabs.set(nameType, true);
	};

	export const snapshot: Snapshot = {
		capture: () => customerSearch,
		restore: (value) => (customerSearch = value)
	};
</script>

<svelte:head>
	<title>Cart</title>
</svelte:head>

{#await promise then { totalCartItems, subTotal, calculatedVat, grandTotal, order, vat }}
	<div class="w-full grid grid-cols-12">
		<div class="col-span-8 bg-pickled-bluewood-50 p-4">
			<div class="flex items-center pb-3 border-b border-royal-blue-500">
				<button class="mr-3" on:click={() => goto(`/products`)}>
					{@html svgArrow}
				</button>
				<h1 class="text-2xl font-semibold capitalize">Shopping cart</h1>
				<!-- <div class="flex items-center" /> -->
			</div>
			{#if order?.OrderLine?.length > 0}
				<div class="flex px-6 mt-5 mb-5">
					<span class="w-2/6 text-xs font-semibold tracking-wide text-gray-500 uppercase">
						Product
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Stitches
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Emb Type
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Emb Position
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Quantity
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Price
					</span>
					<span
						class="w-1/6 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase"
					>
						Total
					</span>
				</div>
				<div class="scrollHeight overflow-y-auto">
					{#each order.OrderLine as item (item.productsID)}
						{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
						<div class="flex items-center p-2 hover:bg-pickled-bluewood-200">
							<div class="flex w-2/6">
								<div class="flex flex-col items-start justify-between flex-grow ml-4">
									<div>
										<h3 class="mb-1 text-xs font-bold">{item.Products.name}</h3>
									</div>
									<button
										on:click|preventDefault={() => removeItem(item)}
										class="text-xs font-semibold text-left text-gray-500 transition-colors ease-in-out hover:text-danger"
									>
										Remove
									</button>
								</div>
							</div>
							<span class="w-1/6 text-sm font-semibold text-right">
								{item?.Products?.stitches}
							</span>
							<span class="w-1/6 text-sm font-semibold text-right">
								{#if embroideryTypes}
									<select
										bind:value={item.embroideryTypes}
										on:change|preventDefault={() => handleEmbroideryType(item)}
										class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
									>
										{#each embroideryTypes as type}
											<option value={type.value}>
												{type.label}
											</option>
										{/each}
									</select>
								{/if}
							</span>
							<span class="w-1/6 text-sm font-semibold text-right">
								{#if embroideryPositions}
									<select
										bind:value={item.embroideryPositions}
										class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
									>
										{#each embroideryPositions as type}
											<option value={type.value}>
												{type.label}
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
									{@html svgCartMinus}
								</button>
								<div class="w-8 mx-2 text-center">{item?.quantity}</div>
								<button
									class="px-1 border bg-royal-blue-200 border-royal-blue-500 rounded hover:bg-royal-blue-300"
									on:click|preventDefault={() => onIncrease(item)}
									aria-label="Increase quantity"
								>
									{@html svgCartPlus}
								</button>
							</div>
							<span class="w-1/6 text-sm font-semibold text-right">
								{format(dinero(item.unitPrice))}
							</span>
							<span class="w-1/6 text-sm font-semibold text-right">
								{format(totalPrice)}
							</span>
						</div>
					{/each}
					<div
						class="flex items-center p-2 hover:bg-pickled-bluewood-200 border-t border-royal-blue-500"
					>
						<span class="w-4/6" />
						<span class="w-1/6 text-sm font-semibold text-right">Subtotal</span>
						<span class="w-1/6 text-sm font-semibold text-right">{format(subTotal)}</span>
					</div>
					<div class="flex items-center p-2 hover:bg-pickled-bluewood-200">
						<span class="w-4/6" />
						<span class="w-1/6 text-sm font-semibold text-right">VAT({vat}%)</span>
						<span class="w-1/6 text-sm font-semibold text-right">{format(calculatedVat)}</span>
					</div>
					<div
						class="flex items-center p-2 hover:bg-pickled-bluewood-200 border-b border-royal-blue-500 mb-9"
					>
						<span class="w-4/6" />
						<span class="w-1/6 text-lg font-semibold text-danger text-right">Total</span>
						<span class="w-1/6 text-lg font-semibold text-danger text-right"
							>{format(grandTotal)}</span
						>
					</div>
				</div>
			{/if}
		</div>
		<div class="col-span-4 bg-royal-blue-100 p-4">
			<div class="flex items-center justify-between pb-3 border-b border-royal-blue-500">
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

			<div class="mt-5 mb-7 space-y-2">
				<div class="grid grid-cols-2 space-x-2">
					<div class="flex flex-col text-sm font-medium uppercase">
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
					<div class="flex flex-col text-sm font-medium uppercase">
						<label class="text-sm text-pickled-bluewood-600" for="pricelist">Pricelist</label>
						{#if pricelists}
							<select
								name="pricelist"
								id="pricelist"
								bind:value={mainOrder.pricelistsID}
								on:change|preventDefault={() => {
									mainOrderInit.OrderLine = Array.from($cartItem.values());
								}}
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
				<div class="grid grid-cols-2 space-x-2">
					<div class="flex flex-col text-sm font-medium uppercase">
						<label class="text-sm text-pickled-bluewood-600" for="pricelist">Order Date</label>
						{#if pricelists}
							<input
								class="input w-full"
								type="datetime-local"
								name="orderDate"
								id="orderDate"
								bind:value={mainOrder.orderDate}
							/>
						{/if}
					</div>
					<div class="flex flex-col text-sm font-medium uppercase">
						<label class="text-sm text-pickled-bluewood-600" for="pricelist">Due Date</label>
						{#if pricelists}
							<input
								class="input w-full"
								type="datetime-local"
								name="deliveryDate"
								id="deliveryDate"
								bind:value={mainOrder.deliveryDate}
							/>
						{/if}
					</div>
				</div>
				<div class="grid grid-cols-1">
					<div class="flex justify-between text-xs font-medium uppercase">
						{#if customers}
							<Combobox
								label="Customer"
								name="customer"
								list={customers.results}
								bind:value={customerSearch}
								onInput={handleComboInput}
							/>
						{/if}
					</div>
				</div>
			</div>

			<div class="border-t border-royal-blue-500">
				<h2 class="mt-4 text-xl font-semibold capitalize">Payment Methods</h2>
				<div class="grid grid-cols-3 mt-2">
					<div class="border-b border-white">
						<button
							on:click|preventDefault={() => setPaymentTab('showSave')}
							class="btn btn-primary w-full {paymentTabs.get('showSave') ? 'bg-success' : ''}"
						>
							Save Document
						</button>
					</div>
					<div class="border-b border-r border-l border-white">
						<button
							on:click|preventDefault={() => setPaymentTab('showCash')}
							class="btn btn-primary w-full {paymentTabs.get('showCash') ? 'bg-success' : ''}"
						>
							Cash
						</button>
					</div>
					<div class="border-b border-white">
						<button
							on:click|preventDefault={() => setPaymentTab('showEcoCash')}
							class="btn btn-primary w-full {paymentTabs.get('showEcoCash') ? 'bg-success' : ''}"
							>EcoCash</button
						>
					</div>
					<div>
						<button
							on:click|preventDefault={() => setPaymentTab('showStewartBank')}
							class="btn btn-primary w-full {paymentTabs.get('showStewartBank')
								? 'bg-success'
								: ''}">Stewart Bank</button
						>
					</div>
					<div class="border-r border-l border-white">
						<button
							on:click|preventDefault={() => setPaymentTab('showBancABC')}
							class="btn btn-primary w-full {paymentTabs.get('showBancABC') ? 'bg-success' : ''}"
							>Banc ABC</button
						>
					</div>
					<div>
						<button
							on:click|preventDefault={() => setPaymentTab('showOthers')}
							class="btn btn-primary w-full {paymentTabs.get('showOthers') ? 'bg-success' : ''}"
							>Others</button
						>
					</div>
				</div>
			</div>
			<div class="my-4">
				{#if paymentTabs.get('showSave')}
					<ShowSave {handleSubmit} />
				{/if}
				{#if paymentTabs.get('showCash')}
					<ShowCash {grandTotal} />
				{/if}
				{#if paymentTabs.get('showEcoCash')}
					<ShowEcoCash />
				{/if}
				{#if paymentTabs.get('showBancABC')}
					<ShowBancAbc />
				{/if}
				{#if paymentTabs.get('showStewartBank')}
					<ShowStewartBank />
				{/if}
				{#if paymentTabs.get('showOthers')}
					<ShowOthers />
				{/if}
			</div>
		</div>
	</div>
{/await}

<style lang="postcss">
	.scrollHeight {
		height: calc(100% - 75px);
	}
</style>
