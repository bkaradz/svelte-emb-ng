<script lang="ts">
	import { page } from '$app/stores';
	import logger from '$lib/utility/logger';
	import type { Pagination } from '$lib/utility/pagination.util';
	import type { Prisma } from '@prisma/client';
	import * as pdfMake from 'pdfmake/build/pdfmake';
	import * as pdfFonts from 'pdfmake/build/vfs_fonts';
	import small_logo from '$lib/assets/small_logo.png';

	// (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		id: $page.params.id
	};

	type Orders = Pagination & { results: Prisma.OrdersGetPayload<Prisma.OrdersArgs>[] };

	let orders: Orders;
	$: console.log('🚀 ~ file: +page.svelte ~ line 17 ~ orders', orders);

	const getOrders = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/orders.json?' + searchParams.toString());
			orders = await res.json();
		} catch (err: any) {
			console.log('🚀 ~ file: +page.svelte ~ line 25 ~ getOrders ~ err', err);
			logger.error(err.message);
		}
	};

	const ct: any[] = [];

	ct.push({
		columns: [
			{
				width: 'auto',
				text: 'auto column'
			},
			{
				width: '*',
				text: 'This is a star-sized column. It should get the remaining space divided by the number of all star-sized columns.'
			},
			{
				width: 50,
				text: 'this one has specific width set to 50'
			},
			{
				width: 'auto',
				text: 'another auto column'
			},
			{
				width: '*',
				text: 'This is a star-sized column. It should get the remaining space divided by the number of all star-sized columns.'
			}
		]
	});

	const test = 'outside';

	getOrders(currentGlobalParams);

	const handlePrint = () => {
		const docDefinition = {
			footer: function (currentPage, pageCount) {
				return currentPage.toString() + ' of ' + pageCount;
			},
			header: function (currentPage, pageCount, pageSize) {
				// you can apply any logic and return any valid pdfmake element

				return {
					columns: [
						{
							width: 'auto',
							text: test
						},
						{
							width: '*',
							text: 'This is a star-sized column. It should get the remaining space divided by the number of all star-sized columns.'
						},
						{
							width: 50,
							text: 'this one has specific width set to 50'
						},
						{
							width: 'auto',
							text: 'another auto column'
						},
						{
							width: '*',
							text: 'This is a star-sized column. It should get the remaining space divided by the number of all star-sized columns.'
						}
					]
				};
			},
			content: ct
		};
		pdfMake.createPdf(docDefinition).open();
	};
</script>

<div>
	<button class="btn btn-primary" on:click={handlePrint}>Print pdfmake</button>
</div>

<style>
</style>
