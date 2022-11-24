<script lang="ts">
	import { page } from '$app/stores';
	import {
		svgArrow,
		svgChevronLeft,
		svgChevronRight,
		svgPlus,
		svgSearch,
		svgSelector,
		svgView
	} from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import dayjs from 'dayjs';
	import { format } from '$lib/services/monetary';
	import { dinero } from 'dinero.js';
	import { Menu, MenuButton, MenuItems, MenuItem } from '@rgossiaux/svelte-headlessui';
	import logger from '$lib/utility/logger';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type { Contacts, OrderLine, Orders, Products } from '@prisma/client';
	import type { Pagination } from '$lib/utility/pagination.util';

	type newOrder = Pagination & {
		results: (OrderLine & {
			Orders: Orders & {
				customerContact: Contacts;
			};
		})[];
	};

	export let data: { product: Products; orders: newOrder };

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

	const heandleSearchSelection = (event: MouseEvent) => {
		searchOption = (event.target as HTMLInputElement).name;
		searchInputValue = '';
	};

	const heandleSearch = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		currentGlobalParams.page = 1;
		let searchWord = (event.target as HTMLInputElement).value;
		currentGlobalParams = { ...currentGlobalParams, [searchOption]: searchWord };
		getOrdersList(currentGlobalParams);
	};

	// Input must be of the form {limit, page, query}
	const getOrdersList = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/orderLine.json?' + searchParams.toString());
			ordersList = await res.json();
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	const gotoProducts = async () => {
		goto(`/products`);
	};

	const viewOrder = async (id: number) => {
		goto(`/cart/view/${id}`);
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
						<p class="p-1 text-sm text-pickled-bluewood-500">
							{!product?.unitPrice ? '...' : format(dinero(product.unitPrice))}
						</p>
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
						<div class="relative flex flex-row items-center text-left">
							{#if ordersList}
								<Menu as="div" class="relative">
									<MenuButton
										class="btn inline-flex w-full items-center justify-center px-2 py-2 text-xs text-pickled-bluewood-500 hover:bg-pickled-bluewood-50 focus:outline-none focus:ring-royal-blue-50 focus:ring-offset-transparent"
										id="menu-button"
										aria-expanded="true"
										aria-haspopup="true"
									>
										Search by {searchNamesOptions[searchOption]}
										<span>
											{@html svgSelector}
										</span>
									</MenuButton>

									<MenuItems
										class=" absolute left-2 top-9 z-10 mt-2 w-40 origin-top-right divide-y divide-pickled-bluewood-100 bg-white shadow-lg ring-1 ring-royal-blue-300 focus:outline-none"
										role="menu"
										aria-orientation="vertical"
										aria-labelledby="menu-button"
									>
										<div class="py-1" role="none">
											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="id"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-0"
												>
													Order Number
												</a>
											</MenuItem>

											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="organisation"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-1">Organisation</a
												>
											</MenuItem>

											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="phone"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-2">Phone</a
												>
											</MenuItem>
											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="email"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-3">Email</a
												>
											</MenuItem>

											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="vatNo"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-4">Vat Number</a
												>
											</MenuItem>
											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="balanceDue"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-5">Balance Due</a
												>
											</MenuItem>

											<MenuItem let:active>
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<a
													on:click={heandleSearchSelection}
													name="state"
													class={`${
														active ? 'active bg-royal-blue-500 text-white' : 'inactive'
													} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
													role="menuitem"
													id="menu-item-6">State</a
												>
											</MenuItem>
										</div>
									</MenuItems>
								</Menu>
							{/if}

							<div class="relative text-pickled-bluewood-100">
								<input
									class="input focus:shadow-outline h-10 w-full pl-8 pr-3 text-base placeholder-pickled-bluewood-400"
									type="text"
									placeholder="Search..."
									bind:value={searchInputValue}
									on:input={heandleSearch}
								/>
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2">
									{@html svgSearch}
								</div>
							</div>
						</div>
						<div />
					</div>
					<!-- Veiw list Buttons -->
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
