<script lang="ts">
	import { page } from '$app/stores';
	import {
		svgArrow,
		svgChevronLeft,
		svgChevronRight,
		svgPlus,
		svgView
	} from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import dayjs from 'dayjs';
	import { format } from '$lib/services/monetary';
	import { dinero } from 'dinero.js';
	import logger from '$lib/utility/logger';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type {
		Contacts,
		OrderLine,
		Orders,
		PricelistDetails,
		Pricelists,
		Products
	} from '@prisma/client';
	import type { Pagination } from '$lib/utility/pagination.util';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { onMount } from 'svelte';
	import { calculateProductPrices } from '$lib/services/orders/calculateAllPrice.product.services';

	type newOrder = Pagination & {
		results: (OrderLine & {
			Orders: Orders & {
				customerContact: Contacts;
			};
		})[];
	};

	type NewPricelists = Pricelists & { PricelistDetails: PricelistDetails[] };

	export let data: { product: Products; orders: newOrder; pricelist: NewPricelists };

	const updatePrices = () => {
		const calcPrice = calculateProductPrices(product, data.pricelist);
		if (!calcPrice) {
			return [];
		}
		return calcPrice;
	};

	$: updatePrices();
	const tableHeadings = ['Order #', 'Date', 'Customer', 'Due Date', 'State', 'View'];

	let product = data.product;
	let ordersList = data.orders;

	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		productsID: $page.params.id
	};

	const checkValue = () => {
		if (limit < 1) {
			limit = 1;
		}
	};

	let searchInputValue = '';
	let searchOption = 'id';

	const searchNamesOptions = {
		id: 'Order Number',
		organisation: 'Organisation',
		phone: 'Phone',
		email: 'Email',
		vatNo: 'Vat Number',
		balanceDue: 'Balance Due',
		state: 'State'
	};

	const handleSearchSelection = (event: MouseEvent) => {
		searchOption = (event.target as HTMLInputElement).name;
		searchInputValue = '';
	};

	const handleSearch = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		currentGlobalParams.page = 1;
		let searchWord = (event.target as HTMLInputElement).value;
		currentGlobalParams = { ...currentGlobalParams, [searchOption]: searchWord };
		getOrdersList(currentGlobalParams);
	};

	// Input must be of the form {limit, page, query}
	const getOrdersList = async (paramsObj: any) => {
		try {
			ordersList = await trpc().orders.getOrderLine.query(paramsObj);
		} catch (err: any) {
			handleErrors(err);
		}
	};

	onMount(() => {
		getOrdersList(currentGlobalParams);
	});

	const gotoProducts = async () => {
		goto(`/products`);
	};

	const viewOrder = async (id: number) => {
		goto(`/products/cart/view/${id}`);
	};
</script>

<svelte:head>
	<title>Product Details</title>
</svelte:head>

