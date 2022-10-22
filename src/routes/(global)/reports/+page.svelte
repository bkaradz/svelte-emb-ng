<script lang="ts">
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import { Buffer } from 'buffer';
	import { add, dinero, multiply } from 'dinero.js';
	import chunk from 'lodash-es/chunk';
	import type { Prisma } from '@prisma/client';
	import { page } from '$app/stores';
	import { USD } from '@dinero.js/currencies';

	// const file = new Blob([response.data], { type: 'application/pdf' })

	//       const fileURL = URL.createObjectURL(file)

	//       const pdfWindow = window.open()
	//       pdfWindow.location.href = fileURL
	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		id: 1
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
					subTotal: subTotal,
					calclculatedVat: calclculatedVat,
					calclculatedTotal: calclculatedTotal,
					vat: vat,
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

	const generatePDF = async () => {
		try {
			const res = await fetch('/api/pdf.json', {
				method: 'POST',
				body: JSON.stringify({ url: 'http://localhost:5173/print/quotation/', id: 4 }),
				headers: {
					Accept: 'application/json'
				}
			});

			if (res.ok) {
				const json = await res.json();

				const pdfBuffer = Buffer.from(json.pdf, 'base64');

				const file = new Blob([pdfBuffer], { type: 'application/pdf' });

				const fileURL = URL.createObjectURL(file);

				const pdfWindow = window.open();

				if (pdfWindow) {
					pdfWindow.location.href = fileURL;
				}
			}
		} catch (err: any) {
			console.log('err', err);
			logger.error(`Error: ${err}`);
		}
	};
</script>

<div>
	<div class="btn btn-primary mt-4">
		<button on:click={generatePDF}> Generate PDF puppetter </button>
	</div>
	<h1 class=" text-2xl text-danger mt-8">Testing Gone Wrong</h1>
</div>

<style>
</style>
