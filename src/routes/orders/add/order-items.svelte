<script lang="ts">
	import type { Schema } from 'mongoose';
	import {
		svgChevronLeft,
		svgChevronRight,
		svgPlus,
		svgPlusSmall,
		svgSearch,
		svgSelector
	} from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import { Menu, MenuButton, MenuItems, MenuItem } from '@rgossiaux/svelte-headlessui';
	import Loading from '$lib/components/Loading.svelte';
	import { orderItems } from '$lib/stores/order.items.store';
	import type { ProductsDocument } from '$lib/models/products.models';
	import type { PricelistsDocument } from '$lib/models/pricelists.model';
	import type { OptionsDocument } from '$lib/models/options.models';
	import Combobox from '$lib/components/Combobox.svelte';
	import { calculateOrder } from '$lib/services/orders';
	
	interface productIterface {
		results: ProductsDocument[];
		totalRecords: number;
		totalPages: number;
		limit: number;
		previous: { page: number; limit: number };
		current: { page: number; limit: number };
		next: { page: number; limit: number };
	}

	let itemList = [];
	let products: productIterface;
	let pricelists: PricelistsDocument[];
	let options: OptionsDocument[];
	const selectedPricelist = { name: '' };
	$: console.log('🚀 ~ file: order-items.svelte ~ line 39 ~ selectedPricelist', selectedPricelist);

	let limit = 15;
	let currentGlobalParams = {
		limit,
		page: 1,
		sort: 'name'
	};

	const filterOptionsGroup = (group: string) => {
		return options.filter((option) => option.group === group);
	};

	const optionsToList = (optionsObj: OptionsDocument[]) => {
		return optionsObj.map((option) => option.name).reverse();
	};

	const optionsListMapObj = (optionsObj: OptionsDocument[]) => {
		return optionsObj.reduce((accumulator, option) => {
			return { ...accumulator, [option.name]: option.value };
		}, {});
	};

	const checkValue = () => {
		if (limit < 1) {
			limit = 1;
		}
	};

	onMount(() => {
		getProducts(currentGlobalParams);
		getPricelists();
		getOptions();
	});

	const viewProducts = async (id: string) => {
		await goto(`/products/view/${id}`);
	};

	const gotoAddProducts = async () => {
		await goto(`/orders/add`);
	};

	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = {
		name: 'Name',
		stitches: 'Stitches',
		productID: 'Product ID',
		title: 'Title',
		description: 'Description',
		unitPrice: 'Unit Price',
		quantity: 'Quantity',
		productCategories: 'Category'
	};

	const tableHeadings = [
		'Name',
		'ProductID',
		'Category',
		'Emb Type',
		'Emb Position',
		'Stitches',
		'Quantity',
		'Unit Price',
		'Total'
	];

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
		getProducts(currentGlobalParams);
	};

	const getProducts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/products.json?' + searchParams.toString());
			products = await res.json();
			removeAddedItem();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const getPricelists = async () => {
		try {
			const res = await fetch('/api/pricelists.json');
			pricelists = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const getOptions = async () => {
		try {
			const res = await fetch('/api/options.json');
			options = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const removeItemID = (id: Schema.Types.ObjectId) => {
		products.results = products.results.filter((item) => item._id !== id);
	};

	const removeAddedItem = () => {
		products.results = products.results.filter((item) => !orderItems.orderItemsHasID(item._id));
	};

	const addProduct = (product: ProductsDocument) => {
		removeItemID(product._id);
		itemList = [...itemList, { ...product, quantity: 1 }];
	};

	const incrementQuantity = (object: any, value: number) => {
		if (object.quantity <= 1 && value === -1) {
			return;
		}
		object.quantity = object.quantity + value;
		// calculate Unit price and total
		const order = {
			balance: 0,
			subTotal: 0,
			discountRate: 0,
			discount: 0,
			taxRate: 0,
			tax: 0,
			orderLine: itemList
		};
		console.log('calculateOrder()', calculateOrder(order, selectedPricelist));
		itemList = itemList;
	};
</script>

<svelte:head>
	<title>Add Order Items</title>
</svelte:head>

{#if products}
	<div class="flex flex-1  flex-col overflow-hidden">
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<h1 class="text-slate-700 text-2xl font-medium">Add Order Items</h1>

				<button
					on:click={gotoAddProducts}
					class="btn btn-primary inline-flex items-center justify-center px-3"
				>
					Done
				</button>
			</div>
		</div>
		<!-- List of Products -->

		<div class="flex mt-6 flex-1 flex-wrap gap-4 overflow-y-auto">
			<!-- Table start -->
			<div class="p-6 w-full bg-white shadow-lg">
				<table class="relative w-full rounded-lg text-left text-sm">
					<thead class="sticky top-0">
						<tr
							class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
						>
							{#each tableHeadings as header (header)}
								<th class="px-2 py-2">{header}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#if itemList.length && options?.length}
							{#each itemList as list (list._id)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
								>
									<td class="px-2 py-1">
										{list.name}
									</td>
									<td class="px-2 py-1">
										{list.productID}
									</td>
									<td class="px-2 py-1">
										<select bind:value={list.productCategories} class="text-sm">
											{#each optionsToList(filterOptionsGroup('productCategories')) as name}
												<option value={name}>
													{name}
												</option>
											{/each}
										</select>
									</td>
									<td class="px-2 py-1">
										<select bind:value={list.embroideryTypes} class="text-sm">
											{#each optionsToList(filterOptionsGroup('embroideryTypes')) as name}
												<option value={name}>
													{name}
												</option>
											{/each}
										</select>
									</td>
									<td class="px-2 py-1">
										<select bind:value={list.embroideryPositions} class="text-sm">
											{#each optionsToList(filterOptionsGroup('embroideryPositions')) as name}
												<option value={name}>
													{name}
												</option>
											{/each}
										</select>
									</td>
									<td class="px-2 py-1">
										{list.stitches}
									</td>
									<td class="px-2 py-1">
										<div class="flex flex-row bg-transparent">
											<button
												on:click|preventDefault={(e) => incrementQuantity(list, -1)}
												class="h-full w-5 cursor-pointer bg-pickled-bluewood-300 text-pickled-bluewood-700 outline-none hover:bg-pickled-bluewood-400 hover:text-pickled-bluewood-700"
											>
												<span class="text-sm">−</span>
											</button>
											<input
												type="number"
												class="text-sm w-20 my-0 py-0 hover:text-black focus:text-black md:text-basecursor-default flex select-all items-center border-0 bg-pickled-bluewood-300 text-center font-semibold  text-pickled-bluewood-700 outline-none focus:border-0  focus:outline-none"
												name="quantity"
												bind:value={list.quantity}
											/>
											<button
												on:click|preventDefault={(e) => incrementQuantity(list, 1)}
												class="h-full w-5 cursor-pointer bg-pickled-bluewood-300 text-pickled-bluewood-700 outline-none hover:bg-pickled-bluewood-400 hover:text-pickled-bluewood-700"
											>
												<span class="text-sm">+</span>
											</button>
										</div>
									</td>
									<td class="px-2 py-1">
										{list.unitPrice}
									</td>
									<td class="px-2 py-1">
										{list.total}
									</td>
								</tr>
							{/each}
						{/if}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-transparent bg-royal-blue-50 font-normal text-pickled-bluewood-800"
						>
							<td class="px-2 py-1 text-right"> Pricelists </td>
							<td class="px-2 py-1">
								{#if pricelists}
									<Combobox
										class="py-0 my-0 w-full border-none"
										list={pricelists}
										value={selectedPricelist}
									/>
								{/if}
							</td>
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1">Total</td>
							<td class="px-2 py-1">$12.30</td>
						</tr>
					</tbody>
				</table>
				<!-- Search and View Bar -->
				<div
					class="z-10 flex my-2 w-full flex-row items-center justify-between bg-pickled-bluewood-100"
				>
					<div class="relative flex flex-row items-center text-left">
						<Menu as="div" class="relative">
							<MenuButton
								class="btn inline-flex w-full items-center justify-center text-xs text-pickled-bluewood-500 hover:bg-pickled-bluewood-50 focus:outline-none focus:ring-royal-blue-50 focus:ring-offset-transparent"
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
								class="absolute left-2 top-9 z-10 mt-2 w-40 origin-top-right divide-y divide-pickled-bluewood-100 bg-white shadow-lg ring-1 ring-royal-blue-300 focus:outline-none"
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
											name="productID"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-1">Product ID</a
										>
									</MenuItem>

									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="title"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-2">Title</a
										>
									</MenuItem>
									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="description"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-3">Description</a
										>
									</MenuItem>

									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="unitPrice"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-4">Unit Price</a
										>
									</MenuItem>
									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="productCategories"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-5">Category</a
										>
									</MenuItem>

									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="stitches"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-6">Stitches</a
										>
									</MenuItem>
									<MenuItem let:active>
										<a
											on:click={heandleSearchSelection}
											name="quantity"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-6">Quantity</a
										>
									</MenuItem>
								</div>
							</MenuItems>
						</Menu>

						<div class="relative text-pickled-bluewood-100">
							<input
								class="input focus:shadow-outline w-full pl-8 pr-3 text-base placeholder-pickled-bluewood-400"
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

					<!-- Veiw list Buttons -->
					<div class="flex flex-row items-center ">
						<div class="container mx-auto flex justify-center">
							<ul class="flex">
								<li>
									<div class="inline-flex items-center">
										<span class="mr-2 text-xs text-pickled-bluewood-500"
											>Page {products.current.page} of {products.totalPages}({products.totalRecords}
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
													...products.current,
													limit: limit
												};
												getProducts(currentGlobalParams);
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
										disabled={!products.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...products.previous };
											getProducts(currentGlobalParams);
										}}
										class="{!products.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronLeft}</button
									>
								</li>
								<li>
									<button
										disabled={!products.previous}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...products.previous };
											getProducts(currentGlobalParams);
										}}
										class="{!products.previous
											? 'hidden'
											: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!products.previous ? '' : products.previous.page}</button
									>
								</li>
								<li>
									<button
										disabled
										class="btn border border-pickled-bluewood-600  bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100  disabled:bg-pickled-bluewood-600"
										>{products.current.page}</button
									>
								</li>
								<li>
									<button
										disabled={!products.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...products.next };
											getProducts(currentGlobalParams);
										}}
										class="{!products.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{!products.next ? '' : products.next.page}</button
									>
								</li>
								<li>
									<button
										disabled={!products.next}
										on:click|preventDefault={() => {
											currentGlobalParams = { ...currentGlobalParams, ...products.next };
											getProducts(currentGlobalParams);
										}}
										class=" {!products.next
											? 'hidden'
											: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
										>{@html svgChevronRight}</button
									>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<!-- Search and View Bar END -->
				<table class="relative w-full rounded-lg text-left text-sm">
					<thead class="sticky top-0">
						<tr
							class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
						>
							<th class="px-2 py-2">Name</th>
							<th class="px-2 py-2">Product ID</th>
							<th class="px-2 py-2">Stitches</th>
							<th class="px-2 py-2">Description</th>
							<th class="px-2 py-2">Quantity</th>
							<th class="px-2 py-2">Unit Price</th>
							<th class="px-2 py-2">State Used</th>
							<th class="px-2 py-2">Add</th>
						</tr>
					</thead>
					<tbody class="overflow-y-auto">
						{#each products.results as product (product._id)}
							<tr
								class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900 dot-align"
							>
								<td class="px-2 py-1">{product.name}</td>
								<td class="px-2 py-1">{product.productID}</td>
								<td class="px-2 py-1">{product.stitches ? product.stitches : '...'}</td>
								<td class="px-2 py-1">{product.description ? product.description : '...'}</td>
								<td class="px-2 py-1">{product.quantity ? product.quantity : '...'}</td>
								<td class="px-2 py-1">{product.unitPrice ? product.unitPrice : '...'}</td>
								<td class="px-2 py-1">
									<span
										class="whitespace-nowrap rounded-full bg-success px-3 py-1 text-xs font-bold text-white"
										>10 times</span
									>
								</td>
								<td class="px-2 py-1">
									<button on:click|preventDefault={() => addProduct(product)}
										>{@html svgPlusSmall}</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<!-- Table End -->
		</div>
	</div>
{:else}
	<Loading />
{/if}

<style lang="postcss">
	select {
		@apply m-0 p-0 w-full bg-pickled-bluewood-200 border-none;
	}
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* .custom-number-input input:focus {
		outline: none !important;
	}

	.custom-number-input button:focus {
		outline: none !important;
	} */
</style>
