<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import logger from '$lib/utility/logger';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import {
		svgChevronLeft,
		svgChevronRight,
		svgGrid,
		svgList,
		svgPencil,
		svgPrinter,
		svgSearch,
		svgView
	} from '$lib/utility/svgLogos';
	import dayjs from 'dayjs';
	import ArrowProgressBar from '$lib/components/ArrowProgressBar.svelte';
	import type { Orders } from '@prisma/client';
	import type { Pagination } from '$lib/utility/pagination.util';
	import { selectedCurrency, type CurrencyOption } from '$lib/stores/setCurrency.store';
	import { Buffer } from 'buffer';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	type newOrder = Orders & { selected: boolean };

	type OrdersNew = Pagination & { results: newOrder[] };

	export let data: { orders: OrdersNew };

	const tableHeadings = [
		{ id: 0, name: '', dbName: null },
		{ id: 1, name: 'Order #', dbName: 'orderID' },
		{ id: 2, name: 'Customer', dbName: 'customerID' },
		{ id: 3, name: 'Pricelist', dbName: 'pricelistID' },
		{ id: 4, name: 'Order Date', dbName: 'orderDate' },
		{ id: 5, name: 'Delivery Date', dbName: 'deliveryDate' },
		{ id: 8, name: 'Status', dbName: 'accountsStatus' },
		{ id: 9, name: 'View', dbName: null },
		{ id: 10, name: 'Edit', dbName: null },
		{ id: 11, name: 'Print', dbName: null }
	];

	let orders = data.orders;

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

	const viewOrder = async (id: number) => {
		goto(`/cart/view/${id}`);
	};

	const editOrder = async (order: newOrder) => {
		if (
			order.accountsStatus.toLowerCase() === 'invoice' ||
			order.accountsStatus.toLowerCase() === 'receipt'
		) {
			toasts.add({
				message: 'Editing an Invoice is not allowed',
				type: 'error'
			});
			return;
		}

		goto(`/cart/edit/${order.id}`);
	};

	let gridView = false;
	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'id', label: 'Order Number' },
		{ value: 'accountsStatus', label: 'Status' },
		{ value: 'pricelistsID', label: 'Pricelists' },
		{ value: 'orderDate', label: 'Order Date' }
	];

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

	// Input must be of the form {limit, page, sort, query}
	const getOrders = async (paramsObj: any) => {
		try {
			const resOrders = (await trpc().orders.getOrders.query(paramsObj)) as OrdersNew;
			resOrders.results = resOrders.results.map((item: newOrder) => {
				item.selected = false;
				return item;
			});
			orders = resOrders;
		} catch (err: any) {
			handleErrors(err);
		}
	};

	let selectedOrderId: number | null = null;
	let selectedOrder: newOrder | null = null;

	const handleSelected = (item: Orders & { selected: boolean }) => {
		getIdexOfAccounts(item);
		if (item.selected && selectedOrderId) {
			// unSelect the selected order
			orders.results = orders.results.map((list) => {
				if (list.id === selectedOrderId) {
					list.selected = false;
				}
				return list;
			});
			selectedOrderId = item.id;
			selectedOrder = item;
			return;
		}
		if (item.selected && !selectedOrderId) {
			selectedOrderId = item.id;
			selectedOrder = item;
			return;
		}
		selectedOrderId = null;
		selectedOrder = null;
	};

	const generateQuotation = async (order: newOrder) => {
		try {
			const res = await fetch('/api/pdf/quotation', {
				method: 'POST',
				body: JSON.stringify({
					url: 'http://localhost:5173/pdf/quotation/',
					currency: $selectedCurrency.currency,
					id: order.id
				}),
				headers: {
					Accept: 'application/json'
				}
			});

			if (res.ok) {
				const json = await res.json();

				const pdfBuffer = Buffer.from(json.pdf, 'base64');

				const file = new Blob([pdfBuffer], { type: 'application/pdf' });

				const fileURL = URL.createObjectURL(file);

				var fileLink = document.createElement('a');
				fileLink.href = fileURL;
				fileLink.download = `${generateSONumber(order.id)}-${order.accountsStatus}.pdf`;
				fileLink.click();
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	const generateReceipt = async (order: newOrder) => {
		try {
			const res = await fetch('/api/pdf/receipt', {
				method: 'POST',
				body: JSON.stringify({
					url: 'http://localhost:5173/pdf/receipt/',
					currency: $selectedCurrency.currency,
					id: order.id
				}),
				headers: {
					Accept: 'application/json'
				}
			});

			if (res.ok) {
				const json = await res.json();

				const pdfBuffer = Buffer.from(json.pdf, 'base64');

				const file = new Blob([pdfBuffer], { type: 'application/pdf' });

				const fileURL = URL.createObjectURL(file);

				var fileLink = document.createElement('a');
				fileLink.href = fileURL;
				fileLink.download = `${generateSONumber(order.id)}-${order.accountsStatus}.pdf`;
				fileLink.click();
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	const generatePDF = async (order: newOrder) => {
		if (order.accountsStatus.toLowerCase() === 'receipt') {
			generateReceipt(order);
			return;
		}

		generateQuotation(order);
	};

	let currentSelection = 1;

	const list = new Map([
		[0, 'Quotation'],
		[1, 'Sales Order'],
		[2, 'Invoice'],
		[3, 'Receipt']
	]);

	const getIdexOfAccounts = (order: newOrder) => {
		list.forEach((value, key) => {
			if (value === order.accountsStatus) {
				currentSelection = key;
			}
		});
	};

	const onClick = async (item: number) => {
		if (item <= currentSelection) {
			return;
		}
		currentSelection = item;

		try {
			const salesStatus = list.get(item);
			const data: Partial<{ id: number; accountsStatus: string; isInvoiced: boolean }> = {};
			if (selectedOrder && salesStatus) {
				// selectedOrder.accountsStatus = salesStatus;
				data.id = selectedOrder.id;
				data.accountsStatus = salesStatus;
				if (salesStatus === 'Invoice' || salesStatus === 'Receipt') {
					data.isInvoiced = true;
				}
			}

			const res = await trpc().orders.updateStatus.mutate(data);
			handleSelected(res);
		} catch (err: any) {
			console.log('???? ~ file: +page.svelte:270 ~ onClick ~ err', err);
			handleErrors(err);
		} finally {
			getOrders(currentGlobalParams);
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
			<div class="main-header flex flex-row items-center justify-between h-11">
				<h1 class="text-slate-700 text-2xl font-medium">Sales</h1>

				<div class="flex items-center space-x-1">
					{#if selectedOrderId}
						<ArrowProgressBar list={Array.from(list.values())} {currentSelection} {onClick} />
					{/if}
				</div>
			</div>

			<!-- Search and View Bar -->
			<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-between bg-white">
				<div>
					<div
						class="flex items-center bg-white shadow-lg hover:shadow-xl ml-3 transform hover:scale-105 transition duration-500"
					>
						<div class="relative text-pickled-bluewood-100">
							<input
								class="input w-full pl-8 pr-3 text-base bg-pickled-bluewood-50 placeholder-pickled-bluewood-400 outline-none border-none focus:border-none"
								type="text"
								placeholder="Search..."
								bind:value={searchInputValue}
								on:input={handleSearch}
							/>
							<div
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-pickled-bluewood-400"
							>
								{@html svgSearch}
							</div>
						</div>
						<div
							class="flex items-center text-sm pl-3 text-pickled-bluewood-500 font-semibold cursor-pointer"
						>
							<span>
								{#if Array.isArray(searchNamesOptions)}
									<select
										bind:value={searchOption}
										on:select={() => handleSearchSelection}
										class="text-sm border-none cursor-pointer bg-white input"
									>
										{#each searchNamesOptions as type}
											<option value={type.value}>
												{type.label}
											</option>
										{/each}
									</select>
								{/if}
							</span>
						</div>
						<button
							class="hidden bg-pickled-bluewood-600 text-white text-sm px-3 mx-1 py-1 font-semibold hover:shadow-lg transition duration-3000"
						>
							Search
						</button>
					</div>
				</div>
				<!-- View list Buttons -->
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
		<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto">
			{#if gridView}
				{#each orders.results as order (order.id)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						on:click|preventDefault={() => viewOrder(order.id)}
						class=" flex h-44 w-full max-w-xs grow flex-col border-t-4 border-royal-blue-500 bg-white shadow-lg hover:cursor-pointer hover:bg-pickled-bluewood-100 lg:w-1/6"
					>
						<div class="flex h-full items-center">
							<h4 class="truncate p-4 text-base font-medium text-pickled-bluewood-600">
								{generateSONumber(order?.id)}
							</h4>
						</div>
						<div
							class="mx-4 mb-4 flex h-full items-center justify-evenly border  border-royal-blue-100 bg-pickled-bluewood-50"
						>
							<div class="p-1">
								<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">BALANCE DUE</p>
								<span class="p-1 text-base font-bold text-pickled-bluewood-500">
									<!-- {format(dinero(order?.balance))} -->
								</span>
							</div>
							<div class="p-1">
								<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">TOTAL INVOICED</p>
								<span class="p-1 text-base font-bold text-pickled-bluewood-500">
									<!-- {format(dinero(order.totalReceipts))} -->
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
									{#each orders.results as order (order.id)}
										<tr
											class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1 w-8">
												<input
													bind:checked={order.selected}
													on:change={(e) => handleSelected(order)}
													type="checkbox"
													name="select"
													id="select"
												/>
											</td>
											<td class="px-2 py-1 w-24">{generateSONumber(order?.id)}</td>
											<td class="px-2 py-1"
												>{`${order?.customerContact?.name}`}
												<span
													class="inline-flex justify-center items-center ml-1 px-1 h-4 text-xs font-semibold text-royal-blue-800 bg-royal-blue-200 rounded-full"
												>
													{order?.customerContact?.id}
												</span>
											</td>
											<td class="px-2 py-1">
												{`${order?.Pricelists?.name}`}
												<span
													class="inline-flex justify-center items-center ml-1 px-1 h-4 text-xs font-semibold text-royal-blue-800 bg-royal-blue-200 rounded-full"
												>
													{order?.Pricelists?.id}
												</span>
											</td>
											<td class="px-2 py-1 w-28">{dayjs(order?.orderDate).format('DD/MM/YYYY')}</td>
											<td class="px-2 py-1 w-28"
												>{dayjs(order?.deliveryDate).format('DD/MM/YYYY')}</td
											>
											<td class=" text-left justify-end px-2 py-1">
												<span
													class="rounded-full capitalize bg-success px-3 py-1 text-xs font-bold text-white"
													>{order.accountsStatus}</span
												>
											</td>
											<td class="p-1 text-center">
												<button class=" m-0 p-0" on:click={() => viewOrder(order.id)}
													><span class="fill-current text-pickled-bluewood-500"
														>{@html svgView}</span
													></button
												>
											</td>
											<td class="p-1 text-center">
												<button class=" m-0 p-0" on:click={() => editOrder(order)}
													><span class="fill-current text-pickled-bluewood-500"
														>{@html svgPencil}</span
													></button
												>
											</td>
											<td class="p-1 text-center">
												<button class=" m-0 p-0" on:click={() => generatePDF(order)}
													><span class="fill-current text-pickled-bluewood-500"
														>{@html svgPrinter}</span
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
