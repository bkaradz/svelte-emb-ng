<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import logger from '$lib/utility/logger';
	import type { Orders, Prisma } from '@prisma/client';
	import { add, dinero, multiply, toSnapshot } from 'dinero.js';
	import chunk from 'lodash-es/chunk';
	import PrintFirstPage from '$lib/components/print/PrintFirstPage.svelte';
	import PrintOtherPages from '$lib/components/print/PrintOtherPages.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { browser } from '$app/environment';
	import { createConverter } from '$lib/services/monetary';
	import { currenciesOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';

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
		const splitLine = splitOrderLine({ ...order });
		const pages = createPage(splitLine);
		pagesCreated = Array.from(pages.values());
	};

	onMount(() => {
		zero = dinero(data.zero);
		updatePrint(data);
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

	const partitionTwo = (array: any[], size: number) => {
		const results: any[] = [[], []];
		array.map((value, index) => {
			if (index <= size - 1) {
				results[0].push(value);
			} else {
				results[1].push(value);
			}
		});
		return results;
	};

	const createPage = (splitLine: any[]) => {
		let endPage = splitLine.length;
		let splitOrder = new Map();
		splitLine.map((value, index) => {
			if (index === endPage - 1) {
				splitOrder.set(index + 1, {
					...order,
					showTotals: true,
					page: `${index + 1} of ${endPage}`,
					OrderLine: value
				});
				return;
			}
			splitOrder.set(index + 1, {
				...order,
				showTotals: false,
				page: `${index + 1} of ${endPage}`,
				OrderLine: value
			});
		});
		return splitOrder;
	};

	const splitOrderLine = (order: any = []) => {
		/**
		 * first page max with totals = 13
		 * first page max without totals = 16
		 * all other pages without address and totals = 19
		 * all other pages without address but with totals = 16
		 */
		const FIRST_PAGE_WITHOUT_TOTALS = 20;
		const OTHER_PAGES_WITHOUT_TOTALS = 22;
		const FIRST_PAGE_WITH_TOTALS = FIRST_PAGE_WITHOUT_TOTALS - 3;
		const OTHER_PAGES_WITH_TOTALS = OTHER_PAGES_WITHOUT_TOTALS - 3;

		const lineLength = order.OrderLine.length;

		if (lineLength <= FIRST_PAGE_WITH_TOTALS) {
			const firstPage = partitionTwo(order.OrderLine, FIRST_PAGE_WITH_TOTALS);
			firstPage.pop();
			return firstPage;
		}
		const firstPage = partitionTwo(order.OrderLine, FIRST_PAGE_WITHOUT_TOTALS);

		if (firstPage[1].length === 0 || firstPage[1].length <= OTHER_PAGES_WITH_TOTALS) {
			return firstPage;
		}

		const otherPages: any[] = chunk(firstPage.pop(), OTHER_PAGES_WITHOUT_TOTALS);

		if (otherPages[otherPages.length - 1].length <= OTHER_PAGES_WITH_TOTALS) {
			return [...firstPage, ...otherPages];
		}

		return [...firstPage, ...otherPages, []];
	};

	let pagesCreated: any;

	let zero = dinero(data.zero);

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

{#if pagesCreated}
	{#each pagesCreated as value, key (key)}
		{#if key === 0}
			<PrintFirstPage order={value} {subTotal} {calclculatedVat} {calclculatedTotal} {vat} />
		{:else}
			<PrintOtherPages order={value} {subTotal} {calclculatedVat} {calclculatedTotal} {vat} />
		{/if}
	{/each}
{/if}
