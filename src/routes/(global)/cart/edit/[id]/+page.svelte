<script lang="ts">
	import Combobox from '$lib/components/Combobox.svelte';
	import { createConverter, format } from '$lib/services/monetary';
	import logger from '$lib/utility/logger';
	import { svgCart } from '$lib/utility/svgLogos';
	import { toasts } from '$lib/stores/toasts.store';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import { add, dinero, multiply, toSnapshot } from 'dinero.js';
	import { cartItem, cartOrder } from '$lib/stores/cart.store';
	import { selectedCurrency, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type {
		Address,
		Contacts,
		Email,
		Options,
		OrderLine,
		Orders,
		Phone,
		Pricelists,
		Products
	} from '@prisma/client';
	import { saveOrdersSchema } from '$lib/validation/saveOrder.validate';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	let errorMessages = new Map();

	$: disabled = false;

	type customersType = (Contacts & {
		email: Email[];
		phone: Phone[];
		address: Address[];
	})[];

	export let data: {
		customers: { results: customersType };
		embroideryTypes: Options[];
		embroideryPositions: Options[];
		pricelists: Pricelists;
		order: Orders & {
			Pricelists: Pricelists;
			OrderLine: (OrderLine & { Products: Products })[];
			customerContact: Contacts;
		};
	};

	const updateCart = (data: { order: { [x: string]: any; OrderLine: any } }) => {
		if (!data?.order) {
			return;
		}
		const { OrderLine, ...restOrder } = data.order;
		mainOrder = { ...restOrder, orderLine: OrderLine };
		customerSearch = restOrder.customerContact;
		OrderLine.forEach((item: any) => {
			cartItem.add(item);
		});
		cartOrder.add({
			...restOrder
		});
	};

	$: updateCart(data);

	$: handleCurrency(Array.from($cartItem.values()), $selectedCurrency);

	let zero = dinero({ amount: 0, currency: $selectedCurrency.dineroObj });

	const handleCalculations = async (lineArray: OrderLine[] = []) => {
		try {
			if (!mainOrder.pricelistsID) {
				return;
			}
			return await trpc().cart.calculateCart.mutate({
				pricelistsID: mainOrder.pricelistsID,
				orderLine: lineArray
			});
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'Error occurred during cart calculations', type: 'error' });
		}
	};

	const handleCurrency = async (lineArray: OrderLine[], selectedCurrency: CurrencyOption) => {
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
		mainOrder.orderLine = newArray.map((item) => {
			let unitPrice = convert(dinero(item.unitPrice), selectedCurrency.dineroObj);
			if (!unitPrice) {
				unitPrice = zero;
			}

			return { ...item, unitPrice: toSnapshot(unitPrice) };
		});

		getCountAndSubTotal(mainOrder.orderLine);
	};

	type MainOrder = {
		id?: number | null;
		customersID: number | null;
		pricelistsID: number | null;
		isActive: boolean;
		accountsStatus: string | null;
		orderDate: string | null;
		deliveryDate?: string | null;
		comment?: string;
		orderLine: any[];
	};

	// let mainOrderInit: MainOrder = {
	// 	id: null,
	// 	customersID: null,
	// 	pricelistsID: 0,
	// 	isActive: true,
	// 	accountsStatus: null,
	// 	orderDate: TODAY,
	// 	deliveryDate: FOUR_DAYS,
	// 	orderLine: Array.from($cartItem.values()) || []
	// };

	let mainOrder: Partial<MainOrder> = data.order;
	mainOrder = { ...$cartOrder, orderLine: Array.from($cartItem.values()) };

	$: idValue = generateSONumber(mainOrder.id);
	let embroideryPositions = data.embroideryPositions;
	let embroideryTypes = data.embroideryTypes;
	let customers = data.customers;
	let pricelists = data.pricelists;

	let pricelistValue: number | undefined;
	let customerQueryParams = {
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

	const removeItem = (item: unknown) => {
		cartItem.remove(item);
	};
	const onDecrease = (item: unknown) => {
		cartItem.update(item, { quantity: item.quantity > 1 ? item.quantity - 1 : 1 });
	};
	const onIncrease = (item: unknown) => {
		cartItem.update(item, { quantity: item.quantity + 1 });
	};

	const handleEmbroideryType = (item: { embroideryTypes: string }) => {
		cartItem.update(item, { embroideryTypes: item.embroideryTypes });
		handleCurrency(Array.from($cartItem.values()), $selectedCurrency);
	};

	let customerSearch: any = $cartOrder.customerContact;

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
		customers = await getCustomers(customerQueryParams);
	};

	const handleSubmit = async (status: string) => {
		/**
		 * Check if the fields are filled
		 */
		if (!mainOrder?.orderLine?.length) {
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

		if (mainOrder.deliveryDate) {
			mainOrder.deliveryDate = new Date(mainOrder.deliveryDate).toJSON();
		}

		if (mainOrder.orderDate) {
			mainOrder.orderDate = new Date(mainOrder.orderDate).toJSON();
		}

		disabled = true;

		const parsedOrder = saveOrdersSchema.safeParse(mainOrder);

		if (!parsedOrder.success) {
			const errorMap = zodErrorMessagesMap(parsedOrder);

			if (errorMap) {
				errorMessages = errorMap;
			}
			disabled = false;
			return;
		}

		try {
			await trpc().orders.SaveOrderOrUpdate.mutate(parsedOrder.data);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			customerSearch = { name: null };
			cartItem.reset();
			toasts.add({ message: `The order was updated`, type: 'success' });
			goto('/cart');
		}
	};
</script>

<div class="w-full flex">
	<div class="cart">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Shopping cart</h1>
			<div class="flex items-center" />
		</div>
		{#if mainOrder?.orderLine?.length > 0}
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
				{#each mainOrder?.orderLine as item (item.name)}
					{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
					<div class="flex items-center px-6 py-5 hover:bg-pickled-bluewood-200">
						<div class="flex w-2/6">
							<div class="flex flex-col items-start justify-between flex-grow ml-4">
								<div>
									<h3 class="mb-1 text-sm font-bold">{item.name}</h3>
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
					{format(calculatedTotal)}
				</span>
			</div>
			<button
				on:click|preventDefault={() => handleSubmit('Quotation')}
				class="w-full py-3 text-sm mb-2 font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Update Quotation
			</button>
			<button
				on:click|preventDefault={() => handleSubmit('Sales Order')}
				class="w-full py-3 text-sm mb-2 font-semibold text-white uppercase transition-colors ease-in-out bg-royal-blue-600 rounded hover:bg-royal-blue-700"
			>
				Update Sales Order
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
