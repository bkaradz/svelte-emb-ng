<script lang="ts">
	import { browser } from '$app/environment';
	import PartialReceiptPage from '$lib/components/print/receipt/PartialReceiptPage.svelte';
	import { createConverter } from '$lib/services/monetary';
	import { currenciesOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import logger from '$lib/utility/logger';
	import { USD } from '@dinero.js/currencies';
	import type { OrderLine } from '@prisma/client';
	import { add, dinero, multiply, toSnapshot, type DineroSnapshot } from 'dinero.js';
	import { onMount } from 'svelte';

	interface Orders extends Record<string, any> {
		OrderLine: OrderLine[];
	}

	type DataType = {
		selectedCurrency: CurrencyOption;
		zero: DineroSnapshot<number>;
		order: Orders;
	};
	export let data: DataType;

	const updatePrint = async (data: DataType) => {
		if (!data?.order) {
			return;
		}
		Array.from($currenciesOptions.values()).forEach((item) => {
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

	const handleCurrency = async (lineArray: OrderLine[], selectedCurrency: CurrencyOption) => {
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

	const handleCalculations = async (lineArray: OrderLine[] = []) => {
		try {
			if (!order.pricelistsID) {
				return;
			}
			return await trpc().cart.calculateCart.mutate({
				pricelistsID: order.pricelistsID,
				OrderLine: lineArray
			});
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occurred', type: 'error' });
		}
	};

	const vat = 0;

	$: calculatedVat = multiply(subTotal, { amount: vat, scale: 2 });

	$: calculatedTotal = add(calculatedVat, subTotal);

	let order: Orders;

	let zero = dinero({ amount: 0, currency: USD });

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
		subTotal = totals.subTotal;
	};
</script>

<svelte:head>
	<title>Printing</title>
</svelte:head>

{#if order}
	<PartialReceiptPage {order} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
{/if}
