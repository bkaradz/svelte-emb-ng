<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import logger from '$lib/utility/logger';
	import type { Prisma } from '@prisma/client';
	import { add, dinero, multiply } from 'dinero.js';
	import { USD } from '@dinero.js/currencies';
	import chunk from 'lodash-es/chunk';
	import PrintFirstPage from '$lib/components/print/PrintFirstPage.svelte';
	import PrintOtherPages from '$lib/components/print/PrintOtherPages.svelte';

	// function getPDF() {
	// 	console.log('object');
	// 	html2canvas(document.getElementById('toPDF'), {
	// 		onrendered: function (canvas) {
	// 			const img = canvas.toDataURL('image/png');
	// 			console.log('🚀 ~ file: +page.svelte ~ line 19 ~ html2canvas ~ img', img);
	// 			const doc = new jsPDF('l', 'cm');
	// 			doc.addImage(img, 'PNG', 2, 2);
	// 			doc.save('reporte.pdf');
	// 		}
	// 	});
	// }

	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		id: $page.params.id
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
		 * first page max without totals = 16
		 * first page max with totals = 13
		 * all other pages without address and totals = 19
		 * all other pages without address but with totals = 16
		 */

		const lineLength = order.OrderLine.length;

		if (lineLength <= 13) {
			const firstPage = partitionTwo(order.OrderLine, 13);
			firstPage.pop();
			return firstPage;
		}
		const firstPage = partitionTwo(order.OrderLine, 16);

		if (firstPage[1].length === 0 || firstPage[1].length <= 16) {
			return firstPage;
		}

		const otherPages: any[] = chunk(firstPage.pop(), 19);

		if (otherPages[otherPages.length - 1].length <= 16) {
			return [...firstPage, ...otherPages];
		}

		return [...firstPage, ...otherPages, []];
	};

	let pagesCreated: any;

	const getOrders = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/orders.json?' + searchParams.toString());
			if (res.ok) {
				const resOrder = await res.json();

				order = resOrder.results[0];
				getCountAndSubTotal(order.OrderLine);
				const splitLine = splitOrderLine({ ...order });
				pagesCreated = Array.from(createPage(splitLine).values());
				// getPDF();
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	onMount(() => {
		getOrders(currentGlobalParams);
	});

	let currentCurrency = USD;

	let zero = dinero({ amount: 0, currency: currentCurrency });

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

<div class="flex flex-1 flex-col w-full" id="toPDF">
	<div
		class="flex flex-1 flex-wrap items-center justify-center bg-royal-blue-50 border-danger overflow-y-scroll gap-3 p-3"
	>
		{#if pagesCreated}
			{#each pagesCreated as value, key (key)}
				{#if key === 0}
					<PrintFirstPage order={value} {subTotal} {calclculatedVat} {calclculatedTotal} {vat} />
				{:else}
					<PrintOtherPages order={value} {subTotal} {calclculatedVat} {calclculatedTotal} {vat} />
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style lang="postcss">
</style>
