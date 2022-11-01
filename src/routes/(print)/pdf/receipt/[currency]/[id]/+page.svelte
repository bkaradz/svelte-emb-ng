<script lang="ts">
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import type { Orders, Prisma } from '@prisma/client';
	import { add, dinero, multiply, toSnapshot } from 'dinero.js';
	import { toasts } from '$lib/stores/toasts.store';
	import { browser } from '$app/environment';
	import { createConverter } from '$lib/services/monetary';
	import { currenciesOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { USD } from '@dinero.js/currencies';
	import PartialReceiptPage from '$lib/components/print/receipt/PartialReceiptPage.svelte';

	export let data: any;

	const updatePrint = async (data: { order: Orders & {} }) => {
		if (!data?.order) {
			return;
		}
		$currenciesOptions.forEach((item) => {
			if (item.currency === data.selectedCurrency.currency) {
				data.selectedCurrency = item;
			}
		});
		zero = dinero({ amount: 0, currency: data.selectedCurrency.dineroObj });
		order = data.order;
		await handleCurrency(order.OrderLine, data.selectedCurrency);
		getCountAndSubTotal(order.OrderLine);
	};

	onMount(() => {
		if (data?.zero) {
			zero = dinero(data.zero);
		}
		if (data?.order) {
			updatePrint(data);
		}
	});

	const handleCurrency = async (lineArray: unknown[], selectedCurrency: CurrencyOption) => {
		zero = dinero(data.zero);
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
		order.OrderLine = [
			...newArray.map((item) => {
				let unitPrice = convert(dinero(item.unitPrice), selectedCurrency.dineroObj);
				if (!unitPrice) {
					unitPrice = zero;
				}

				return { ...item, unitPrice: toSnapshot(unitPrice) };
			})
		];

		getCountAndSubTotal(order.OrderLine);
	};

	const handleCalculations = async (lineArray: unknown[] = []) => {
		try {
			const res = await fetch('/api/cart.json', {
				method: 'POST',
				body: JSON.stringify({
					pricelistsID: order.pricelistsID,
					orderLine: lineArray
				})
			});
			if (res.ok) {
				const cartData = await res.json();
				return cartData;
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occured', type: 'error' });
		}
	};

	const vat = 0;

	$: calclculatedVat = multiply(subTotal, { amount: vat, scale: 2 });

	$: calclculatedTotal = add(calclculatedVat, subTotal);

	type Orders = Prisma.OrdersGetPayload<Prisma.OrdersArgs>;

	let order: Orders;

	let pagesCreated: any;

	let zero = dinero({ amount: 0, currency: USD });

	let totalCartItems = 0;
	let subTotal = zero;

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
</script>

<svelte:head>
	<title>Printing</title>
</svelte:head>

{#if order}
	<PartialReceiptPage {order} {subTotal} {calclculatedVat} {calclculatedTotal} {vat} />
{/if}
