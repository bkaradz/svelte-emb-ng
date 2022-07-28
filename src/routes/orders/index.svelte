<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import { format } from '$lib/services/monetary';
	import logger from '$lib/utility/logger';
	import {
		svgChevronLeft,
		svgChevronRight,
		svgGrid,
		svgList,
		svgPlus,
		svgSearch,
		svgSelector,
		svgView
	} from '$lib/utility/svgLogos';
	import { Menu, MenuButton, MenuItem, MenuItems } from '@rgossiaux/svelte-headlessui';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	// interface ContentIterface {
	// 	results: [
	// 		{
	// 			_id: string;
	// 			name: string;
	// 			isCorporate: boolean;
	// 			notes: string;
	// 			vatOrBpNo: string;
	// 			email: string;
	// 			phone: string;
	// 			address: string;
	// 			balanceDue: number;
	// 			totalReceipts: number;
	// 			isActive: boolean;
	// 			organizationID: {
	// 				name: string;
	// 			};
	// 		}
	// 	];
	// 	_id: string;
	// 	totalRecords: number;
	// 	totalPages: number;
	// 	limit: number;
	// 	previous: { page: number; limit: number };
	// 	current: { page: number; limit: number };
	// 	next: { page: number; limit: number };
	// }

	// interface getContactsInterface {
	// 	limit: number;
	// 	page: number;
	// 	sort?: string;
	// 	query?: string;
	// 	name?: string;
	// 	organisation?: string;
	// 	phone?: string;
	// 	email?: string;
	// 	vatNo?: string;
	// 	balanceDue?: string;
	// 	state?: string;
	// 	isCorporate?: boolean;
	// 	isActive?: boolean;
	// 	isUser?: boolean;
	// }

	const tableHeadings = [
		{ id: 1, name: 'Order Number', dbName: 'orderID' },
		{ id: 2, name: 'Customer', dbName: 'customerID' },
		{ id: 3, name: 'Pricelist', dbName: 'pricelistID' },
		{ id: 4, name: 'Order Date', dbName: 'orderDate' },
		{ id: 5, name: 'Expiry Date', dbName: 'quoteExpiryDate' },
		{ id: 6, name: 'Required Date', dbName: 'requiredDate' },
		{ id: 7, name: 'Balance Due', dbName: 'balance' },
		{ id: 8, name: 'Status', dbName: 'accountsStatus' },
		{ id: 9, name: 'View', dbName: null },
		{ id: 10, name: 'Edit', dbName: null }
	];

	let orders;
	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		sort: 'name'
	};

	const checkValue = () => {
		if (limit < 1) {
			limit = 1;
		}
	};

	onMount(() => {
		getOrders(currentGlobalParams);
	});

	const viewOrder = async (id: string) => {
		await goto(`/orders/view/${id}`);
	};

	const gotoAddOrders = async () => {
		await goto(`/orders/add`);
	};

	let gridView = false;
	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = {
		name: 'Name',
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
		getOrders(currentGlobalParams);
	};

	// Input must be of the form {limit, page, sort, query}
	const getOrders = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/orders.json?' + searchParams.toString());
			orders = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};
</script>

<svelte:head>
	<title>Sales</title>
</svelte:head>

