<script lang="ts">
	import { browser } from '$app/environment';
	import PrintFirstPage from '$lib/components/print/PrintFirstPage.svelte';
	import PrintOtherPages from '$lib/components/print/PrintOtherPages.svelte';
	import { createConverter } from '$lib/services/monetary';
	import { currenciesOptions, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import type { GetQuotationOrderPrismaReturn } from '$lib/trpc/routes/orders.prisma';
	import logger from '$lib/utility/logger';
	import type { SaveOrder, SaveOrdersLine } from '$lib/validation/saveOrder.validate';
	import { USD } from '@dinero.js/currencies';
	import { add, dinero, multiply, toSnapshot, type DineroOptions } from 'dinero.js';
	import chunk from 'lodash-es/chunk';
	import { onMount } from 'svelte';

	type ResultsType = (OrderLineType)[]
	type OrderLineType = GetQuotationOrderPrismaReturn['order']['OrderLine']
	type OrderType = GetQuotationOrderPrismaReturn['order']
	type PageType = OrderType & {showTotals: boolean, page: string}

	export let data: GetQuotationOrderPrismaReturn;

	const updatePrint = async (data: GetQuotationOrderPrismaReturn) => {
		if (!data?.order) {
			return;
		}
		Array.from($currenciesOptions.values()).forEach((item) => {
			if (item.currency === data.selectedCurrency.currency) {
				data.selectedCurrency = item;
			}
		});
		zero = dinero({ amount: 0, currency: data.selectedCurrency.dineroObj });

		await handleCurrency(data.order.OrderLine, data.selectedCurrency);
		getCountAndSubTotal(data.order.OrderLine as SaveOrdersLine[]);
		const splitLine = splitOrderLine({ ...data.order });
		const pages = createPage(splitLine);
		pagesCreated = Array.from(pages.values());
	};

	onMount(() => {
		if (data?.zero) {
			zero = dinero(data.zero as unknown as DineroOptions<number>);
		}
		if (data?.order) {
			updatePrint(data);
		}
	});

	const handleCurrency = async (lineArray: OrderLineType, selectedCurrency: CurrencyOption) => {
		zero = dinero(data.zero as unknown as DineroOptions<number>);
		/**
		 * Calculate using the cart default usd currency
		 */
		let newArray;
		if (browser) {
			newArray = await handleCalculations(lineArray as SaveOrdersLine[]);
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

		getCountAndSubTotal(order.OrderLine as SaveOrder['OrderLine']);
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

	let order: OrderType;

	const partitionTwo = (array: OrderLineType, size: number) => {
		
		const results: ResultsType = [[], []];
		array.map((value, index) => {
			if (index <= size - 1) {
				results[0].push(value);
			} else {
				results[1].push(value);
			}
		});
		return results;
	};

	const createPage = (splitLine: ResultsType) => {
		let endPage = splitLine.length;
		
		let splitOrder = new Map<number, PageType>();
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

	const splitOrderLine = (order: (GetQuotationOrderPrismaReturn['order'])) => {
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

		if (!Array.isArray(order.OrderLine)) {
			throw new Error("Order Line not found");
		}

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

		const otherPages = chunk(firstPage.pop(), OTHER_PAGES_WITHOUT_TOTALS);

		if (otherPages[otherPages.length - 1].length <= OTHER_PAGES_WITH_TOTALS) {
			return [...firstPage, ...otherPages];
		}

		return [...firstPage, ...otherPages, []];
	};

	let pagesCreated: PageType[]

	let zero = dinero({ amount: 0, currency: USD });

	// let totalCartItems = 0;
	let subTotal = zero;

	const getCountAndSubTotal = (cart: SaveOrdersLine[]) => {
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
		// totalCartItems = totals.totalCartItems;
		subTotal = totals.subTotal;
	};
</script>

<svelte:head>
	<title>Printing</title>
</svelte:head>

{#if pagesCreated}
	{#each pagesCreated as value, key (key)}
		{#if key === 0}
			<PrintFirstPage order={value} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
		{:else}
			<PrintOtherPages order={value} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
		{/if}
	{/each}
{/if}
