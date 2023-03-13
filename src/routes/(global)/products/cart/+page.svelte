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
	import { cartItem } from '$lib/stores/cart.store';
	import { selectedCurrency } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { handleCartCalculations } from '$lib/utility/handleCartCalculations';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import { svgArrow, svgCart, svgCartMinus, svgCartPlus } from '$lib/utility/svgLogos';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { saveOrdersSchema, type SaveOrder } from '$lib/validation/saveOrder.validate';
	import type {
		Address,
		Contacts,
		Email,
		Options,
		OrderLine,
		Phone,
		Pricelists,
		Products
	} from '@prisma/client';
	import dayjs from 'dayjs';
	import { dinero, multiply } from 'dinero.js';
	import type { Snapshot } from './$types';
	import isBetween from 'dayjs/plugin/isBetween';
	import weekday from 'dayjs/plugin/weekday';
	dayjs.extend(isBetween);
	dayjs.extend(weekday);

	let errorMessages = new Map();

	type NewOrderLine = OrderLine & Products;

	type customersType = (Contacts & {
		email: Email[];
		phone: Phone[];
		address: Address[];
	})[];

	export let data: {
		customers: { results: customersType };
		embroideryTypes: Options[];
		embroideryPositions: Options[];
		pricelists: Pricelists[];
		defaultPricelist: Pricelists;
		currency: Options[];
	};

	$: promise = handleCartCalculations(mainOrderInit, $selectedCurrency);

	const TODAY = dayjs().format('YYYY-MM-DDTHH:mm');
	let FOUR_DAYS = dayjs().add(4, 'day').format('YYYY-MM-DDTHH:mm');
	const sundayInBetween = dayjs().weekday(7).isBetween(TODAY, FOUR_DAYS);

	if (sundayInBetween) {
		FOUR_DAYS = dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm');
	}

	let mainOrderInit: Partial<SaveOrder> = {
		id: undefined,
		customersID: undefined,
		pricelistsID: data.defaultPricelist.id,
		isActive: true,
		accountsStatus: undefined,
		orderDate: TODAY,
		deliveryDate: FOUR_DAYS,
		OrderLine: Array.from($cartItem.values()) || []
	};

	let mainOrder = mainOrderInit;

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

	$: mainOrderInit.OrderLine = Array.from($cartItem.values());

	const removeItem = (item: any) => {
		cartItem.remove(item);
	};

	const onDecrease = (item: NewOrderLine) => {
		if (!item.quantity) {
			return;
		}
		cartItem.update(item, { quantity: item.quantity > 1 ? item.quantity - 1 : 1 });
	};

	const onIncrease = (item: NewOrderLine) => {
		cartItem.update(item, { quantity: item.quantity + 1 });
	};

	const handleEmbroideryType = (item: NewOrderLine) => {
		cartItem.update(item, { embroideryTypes: item.embroideryTypes });
	};

	let customerSearch: Partial<Contacts> = { name: undefined };

	$: if (customerSearch.name) {
		mainOrder.customersID = customerSearch.id;
	}

	const handleComboInput = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		customerQueryParams = {
			...customerQueryParams,
			name: (event.target as HTMLInputElement).value
		};
		const resCustomers = await getCustomers(customerQueryParams);
		if (!resCustomers) {
			return;
		}
		customers = { results: resCustomers.results } as { results: customersType };
	};

	const handleSubmit = async (status: string) => {
		/**
		 * Check if the fields are filled
		 */
		if (!mainOrder?.OrderLine?.length) {
			toasts.add({ message: 'A products must be selected', type: 'error' });
			return;
		}
		if (!mainOrder.customersID) {
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
			const errorMap = zodErrorMessagesMap(parsedOrder);

			if (errorMap) {
				errorMessages = errorMap;
			}
			return;
		}

		try {
			await trpc().orders.SaveOrderOrUpdate.mutate(parsedOrder.data);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			mainOrder = { ...mainOrderInit, OrderLine: [] };
			customerSearch = { name: undefined };
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
					{#each order.OrderLine as item (item.id)}
						{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
						<div class="flex items-center p-2 hover:bg-pickled-bluewood-200">
							<div class="flex w-2/6">
								<div class="flex flex-col items-start justify-between flex-grow ml-4">
									<div>
										<h3 class="mb-1 text-xs font-bold">{item.name}</h3>
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
								{item?.stitches}
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
					<div class="border-b border-white ">
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
