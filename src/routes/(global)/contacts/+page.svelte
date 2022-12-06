<script lang="ts">
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';
	import { format } from '$lib/services/monetary';
	import logger from '$lib/utility/logger';
	import type { Pagination } from '$lib/utility/pagination.util';
	import {
		svgChevronLeft,
		svgChevronRight,
		svgGrid,
		svgList,
		svgPlus,
		svgSearch,
		svgView
	} from '$lib/utility/svgLogos';
	import type { Address, Contacts, Email, Phone } from '@prisma/client';

	type newContacts = Contacts & Email & Phone & Address;

	type CustomersTypes = Pagination & { results: newContacts[] };

	export let data: { customers: CustomersTypes };

	interface ContentIterface {
		results: [
			{
				id: string;
				name: string;
				isCorporate: boolean;
				notes: string;
				vatOrBpNo: string;
				email: string;
				phone: string;
				address: string;
				balanceDue: number;
				totalReceipts: number;
				isActive: boolean;
				organizationID: {
					name: string;
				};
			}
		];
		id: string;
		totalRecords: number;
		totalPages: number;
		limit: number;
		previous: { page: number; limit: number };
		current: { page: number; limit: number };
		next: { page: number; limit: number };
	}

	interface GlobalParamsTypes {
		limit: number;
		page: number;
		sort?: string;
		query?: string;
		name?: string;
		organisation?: string;
		phone?: string;
		email?: string;
		vatNo?: string;
		balanceDue?: string;
		state?: string;
		isCorporate?: boolean;
		isActive?: boolean;
		isUser?: boolean;
	}

	const tableHeadings = [
		{ id: 1, name: 'ID', dbName: 'id' },
		{ id: 2, name: 'Customer', dbName: 'name' },
		{ id: 3, name: 'Organization', dbName: 'organizationID' },
		{ id: 4, name: 'Phone', dbName: 'phone' },
		{ id: 5, name: 'Email', dbName: 'email' },
		{ id: 6, name: 'Corporate', dbName: 'isCorporate' },
		{ id: 7, name: 'Vat No', dbName: 'vatOrBpNo' },
		{ id: 8, name: 'Balance Due', dbName: 'balanceDue' },
		{ id: 9, name: 'Total Receipts', dbName: 'totalReceipts' },
		{ id: 10, name: 'State', dbName: null },
		{ id: 11, name: 'View', dbName: null }
	];

	let contacts: CustomersTypes = data.customers;
	let limit = 15;
	let currentGlobalParams: GlobalParamsTypes = {
		limit,
		page: 1,
		sort: 'name'
	};

	const checkValue = () => {
		if (limit < 1) {
			limit = 1;
		}
	};

	const viewContact = async (id: string) => {
		goto(`/contacts/view/${id}`);
	};

	const gotoAddContact = async () => {
		goto(`/contacts/add`);
	};

	let gridView = false;
	let searchInputValue = '';
	let searchOption = 'name';

	const searchNamesOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'organisationID', label: 'Organisation' },
		{ value: 'phone', label: 'Phone' },
		{ value: 'email', label: 'Email' },
		{ value: 'vatOrBpNo', label: 'Vat Number' },
		{ value: 'balanceDue', label: 'Balance Due' }
	];

	const heandleSearchSelection = (event: MouseEvent) => {
		searchOption = (event.target as HTMLInputElement).name;
		searchInputValue = '';
	};

	const customerChanges = async (currentGlobalParams: GlobalParamsTypes) => {
		const customersPromise = await getContacts(currentGlobalParams);
		[contacts] = await Promise.all([customersPromise]);
	};

	const heandleSearch = async (
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		currentGlobalParams.page = 1;
		let searchWord = (event.target as HTMLInputElement).value;
		currentGlobalParams = { ...currentGlobalParams, [searchOption]: searchWord };
		await customerChanges(currentGlobalParams);
	};

	// Input must be of the form {limit, page, sort, query}
	const getContacts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			if (res.ok) {
				const contacts = await res.json();
				return contacts;
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};
</script>

<svelte:head>
	<title>Contacts</title>
</svelte:head>

