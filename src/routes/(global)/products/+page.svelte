<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import { format } from '$lib/services/monetary';
	import { calculateProductPrices } from '$lib/services/orders/calculateAllPrice.product.services';
	import { cartItem } from '$lib/stores/cart.store';
	import { trpc } from '$lib/trpc/client';
	import type { GetDefaultPricelistReturn } from '$lib/trpc/routes/pricelists.prisma';
	import type { GetProductsReturn } from '$lib/trpc/routes/products.prisma';
	import logger from '$lib/utility/logger';
	import {
		svgCart,
		svgCartBig,
		svgCartMinus,
		svgCartPlus,
		svgChevronLeft,
		svgChevronRight,
		svgGrid,
		svgList,
		svgPlus,
		svgSearch,
		svgShoppingBag,
		svgView
	} from '$lib/utility/svgLogos';
	import type { Products } from '@prisma/client';
	import { dinero, type DineroOptions } from 'dinero.js';

	type ProductsType = GetProductsReturn['results'][0];
	type NewProductsType = Omit<ProductsType, 'unitPrice'> & { unitPrice: DineroOptions<number> };
	type NewGetProductsReturn = Omit<GetProductsReturn, 'results'> & { results: NewProductsType[] };

	export let data: { products: NewGetProductsReturn; pricelist: GetDefaultPricelistReturn };

	let products = data.products;
	let pricelist = data.pricelist;
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

	const viewProducts = async (id: number) => {
		goto(`/products/view/${id}`);
	};

	const gotoAddProducts = async () => {
		goto(`/products/add`);
	};

	let gridView = false;
	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'stitches', label: 'Stitches' },
		{ value: 'productsID', label: 'Product ID' },
		{ value: 'description', label: 'Description' },
		{ value: 'unitPrice', label: 'Unit Price' },
		{ value: 'units', label: 'Units' }
	];

	const handleSearchSelection = (event: MouseEvent) => {
		searchOption = (event.target as HTMLInputElement).name;
		searchInputValue = '';
	};

	const handleSearch = async (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		currentGlobalParams.page = 1;
		let searchWord = (event.target as HTMLInputElement).value;
		currentGlobalParams = { ...currentGlobalParams, [searchOption]: searchWord };
		getProducts(currentGlobalParams);
	};

	const getProducts = async (paramsObj: any) => {
		try {
			products = (await trpc().products.getProducts.query(paramsObj)) as NewGetProductsReturn;
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	const addToCart = (item: Products) => {
		const id = item.id;
		if (!id) {
			return;
		}
		cartItem.addProduct(item);
	};

	const onDecrease = (item: Products) => {
		const id = item.id;
		if (!id) {
			return;
		}
		if (!$cartItem.has(id)) {
			return;
		} else {
			const product = $cartItem.get(id);
			if (!product) {
				return;
			}
			if (product?.quantity === 1) {
				cartItem.remove(id);
			} else {
				cartItem.update(product, { quantity: product?.quantity - 1 });
			}
		}
	};

	const onIncrease = (item: Products) => {
		const id = item.id;
		if (!id) {
			return;
		}
		if (!$cartItem.has(id)) {
			cartItem.addProduct({ ...item, id });
		} else {
			const product = $cartItem.get(id);
			if (!product) {
				return;
			}
			cartItem.update(product, { quantity: product?.quantity + 1 });
		}
	};

	$: totalCartItems = () => {
		return Array.from($cartItem.values()).reduce(
			(acc, item) => {
				let quantity = item?.quantity;
				if (!quantity) {
					quantity = 0;
				}
				return { totalCartItems: acc.totalCartItems + quantity };
			},
			{ totalCartItems: 0 }
		).totalCartItems;
	};

	$: getCartQuantity = (id: number) => {
		const quantity = $cartItem.get(id);
		if (!quantity) {
			return 0;
		}
		return quantity['quantity'];
	};

	const getCalculatedPrice = (product: Products, pricelist: GetDefaultPricelistReturn) => {
		const price = calculateProductPrices(product, pricelist);
		if (!price) {
			return '...';
		}
		return price[0]['3'];
	};
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

{#if products}
	<div class="flex flex-1 flex-col overflow-hidden">
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<h1 class="text-slate-700 text-2xl font-medium">Products</h1>
				<div class=" flex items-center space-x-2">
					<div>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span class="relative hover:cursor-pointer mr-4 mt-4 inline-block text-danger">
							{@html svgShoppingBag}
							<span
								class="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-success px-2 py-1 text-xs font-bold leading-none text-white"
								>{$cartItem.size}</span
							>
						</span>
					</div>
					<div>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span
							on:click|preventDefault={() => ($cartItem.size > 0 ? goto(`/products/cart`) : '')}
							class="relative hover:cursor-pointer mr-4 mt-4 inline-block text-danger"
						>
							{@html svgCartBig}
							<span
								class="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-success px-2 py-1 text-xs font-bold leading-none text-white"
								>{totalCartItems() ? totalCartItems() : 0}</span
							>
						</span>
					</div>
					<div>
						<button
							on:click|preventDefault={() => ($cartItem.size > 0 ? goto(`/products/cart`) : '')}
							class="btn btn-primary inline-flex items-center px-3"
						>
							<span class=" text-danger">
								{@html svgCart}
							</span>

							<span class="ml-2">Cart</span>
						</button>
					</div>
					<div>
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
				<div class="flex flex-row items-center">
					<div class="container mx-auto mr-4 flex justify-center">
						<ul class="flex">
							<li>
								<div class="inline-flex items-center">
									<span class="mr-2 text-xs text-pickled-bluewood-500"
										>Page {products.current.page} of {products.totalPages}({products.totalRecords} items)</span
									>
									<label class="mr-2 text-xs text-pickled-bluewood-500" for="limit">Display</label>
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
									class="btn border border-pickled-bluewood-600 bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100 disabled:bg-pickled-bluewood-600"
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
						hidden
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
		<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto">
			{#if gridView}
				{#each products.results as product (product.id)}
					{@const cartHasProduct = $cartItem.has(product.id)}
					<div
						class="{cartHasProduct
							? 'border-success'
							: 'border-royal-blue-500'} flex h-44 w-full max-w-xs grow flex-col border-t-4 bg-white shadow-lg hover:bg-pickled-bluewood-100 lg:w-1/6"
					>
						<div class="flex h-full items-center">
							<span
								class="inline-flex justify-center items-center ml-1 px-1 h-4 text-xs font-semibold text-royal-blue-800 bg-royal-blue-200 rounded-full"
							>
								{product?.id}
							</span>
							<h4
								class="relative truncate w-full pt-6 pb-0 pr-5 text-base font-medium text-pickled-bluewood-600"
							>
								{product?.name}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<span
									on:click|preventDefault={() => addToCart(product)}
									class="absolute top-3 right-5 inline-flex hover:cursor-pointer translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full text-xs font-bold leading-none text-danger"
									>{@html svgCart}</span
								>
							</h4>
						</div>
						{#if product?.productCategories === 'embroidery'}
							<div
								class="mx-4 mb-4 flex h-full items-center justify-evenly border border-royal-blue-100 bg-pickled-bluewood-50"
							>
								<div class="p-1 text-center">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">STITCHES</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500">
										{product?.stitches}
									</span>
								</div>
							</div>
						{:else}
							<div
								class="mx-4 mb-4 flex h-full items-center justify-evenly border border-royal-blue-100 bg-pickled-bluewood-50"
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
										{!product?.unitPrice ? '...' : format(dinero(product.unitPrice))}
									</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<div class=" flex flex-1 flex-wrap gap-4">
					<!-- Table start -->
					<div class="w-full bg-white py-6 shadow-lg">
						<div class="mx-6 block">
							<table class="relative w-full rounded-lg text-left text-sm">
								<thead class="sticky top-0">
									<tr
										class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
									>
										<th class="px-2 py-2">ID</th>
										<th class="px-2 py-2">Name</th>
										<th class="px-2 py-2">Stitches</th>
										<th class="px-2 py-2">Units</th>
										<th class="px-2 py-2 text-right">Unit Price(min units)</th>
										<th class="px-2 py-2 text-center">Cart</th>
										<th class="px-2 py-2 text-center">View</th>
									</tr>
								</thead>
								<tbody class="overflow-y-auto">
									{#each products.results as product (product.id)}
										{@const cartHasProduct = $cartItem.has(product.id)}
										<tr
											class="{cartHasProduct
												? 'bg-success odd:bg-success'
												: ''} hover:bg-royal-blue-200 whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1">{product.id}</td>
											<td class="px-2 py-1">{product.name}</td>
											<td class="px-2 py-1">{product.stitches}</td>
											<td class="px-2 py-1">
												{!product.units ? '...' : product.units}
											</td>
											<!-- <td class="px-2 py-1 text-right">
												{!product.unitPrice ? '...' : format(dinero(product.unitPrice))}
											</td> -->
											<td class="px-2 py-1 text-right pr-4">
												{getCalculatedPrice(product, pricelist)}
											</td>
											<td class="px-2 py-1">
												<div class="flex items-center justify-center">
													<span class="flex w-1/6 pr-4">
														<button
															class="border rounded px-1 bg-royal-blue-200"
															on:click|preventDefault={() => onDecrease(product)}
															aria-label="Decrease quantity"
														>
															{@html svgCartMinus}
														</button>
														<div class="w-8 mx-2 text-center">
															{getCartQuantity(product.id)}
														</div>
														<button
															class="px-1 border bg-royal-blue-200 border-royal-blue-500 rounded hover:bg-royal-blue-300"
															on:click|preventDefault={() => onIncrease(product)}
															aria-label="Increase quantity"
														>
															{@html svgCartPlus}
														</button>
													</span>
												</div>
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
