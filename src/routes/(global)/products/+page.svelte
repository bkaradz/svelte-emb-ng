<script lang="ts">
	import {
		svgCart,
		svgChevronLeft,
		svgChevronRight,
		svgGrid,
		svgList,
		svgPlus,
		svgSearch,
		svgSelector,
		svgView
	} from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import { Menu, MenuButton, MenuItems, MenuItem } from '@rgossiaux/svelte-headlessui';
	import Loading from '$lib/components/Loading.svelte';
	import { format } from '$lib/services/monetary';

	interface productIterface {
		results: [
			{
				id: Number;
				name: string;
				description: string;
				unitPrice: string;
				productCategories: string;
				stitches: string;
				utilisation: Number;
				isActive: boolean;
			}
		];
		totalRecords: number;
		totalPages: number;
		limit: number;
		previous: { page: number; limit: number };
		current: { page: number; limit: number };
		next: { page: number; limit: number };
	}

	let products: productIterface;
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
		getProducts(currentGlobalParams);
	});

	const viewProducts = async (id: string) => {
		goto(`/products/view/${id}`);
	};

	const gotoAddProducts = async () => {
		goto(`/products/add`);
	};

	let gridView = true;
	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = {
		name: 'Name',
		stitches: 'Stitches',
		id: 'Product ID',
		description: 'Description',
		unitPrice: 'Unit Price',
		units: 'Units',
		productCategories: 'Category'
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
		getProducts(currentGlobalParams);
	};

	const getProducts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/products.json?' + searchParams.toString());
			products = await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

{#if products}
	<div class="flex flex-1  flex-col overflow-hidden">
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<h1 class="text-slate-700 text-2xl font-medium">Products</h1>

				<button
					on:click={gotoAddProducts}
					class="btn btn-primary inline-flex items-center justify-center px-3"
				>
					<span>
						{@html svgPlus}
					</span>

					<span class="ml-2">Add Products</span>
				</button>
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
											name="id"
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
											name="units"
											class={`${
												active ? 'active bg-royal-blue-500 text-white' : 'inactive'
											} block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
											role="menuitem"
											id="menu-item-6">Units</a
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
										>Page {products.current.page} of {products.totalPages}({products.totalRecords} items)</span
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
												...products.current,
												limit: limit
											};
											getProducts(currentGlobalParams);
										}}
										on:input={checkValue}
									/>

									<label class="mx-2 text-xs text-pickled-bluewood-500" for="limit">per page</label>
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
		<!-- List of Products -->
		<!-- TODO: fix overflow in list View so that the header is not hidden -->
		<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto">
			{#if gridView}
				{#each products.results as product (product.id)}
					<div
						class=" flex h-44 w-full max-w-xs grow flex-col border-t-4 border-royal-blue-500 bg-white shadow-lg  hover:bg-pickled-bluewood-100 lg:w-1/6"
					>
						<div class="flex h-full items-center">
							<h4
								class="relative truncate w-full pt-6 pb-0 px-5 text-base font-medium text-pickled-bluewood-600"
							>
								<span
									class="absolute top-3 left-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full  bg-success px-2 py-1 text-xs font-bold leading-none text-white"
									>{product?.id}</span
								>
								<span
									class="absolute top-3 right-5 inline-flex hover:cursor-pointer translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full text-xs font-bold leading-none text-danger"
									>{@html svgCart}</span
								>
								{product?.name}
							</h4>
						</div>
						{#if product?.productCategories === 'embroidery'}
							<div
								class="mx-4 mb-4 flex h-full items-center justify-evenly border  border-royal-blue-100 bg-pickled-bluewood-50"
							>
								<div class="p-1">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">STITCHES</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500">
										{product?.stitches}
									</span>
								</div>
							</div>
						{:else}
							<div
								class="mx-4 mb-4 flex h-full items-center justify-evenly border  border-royal-blue-100 bg-pickled-bluewood-50"
							>
								<div class="p-1">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">UNITS</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500">
										{!product?.units ? '...' : product.units}
									</span>
								</div>
								<div class="p-1">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">UNIT PRICE</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500">
										{!product?.unitPrice ? '...' : format(product.unitPrice)}
									</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<!-- TODO: use this for orders list -->
				<div class=" flex flex-1 flex-wrap gap-4">
					<!-- Table start -->
					<div class="w-full bg-white py-6 shadow-lg">
						<div class="mx-6 block ">
							<table class="relative w-full rounded-lg text-left text-sm">
								<thead class="sticky top-0">
									<tr
										class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
									>
										<th class="px-2 py-2">ID</th>
										<th class="px-2 py-2">Name</th>
										<th class="px-2 py-2">Stitches</th>
										<th class="px-2 py-2">Description</th>
										<th class="px-2 py-2">Units</th>
										<th class="px-2 py-2">Unit Price</th>
										<th class="px-2 py-2 text-center">Utilisation</th>
										<th class="px-2 py-2 text-center">Cart</th>
										<th class="px-2 py-2 text-center">View</th>
									</tr>
								</thead>
								<tbody class="overflow-y-auto">
									{#each products.results as product (product.id)}
										<tr
											class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1">{product.id}</td>
											<td class="px-2 py-1">{product.name}</td>
											<td class="px-2 py-1">{product.stitches}</td>

											<td class="px-2 py-1">
												{!product.description ? '...' : product.description}
											</td>
											<td class="px-2 py-1">
												{!product.units ? '...' : product.units}
											</td>
											<td class="px-2 py-1 text-right">
												{!product.unitPrice ? '...' : format(product.unitPrice)}
											</td>

											<td class="px-2 py-1 text-center">
												<span
													class="whitespace-nowrap rounded-full bg-success px-3 py-1 text-xs font-bold text-white"
													>{product.utilisation} times</span
												>
											</td>
											<td class="py-1 text-center">
												<button
													class=" m-0 p-0"
													on:click|preventDefault={() => viewProducts(product.id)}
													><span class="fill-current text-danger">{@html svgCart}</span></button
												>
											</td>
											<td class="py-1 text-center">
												<button
													class=" m-0 p-0"
													on:click|preventDefault={() => viewProducts(product.id)}
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