{#if contacts}
	<div class="flex flex-1 flex-col overflow-hidden">
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<h1 class="text-slate-700 text-2xl font-medium">Contacts</h1>
				<div class="flex items-center">
					<button
						on:click={gotoAddContact}
						class="btn btn-primary inline-flex items-center justify-center px-3"
					>
						<span>
							{@html svgPlus}
						</span>

						<span class="ml-2">Add Contact</span>
					</button>
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
							class="  bg-pickled-bluewood-600 text-white text-sm px-3 mx-1 py-1 font-semibold hover:shadow-lg transition duration-3000"
						>
							Search
						</button>
					</div>
				</div>
				<!-- Veiw list Buttons -->
				<div class="flex flex-row items-center ">
					<div class="container mx-auto mr-4 flex justify-center">
						<ul class="flex">
							<li>
								<div class="inline-flex items-center">
									<span class="mr-2 text-xs text-pickled-bluewood-500"
										>Page {contacts.current.page} of {contacts.totalPages}({contacts.totalRecords} items)</span
									>
									<label class="mr-2 text-xs  text-pickled-bluewood-500" for="limit">Display</label>
									<input
										class="input w-16 border"
										type="number"
										name="limit"
										id="limit"
										bind:value={limit}
										on:change={async () => {
											currentGlobalParams = {
												...currentGlobalParams,
												...contacts.current,
												limit: limit
											};
											await customerChanges(currentGlobalParams);
											// getContacts(currentGlobalParams);
										}}
										on:input={checkValue}
									/>

									<label class="mx-2 text-xs text-pickled-bluewood-500" for="limit">per page</label>
								</div>
							</li>
							<li>
								<button
									disabled={!contacts.previous}
									on:click|preventDefault={async () => {
										currentGlobalParams = { ...currentGlobalParams, ...contacts.previous };
										await customerChanges(currentGlobalParams);
										// getContacts(currentGlobalParams);
									}}
									class="{!contacts.previous
										? 'hidden'
										: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{@html svgChevronLeft}</button
								>
							</li>
							<li>
								<button
									disabled={!contacts.previous}
									on:click|preventDefault={async () => {
										currentGlobalParams = { ...currentGlobalParams, ...contacts.previous };
										await customerChanges(currentGlobalParams);
										// getContacts(currentGlobalParams);
									}}
									class="{!contacts.previous
										? 'hidden'
										: ''} btn border border-r-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{!contacts.previous ? '' : contacts.previous.page}</button
								>
							</li>
							<li>
								<button
									disabled
									class="btn border border-pickled-bluewood-600  bg-pickled-bluewood-600 px-4 text-pickled-bluewood-100  disabled:bg-pickled-bluewood-600"
									>{contacts.current.page}</button
								>
							</li>
							<li>
								<button
									disabled={!contacts.next}
									on:click|preventDefault={async () => {
										currentGlobalParams = { ...currentGlobalParams, ...contacts.next };
										await customerChanges(currentGlobalParams);
										// getContacts(currentGlobalParams);
									}}
									class="{!contacts.next
										? 'hidden'
										: ''} btn border border-l-0 border-pickled-bluewood-300 bg-white px-4 text-pickled-bluewood-500 hover:bg-pickled-bluewood-200 disabled:bg-pickled-bluewood-200"
									>{!contacts.next ? '' : contacts.next.page}</button
								>
							</li>
							<li>
								<button
									disabled={!contacts.next}
									on:click|preventDefault={async () => {
										currentGlobalParams = { ...currentGlobalParams, ...contacts.next };
										await customerChanges(currentGlobalParams);
										// getContacts(currentGlobalParams);
									}}
									class=" {!contacts.next
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
		<div class="mt-6 flex flex-1 flex-wrap gap-4 overflow-y-auto items-start">
			{#if gridView}
				<div class="grid w-full grid-cols-6 justify-items-auto gap-2">
					{#each contacts.results as contact (contact.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							on:click|preventDefault={() => viewContact(contact.id)}
							class=" flex h-44 w-full max-w-xs grow flex-col border-t-4 border-royal-blue-500 bg-white shadow-lg hover:cursor-pointer hover:bg-pickled-bluewood-100"
						>
							<div class="flex h-full items-center">
								<span
									class="inline-flex justify-center items-center ml-1 px-1 h-4 text-xs font-semibold text-royal-blue-800 bg-royal-blue-200 rounded-full"
								>
									{contact?.id}
								</span>
								<h4
									class="relative truncate pt-6 pb-2 pr-5 text-base font-medium text-pickled-bluewood-600"
								>
									{contact?.name}
								</h4>
							</div>
							<div
								class="mx-4 mb-4 flex h-full items-center justify-evenly border  border-royal-blue-100 bg-pickled-bluewood-50"
							>
								<div class="p-1">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">BALANCE DUE</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500" />
								</div>
								<div class="p-1">
									<p class="p-1 text-xs font-semibold text-pickled-bluewood-500">TOTAL INVOICED</p>
									<span class="p-1 text-base font-bold text-pickled-bluewood-500" />
								</div>
							</div>
						</div>
					{/each}
				</div>
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
										{#each tableHeadings as header (header?.id)}
											<th class="px-2 py-2">{header?.name}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each contacts.results as contact (contact.id)}
										<tr
											class="whitespace-no-wrap hover:bg-royal-blue-200 w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1">{contact.id}</td>
											<td class="px-2 py-1">{contact.name}</td>
											<td class="px-2 py-1">
												{contact?.organizationID ? contact?.organizationID : '...'}
											</td>
											<td class="px-2 py-1"
												>{contact?.phone.map((item) => item.phone).join(', ')}</td
											>
											<td class="px-2 py-1">{!contact?.email ? '...' : contact?.email}</td>

											<td class="px-2 py-1">
												<input
													disabled
													type="checkbox"
													name=""
													id=""
													bind:checked={contact.isCorporate}
												/>
											</td>
											<td class="px-2 py-1">
												{!contact?.vatOrBpNo ? '...' : contact?.vatOrBpNo}
											</td>
											<td class="px-2 py-1 text-right" />
											<td class="px-2 py-1 text-right" />
											<td class="flex items-center justify-end px-2 py-1">
												<span class="rounded-full bg-success px-3 py-1 text-xs font-bold text-white"
													>Invoiced</span
												>
											</td>
											<td class="p-1 text-center ">
												<button class=" m-0 p-0" on:click={() => viewContact(contact?.id)}
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
