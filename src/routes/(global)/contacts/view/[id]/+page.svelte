<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loading from '$lib/components/Loading.svelte';
	import { format } from '$lib/services/monetary';
	import { trpc } from '$lib/trpc/client';
	import type { GetByIdReturn } from '$lib/trpc/routes/contacts.prisma';
	import type { GetOrdersReturn } from '$lib/trpc/routes/orders.prisma';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import {
		svgArrow,
		svgChevronLeft,
		svgChevronRight,
		svgPlus,
		svgView
	} from '$lib/utility/svgLogos';
	import { USD } from '@dinero.js/currencies';
	import type { Contacts } from '@prisma/client';
	import dayjs from 'dayjs';
	import { add, dinero, multiply } from 'dinero.js';

	type ContactType = Omit<Contacts, 'organisationID'> & { organisationID: { name: string } };

	type CustomerType = Omit<GetByIdReturn, 'Contacts'> & ContactType;

	export let data: { customer: CustomerType; contacts: Contacts; orders: GetOrdersReturn };

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

	const calculateTotal = (OrderLine: any[]) => {
		const totals = OrderLine.reduce(
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

	const getOrders = async (paramsObj: any) => {
		try {
			orders = await trpc().orders.getOrders.query(paramsObj);
		} catch (err: any) {
			handleErrors(err);
		}
	};

	const gotoContacts = async () => {
		await goto(`/contacts`);
	};

	const viewOrder = async (id: number) => {
		await goto(`/products/cart/view/${id}`);
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
