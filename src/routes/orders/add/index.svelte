<script lang="ts">
	import { goto } from '$app/navigation';
	import Combobox from '$lib/components/Combobox.svelte';
	import Input from '$lib/components/Input.svelte';
	import AddOrder from '$lib/components/orders/addOrder.svelte';
	import { svgArrow, svgDocumentAdd, svgPencil, svgPlus, svgXSmall } from '$lib/utility/svgLogos';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';
	import { orderItems } from '$lib/stores/order.items.store';
	import type { OptionsDocument } from '$lib/models/options.models';
	import type { PricelistsDocument } from '$lib/models/pricelists.model';

	let isEditableID: any;

	const tableHeadings = [
		'Name',
		'ProductID',
		'Category',
		'Emb Type',
		'Emb Position',
		'Stitches',
		'Unit Price',
		'Quantity',
		'Total'
	];

	let itemList = $orderItems;
	let contacts;
	let products;
	let pricelists: PricelistsDocument[];
	let options: OptionsDocument[];

	const filterOptionsGroup = (group: string) => {
		return options.filter((option) => option.group === group);
	};

	const optionsToList = (optionsObj: OptionsDocument[]) => {
		return optionsObj.map((option) => option.name);
	};

	const optionsListMapObj = (optionsObj: OptionsDocument[]) => {
		return optionsObj.reduce((accumulator, option) => {
			return { ...accumulator, [option.name]: option.value };
		}, {});
	};

	const getPricelists = async () => {
		try {
			const res = await fetch('/api/pricelists.json');
			pricelists = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const getProducts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/products.json?' + searchParams.toString());
			products = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const getContacts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			contacts = await res.json();
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

	onMount(() => {
		getContacts({});
		getProducts({});
		getPricelists();
		getOptions();
	});

	const gotoOrders = async () => {
		await goto(`/orders`);
	};

	const gotoAddProduct = async () => {
		await goto(`/orders/add/order-items`);
	};
</script>

<AddOrder>
	<div slot="header">
		<div class="flex justify-between items-center">
			<div class="flex items-center">
				<button class="mr-3" on:click={gotoOrders}>
					{@html svgArrow}
				</button>
				<h1 class="text-slate-700 text-2xl font-medium">New Quotation</h1>
			</div>
			<div>
				<button class="btn btn-primary">Cancel</button>
				<button class="btn btn-success" type="submit">Done</button>
			</div>
		</div>
	</div>
	<div class="flex flex-col m-4 bg-white" slot="page">
		<div class="grow-0 m-4">
			<div class="flex flex-row space-x-10">
				<div class="grow">
					{#if contacts}
						<Combobox label="Customer" list={contacts.results} />
					{/if}
					<div class="flex p-4">
						<article class=" mr-24">
							<h4>Customer Details</h4>
							<p>
								Ap #121-8985 Phasellus Av. <br />
								P.O. Box 856, 6546 Eu Avenue <br />
								Ap #901-9426 At, St. <br />
								706-5115 Ultricies Street <br />
								P.O. Box 411, 2950 Nisi. Av.
							</p>
						</article>
						<article>
							<h4>Customer Address</h4>
							<p>
								Ap #121-8985 Phasellus Av. <br />
								P.O. Box 856, 6546 Eu Avenue <br />
								Ap #901-9426 At, St. <br />
								706-5115 Ultricies Street <br />
								P.O. Box 411, 2950 Nisi. Av.
							</p>
						</article>
					</div>
				</div>
				<div class="grow-0">
					<Combobox label="Quotation #" />
					<Input label="Date" />
					<Input label="Due Date" />
					{#if pricelists}
						<Combobox label="PriceList" list={pricelists} />
					{/if}
				</div>
			</div>
		</div>
		<div class=" grow m-4">
			<table class="w-full rounded-lg text-left text-sm">
				<thead>
					<tr
						class="sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
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
									<select bind:value={list.productCategories}>
										{#each optionsToList(filterOptionsGroup('productCategories')) as name}
											<option value={name}>
												{name}
											</option>
										{/each}
									</select>
								</td>
								<td class="px-2 py-1">
									<select bind:value={list.embroideryTypes}>
										{#each optionsToList(filterOptionsGroup('embroideryTypes')) as name}
											<option value={name}>
												{name}
											</option>
										{/each}
									</select>
								</td>
								<td class="px-2 py-1">
									<select bind:value={list.embroideryPositions}>
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
									{list.quantity}
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
					{#if products}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-transparent font-normal bg-white text-white"
						>
							<td class="p-1 pb-0 border-pickled-bluewood-300 bg-royal-blue-300">
								<button class=" m-0 p-0" on:click|preventDefault={gotoAddProduct}
									><span class="flex fill-current text-white"
										>{@html svgPlus} Add Product/Service</span
									></button
								>
							</td>
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
							<td class="px-2 py-1" />
						</tr>
					{/if}
					<tr
						class="whitespace-no-wrap w-full border border-t-0 border-transparent font-normal text-pickled-bluewood-800"
					>
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1 text-right">Sub Total</td>
						<td class="px-2 py-1">$12.30</td>
					</tr>
					<tr
						class="whitespace-no-wrap w-full border border-t-0 border-transparent font-normal text-pickled-bluewood-800"
					>
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1 text-right">VAT</td>
						<td class="px-2 py-1">$12.30</td>
					</tr>
					<tr
						class="whitespace-no-wrap w-full border border-t-0 border-transparent font-normal text-pickled-bluewood-800"
					>
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1" />
						<td class="px-2 py-1 text-right">Total</td>
						<td class="px-2 py-1">$12.30</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</AddOrder>

<style lang="postcss">
	select {
		@apply m-0 p-0 w-full bg-pickled-bluewood-200 border-none;
	}
</style>