{#if product}
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Heading and Buttons -->
		<div class="main-header flex flex-row items-center justify-between">
			<div class="flex">
				<button class="mr-3" on:click|preventDefault={gotoProducts}>
					{@html svgArrow}
				</button>
				<h1 class="text-slate-700 text-2xl font-medium">Products</h1>
			</div>

			<button class="btn btn-primary inline-flex items-center justify-center px-3">
				<span>
					{@html svgPlus}
				</span>

				<span class="ml-2">Add Order</span>
			</button>
		</div>

		<div class="mt-4 flex h-full flex-col  xl:flex-row">
			<!-- Product Card -->
			<div
				class="mr-4 flex w-full basis-1/4 flex-col space-y-2 border-t-4 border-royal-blue-500 bg-white p-4 shadow-lg"
			>
				<div class="w-full border border-royal-blue-200 bg-pickled-bluewood-100 p-3">
					<h4 class="text-lg font-medium text-pickled-bluewood-600 ">
						{product.id}
					</h4>
				</div>
				<div class="w-full border border-royal-blue-200 bg-pickled-bluewood-100 p-3">
					<p class=" text-base font-medium text-royal-blue-500">
						{product.name}
					</p>
				</div>

				<div class="flex flex-col items-start border border-royal-blue-100 bg-pickled-bluewood-50">
					<div class="p-2">
						<p class="p-1 text-sm font-semibold text-pickled-bluewood-500">Stitches</p>
						<p class="p-1 text-sm text-pickled-bluewood-500">
							{product?.stitches ? product.stitches : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-1 text-sm font-semibold text-pickled-bluewood-500">Category</p>
						<p class="p-1 text-sm text-pickled-bluewood-500">
							{product?.productCategories ? product.productCategories : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-1 text-sm font-semibold text-pickled-bluewood-500">Unit Price</p>
						<div class="p-1 text-sm text-pickled-bluewood-500">
							<ul>
								{#each updatePrices() as item (item)}
									<li class="flex justify-between hover:bg-warning px-6 py-2">
										<span class="pr-4">{Object.keys(item)}</span>
										<span>{item[Object.keys(item)[0]]}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
					<div class="p-2">
						<p class="p-1 text-sm font-semibold text-pickled-bluewood-500">Quantity</p>
						<p class="p-1 text-sm text-pickled-bluewood-500">
							{product?.units ? product.units : '...'}
						</p>
					</div>
				</div>
			</div>
			<!-- End Product -->
			<div class="flex grow basis-3/4 flex-col">
				<!-- Search and Grid/List Bar -->
				<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-between bg-white">
					<div>
						<div class="relative flex flex-row items-center text-left" />
						<div />
					</div>
					<!-- View list Buttons -->
					<div class="flex flex-row items-center ">
						<div class="container mx-auto mr-4 flex justify-center">
							<ul class="flex">
								<li>
									<div class="inline-flex items-center">
										<span class="mr-2 text-xs text-pickled-bluewood-500"
											>Page {ordersList?.current.page} of {ordersList?.totalPages}({ordersList?.totalRecords}
											items)</span
										>
										<label class="mr-2 text-xs  text-pickled-bluewood-500" for="limit"
											>Display</label
										>
										<input
											class="input w-16 border"
											type="number"
											name="limit"
											id="limit"
											bind:value={limit}
											on:change={() => {
												currentGlobalParams = {
													...currentGlobalParams,
													...ordersList?.current,
													limit: limit
												};
												getOrdersList(currentGlobalParams);
											}}
											on:input={checkValue}
										/>

										<label class="mx-2 text-xs text-pickled-bluewood-500" for="limit"
											>per page</label
										>
									</div>
								</li>
								<li>
									<button
										disabled={!ordersList?.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...ordersList?.previous };
											getOrdersList(currentGlobalParams);
										}}
										class="{!ordersList?.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronLeft}</button
									>
								</li>
								<li>
									<button
										disabled={!ordersList?.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...ordersList?.previous };
											getOrdersList(currentGlobalParams);
										}}
										class="{!ordersList?.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!ordersList?.previous ? '' : ordersList?.previous?.page}</button
									>
								</li>
								<li>
									<button
										disabled
										class="btn border border-pickled-bluewood-600  bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100  disabled:bg-pickled-bluewood-600"
										>{ordersList?.current?.page}</button
									>
								</li>
								<li>
									<button
										disabled={!ordersList?.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...ordersList?.next };
											getOrdersList(currentGlobalParams);
										}}
										class="{!ordersList?.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!ordersList?.next ? '' : ordersList?.next?.page}</button
									>
								</li>
								<li>
									<button
										disabled={!ordersList?.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...ordersList?.next };
											getOrdersList(currentGlobalParams);
										}}
										class=" {!ordersList?.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronRight}</button
									>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto">
					<!-- Table start -->
					<div class="w-full bg-white py-6 shadow-lg">
						<div class="mx-6 block overflow-y-auto">
							<table class="w-full rounded-lg text-left">
								<thead>
									<tr
										class="border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
									>
										{#each tableHeadings as heading (heading)}
											<th class="px-4 py-2">{heading}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#if ordersList?.results}
										{#each ordersList.results as order (order.id)}
											<tr
												class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 bg-pickled-bluewood-100 font-light text-pickled-bluewood-500"
											>
												<td class="px-4 py-2">{generateSONumber(order.Orders.id)}</td>
												<td class="px-4 py-2"
													>{dayjs(order.Orders.orderDate).format('DD/MM/YYYY')}</td
												>
												<td class="px-4 py-2">{order.Orders.customerContact.name}</td>

												<td class="px-4 py-2"
													>{dayjs(order.Orders.deliveryDate).format('DD/MM/YYYY')}</td
												>

												<td class="px-4 py-2">
													<span
														class="rounded-full bg-success px-3 py-1 text-xs font-bold text-white"
														>{order.Orders.accountsStatus}</span
													>
												</td>
												<td class="p-1 text-center ">
													<button class=" m-0 p-0" on:click={() => viewOrder(order.Orders.id)}>
														<span class="fill-current text-pickled-bluewood-500">
															{@html svgView}
														</span>
													</button>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>
					</div>
					<!-- Table End -->
				</div>
			</div>
		</div>
	</div>
{:else}
	<Loading />
{/if}