{#if orders}
	<div class="flex flex-1 flex-col overflow-hidden">
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<h1 class="text-slate-700 text-2xl font-medium">Sales</h1>
				<div class="flex items-center space-x-1">
					<button
						on:click={gotoAddOrders}
						class="btn btn-primary inline-flex items-center justify-center px-3"
					>
						<span>
							{@html svgPlus}
						</span>

						<span class="ml-2">Quotation</span>
					</button>
					<button
						on:click={gotoAddOrders}
						class="btn btn-primary inline-flex items-center justify-center px-3"
					>
						<span>
							{@html svgPlus}
						</span>

						<span class="ml-2">Sales Order</span>
					</button>
				</div>
			</div>

			<!-- Search and View Bar -->
			<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-between bg-white">
				<div>
					<div class="relative flex flex-row items-center text-left">
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
										<a
											on:click={heandleSearchSelection}
											name="name"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-0"
										>
											Name
										</a>
									</MenuItem>

									<MenuItem let:active>
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
										>Page {orders.current.page} of {orders.totalPages}({orders.totalRecords} items)</span
									>
									<label class="mr-2 text-xs  text-pickled-bluewood-500" for="limit">Display</label>
									<input
										class="input w-16 border"
										type="number"
										name="limit"
										id="limit"
										bind:value={limit}
										on:change={() => {
											currentGlobalParams = {
												...currentGlobalParams,
												...orders.current,
												limit: limit
											};
											getOrders(currentGlobalParams);
										}}
										on:input={checkValue}
									/>

									<label class="mx-2 text-xs text-pickled-bluewood-500" for="limit">per page</label>
								</div>
							</li>
							<li>
								<button
									disabled={!orders.previous}
									on:click|preventDefault={() => {
										currentGlobalParams = { ...currentGlobalParams, ...orders.previous };
										getOrders(currentGlobalParams);
									}}
									class="{!orders.previous
										? 'hidden'
										: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{@html svgChevronLeft}</button
								>
							</li>
							<li>
								<button
									disabled={!orders.previous}
									on:click|preventDefault={() => {
										currentGlobalParams = { ...currentGlobalParams, ...orders.previous };
										getOrders(currentGlobalParams);
									}}
									class="{!orders.previous
										? 'hidden'
										: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{!orders.previous ? '' : orders.previous.page}</button
								>
							</li>
							<li>
								<button
									disabled
									class="btn border border-pickled-bluewood-600  bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100  disabled:bg-pickled-bluewood-600"
									>{orders.current.page}</button
								>
							</li>
							<li>
								<button
									disabled={!orders.next}
									on:click|preventDefault={() => {
										currentGlobalParams = { ...currentGlobalParams, ...orders.next };
										getOrders(currentGlobalParams);
									}}
									class="{!orders.next
										? 'hidden'
										: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{!orders.next ? '' : orders.next.page}</button
								>
							</li>
							<li>
								<button
									disabled={!orders.next}
									on:click|preventDefault={() => {
										currentGlobalParams = { ...currentGlobalParams, ...orders.next };
										getOrders(currentGlobalParams);
									}}
									class=" {!orders.next
										? 'hidden'
										: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{@html svgChevronRight}</button
								>
							</li>
						</ul>
					</div>
					<!-- List and Grid Buttons -->
					<button
						on:click={() => (gridView = true)}
						class="{gridView ? 'btn-primary' : 'bg-pickled-bluewood-600'} btn btn-md mr-4 p-0"
					>
						{@html svgGrid}
					</button>
					<button
						on:click={() => (gridView = false)}
						class="{!gridView ? 'btn-primary' : 'bg-pickled-bluewood-600'} btn btn-md mr-6 p-0"
					>
						{@html svgList}
					</button>
				</div>
			</div>
		</div>
		<!-- List of Contacts -->
		<!-- TODO: fix overflow in list View so that the header is not hidden -->
		<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto">
			{#if gridView}
				{#each orders.results as order (order._id)}
					<div
						on:click|preventDefault={() => viewOrder(order._id)}
						class=" flex h-44 w-full max-w-xs grow flex-col border-t-4 border-royal-blue-500 bg-white shadow-lg hover:cursor-pointer hover:bg-pickled-bluewood-100 lg:w-1/6"
					>
						<div class="flex h-full items-center">
							<h4 class="truncate p-4 text-base font-medium text-pickled-bluewood-600">
								{order.orderID}
							</h4>
						</div>
						<div
							class="mx-4 mb-4 flex h-full items-center justify-evenly border  border-royal-blue-100 bg-pickled-bluewood-50"
						>
							<div class="p-1">
								<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">BALANCE DUE</p>
								<span class="p-1 text-base font-bold text-pickled-bluewood-500">
									{format(JSON.parse(order.balance))}
								</span>
							</div>
							<div class="p-1">
								<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">TOTAL INVOICED</p>
								<span class="p-1 text-base font-bold text-pickled-bluewood-500">
									<!-- {format(order.totalReceipts)} -->
								</span>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="flex flex-1 flex-wrap gap-4">
					<!-- Table start -->
					<div class="w-full bg-white py-6 shadow-lg">
						<div class="mx-6 block">
							<table class="w-full text-left text-sm">
								<thead class="sticky top-0">
									<tr
										class="border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
									>
										{#each tableHeadings as header (header.id)}
											<th class="px-2 py-2">{header.name}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each orders.results as order (order._id)}
										<tr
											class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1">{order.orderID}</td>
											<td class="px-2 py-1">{order?.customerID[0]?.name}</td>
											<td class="px-2 py-1">{order?.pricelistID[0]?.name}</td>
											<td class="px-2 py-1">{dayjs(order?.orderDate).format('DD/MM/YYYY')}</td>
											<td class="px-2 py-1">{dayjs(order?.quoteExpiryDate).format('DD/MM/YYYY')}</td
											>
											<td class="px-2 py-1">{dayjs(order?.requiredDate).format('DD/MM/YYYY')}</td>
											<td class="px-2 py-1 text-right">{format(JSON.parse(order.balance))}</td>
											<td class="flex items-center justify-end px-2 py-1">
												<span
													class="rounded-full capitalize bg-success px-3 py-1 text-xs font-bold text-white"
													>{order.accountsStatus}</span
												>
											</td>
											<td class="p-1 text-center ">
												<button class=" m-0 p-0" on:click={() => viewOrder(order._id)}
													><span class="fill-current text-pickled-bluewood-500"
														>{@html svgView}</span
													></button
												>
											</td>
											<td class="p-1 text-center ">
												<button class=" m-0 p-0" on:click={() => viewOrder(order._id)}
													><span class="fill-current text-pickled-bluewood-500"
														>{@html svgView}</span
													></button
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
					<!-- Table End -->
				</div>
			{/if}
		</div>
	</div>
{:else}
	<Loading />
{/if}
