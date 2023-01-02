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
	import { Menu, MenuButton, MenuItems, MenuItem } from '@rgossiaux/svelte-headlessui';
	import logger from '$lib/utility/logger';
	import { format } from '$lib/services/monetary';
	import { add, dinero, multiply } from 'dinero.js';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type {
		Address,
		Contacts,
		Email,
		OrderLine,
		Orders,
		Phone,
		Pricelists,
		Products
	} from '@prisma/client';
	import type { Pagination } from '$lib/utility/pagination.util';
	import { USD } from '@dinero.js/currencies';

	type OrdersResultsType = (Orders & {
		Pricelists: Pricelists;
		OrderLine: (OrderLine & { Products: Products })[];
	})[];

	type ContactsTypes = Contacts & Email & Phone & Address;

	type OrdersType = Pagination & { results: OrdersResultsType[] };

	export let data: { customer: ContactsTypes; orders: OrdersType };

	const tableHeading = ['Order #', 'Date', 'Date Due', 'Total', 'Status', 'View'];

	let contact = data.customer;
	let orders = data.orders;

	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		customersID: $page.params.id
	};

	let zero = dinero({ amount: 0, currency: USD });

	const calculateTotal = (orderLine: any[]) => {
		const totals = orderLine.reduce(
			(acc, item) => {
				return {
					totalCartItems: acc.totalCartItems + item.quantity,
					subTotal: add(acc.subTotal, multiply(dinero(item.unitPrice), item.quantity))
				};
			},
			{ totalCartItems: 0, subTotal: zero }
		);

		return totals.subTotal;
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
		getOrders(currentGlobalParams);
	};

	const getOrders = async (paramsObj: any) => {
		try {
			let SearchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/orders.json?' + SearchParams.toString());
			orders = await res.json();
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	const gotoContacts = async () => {
		await goto(`/contacts`);
	};
	const handleEdit = async (id: string) => {
		await goto(`/contacts/edit/${parseInt(id)}`);
	};
	const viewOrder = async (id: number) => {
		await goto(`/cart/view/${id}`);
	};
</script>

<svelte:head>
	<title>Contacts Details</title>
</svelte:head>

{#if contact}
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Heading and Buttons -->
		<div class="main-header flex flex-row items-center justify-between">
			<div class="flex">
				<button class="mr-3" on:click={gotoContacts}>
					{@html svgArrow}
				</button>
				<h1 class="text-slate-700 text-2xl font-medium">Contacts</h1>
			</div>

			<button class="btn btn-primary inline-flex items-center justify-center px-3">
				<span>
					{@html svgPlus}
				</span>

				<span class="ml-2">Add Order</span>
			</button>
		</div>

		<div class="mt-4 flex h-full flex-col  xl:flex-row">
			<!-- Contact Card -->
			<div
				class="mr-4 flex w-full basis-1/4 flex-col border-t-4 border-royal-blue-500 bg-white shadow-lg"
			>
				<div class="flex items-center justify-between">
					<h4 class="p-4 text-lg font-medium text-pickled-bluewood-600">
						{contact.name}
					</h4>
				</div>
				<div
					class="mx-4 mb-4 flex items-center justify-evenly border border-royal-blue-100 bg-pickled-bluewood-50"
				>
					<div class="p-2">
						<p class="p-2 text-xs font-semibold text-pickled-bluewood-500">BALANCE DUE</p>
						<span class="p-2 text-lg font-bold text-pickled-bluewood-500" />
					</div>
					<div class="p-2">
						<p class="p-2 text-xs font-semibold text-pickled-bluewood-500 ">TOTAL INVOICED</p>
						<span class="p-2 text-lg font-bold text-pickled-bluewood-500" />
					</div>
				</div>
				<div
					class="mx-4 mb-4 flex flex-col items-start border border-royal-blue-100 bg-pickled-bluewood-50"
				>
					<div class="p-2">
						<p class="p-2 text-sm font-semibold text-pickled-bluewood-500">Organisation</p>
						<p class="p-2 text-sm text-pickled-bluewood-500">
							{contact?.organisationID?.name ? contact?.organisationID?.name : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-2 text-sm font-semibold text-pickled-bluewood-500">Phone</p>
						<p class="p-2 text-sm text-pickled-bluewood-500">
							{contact.phone ? contact.phone.map((item) => item.phone).join(', ') : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-2 text-sm font-semibold text-pickled-bluewood-500">Email</p>
						<p class="p-2 text-sm text-pickled-bluewood-500">
							{contact.email ? contact.email : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-2 text-sm font-semibold text-pickled-bluewood-500">Company Details</p>
						<p class="p-2 text-sm text-pickled-bluewood-500">
							{contact.address ? contact.address : '...'}
						</p>
					</div>
					<div class="p-2">
						<p class="p-2 text-sm font-semibold text-pickled-bluewood-500">Notes</p>
						<p class="p-2 text-sm text-pickled-bluewood-500">
							{contact.notes ? contact.notes : '...'}
						</p>
					</div>
				</div>
			</div>
			<!-- End Contact -->
			<div class="flex grow basis-3/4 flex-col">
				<!-- Search and Grid/List Bar -->
				<!-- Search and View Bar -->
				<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-between bg-white">
					<div>
						<div class="relative flex flex-row items-center text-left">
							{#if orders}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
													on:click={handleSearchSelection}
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
									on:input={handleSearch}
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
											>Page {orders?.current.page} of {orders?.totalPages}({orders?.totalRecords} items)</span
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
													...orders?.current,
													limit: limit
												};
												getOrders(currentGlobalParams);
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
										disabled={!orders?.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...orders?.previous };
											getOrders(currentGlobalParams);
										}}
										class="{!orders?.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronLeft}</button
									>
								</li>
								<li>
									<button
										disabled={!orders?.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...orders?.previous };
											getOrders(currentGlobalParams);
										}}
										class="{!orders?.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!orders?.previous ? '' : orders?.previous?.page}</button
									>
								</li>
								<li>
									<button
										disabled
										class="btn border border-pickled-bluewood-600  bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100  disabled:bg-pickled-bluewood-600"
										>{orders?.current?.page}</button
									>
								</li>
								<li>
									<button
										disabled={!orders?.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...orders?.next };
											getOrders(currentGlobalParams);
										}}
										class="{!orders?.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!orders?.next ? '' : orders?.next?.page}</button
									>
								</li>
								<li>
									<button
										disabled={!orders?.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...orders?.next };
											getOrders(currentGlobalParams);
										}}
										class=" {!orders?.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronRight}</button
									>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="mt-6 flex flex-1 flex-wrap gap-4">
					<!-- Table start -->
					<div class="w-full bg-white py-6 shadow-lg">
						<div class="mx-6 block">
							<table class="w-full text-left text-sm">
								<thead>
									<tr
										class="border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
									>
										{#each tableHeading as heading (heading)}
											<th class="px-4 py-2">{heading}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#if orders?.results}
										{#each orders.results as order (order.id)}
											<tr
												class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 bg-pickled-bluewood-100 font-light text-pickled-bluewood-500"
											>
												<td class="px-4 py-2">{generateSONumber(order.id)}</td>
												<td class="px-4 py-2">{dayjs(order.orderDate).format('DD/MM/YYYY')}</td>
												<td class="px-4 py-2">{dayjs(order.deliveryDate).format('DD/MM/YYYY')}</td>
												<td class="px-4 py-2 text-right"
													>{format(calculateTotal(order.OrderLine))}</td
												>
												<td class="px-4 py-2 text-center">
													<span
														class="rounded-full bg-success px-3 py-1 text-xs font-bold text-white whitespace-nowrap"
														>{order.accountsStatus}</span
													>
												</td>
												<td class="p-1 text-center">
													<button class=" m-0 p-0" on:click={() => viewOrder(order.id)}>
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
