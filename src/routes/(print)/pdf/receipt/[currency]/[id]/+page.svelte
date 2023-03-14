<script lang="ts">
	import { browser } from '$app/environment';
	import PartialReceiptPage from '$lib/components/print/receipt/PartialReceiptPage.svelte';
	import { createConverter } from '$lib/services/monetary';
	import { currenciesOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import logger from '$lib/utility/logger';
	import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
	import { USD } from '@dinero.js/currencies';
	import { add, dinero, multiply, toSnapshot } from 'dinero.js';
	import type { Dinero, DineroOptions } from 'dinero.js';
	import { onMount } from 'svelte';

	type DataInterface = {
		order: SaveOrder;
		zero: Dinero<number>;
		selectedCurrency: CurrencyOption;
	};

	export let data: DataInterface;

	const updatePrint = async (data: DataInterface) => {
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
			zero = dinero(data.zero as unknown as DineroOptions<number>);
		}
		if (data?.order) {
			updatePrint(data);
		}
	});

	const handleCurrency = async (lineArray: SaveOrdersLine[], selectedCurrency: CurrencyOption) => {
		zero = dinero(data.zero as unknown as DineroOptions<number>);
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
				let unitPrice = convert(
					dinero(item.unitPrice as unknown as DineroOptions<number>),
					selectedCurrency.dineroObj
				);
				if (!unitPrice) {
					unitPrice = zero;
				}

				return { ...item, unitPrice: toSnapshot(unitPrice) };
			})
		];

		getCountAndSubTotal(order.OrderLine);
	};

	const handleCalculations = async (lineArray: SaveOrdersLine[] = []) => {
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

	let order: SaveOrder;

	let zero = dinero({ amount: 0, currency: USD });

	let subTotal = zero;

	const getCountAndSubTotal = (cart: any[]) => {
		const totals = cart.reduce(
			(acc, item) => {
				return {
					totalCartItems: acc.totalCartItems + item.quantity,
					subTotal: add(
						acc.subTotal,
						multiply(dinero(item.unitPrice as unknown as DineroOptions<number>), item.quantity)
					)
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
