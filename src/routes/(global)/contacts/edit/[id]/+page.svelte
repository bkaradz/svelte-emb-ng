<script lang="ts">
	import logger from '$lib/utility/logger';
	import { svgAddUser, svgArrow } from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Contacts } from '@prisma/client';
	import type { Pagination } from '$lib/utility/pagination.util';
	import { addContactsSchema, type AddContact } from '$lib/validation/addContact.validate';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import Checkbox2 from '$lib/components/Checkbox2.svelte';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import Combobox2 from '$lib/components/Combobox2.svelte';

	let errorMessages = new Map();

	/**
	 * TODO: correct this error when loading Edit page it occures even when tha page is empty
	 * Error: Cannot read properties of null (reading 'getAttribute')
	*/

	type ContactsTypes = Pagination & { results: Contacts[] };

	export let data: { corporateContacts: ContactsTypes; contact: Contacts };

	interface corporateQueryParamsInterface {
		limit: number;
		page: number;
		sort: string;
		isCorporate: boolean;
		name?: string;
	}

	let corporateSearch: Partial<Contacts> = { name: '' };

	$: formData.organizationID = corporateSearch?.id;

	let defaultCorporateQueryParams: Partial<corporateQueryParamsInterface> = {
		limit: 3,
		page: 1,
		isCorporate: true
	};

	let currentCorporateQueryParams = defaultCorporateQueryParams;
	let contacts = data.corporateContacts;

	const getCorporateContacts = async (paramsObj: Partial<corporateQueryParamsInterface>) => {
		try {
			let searchParams = new URLSearchParams(paramsObj as string);

			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			contacts = await res.json();
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({
				message: 'An error has occurred while getting corporate contacts',
				type: 'error'
			});
		}
	};

	let formData = data.contact;

	// const handleInput = (event: any) => {
	// 	const name = (event.target as HTMLInputElement).name;
	// 	const value = (event.target as HTMLInputElement).value;
	// 	formData[name] = value;
	// };

	$: disabled = false;

	$: resetForm = () => {
		formData = { ...initFromData };
		corporateSearch = Object.create({ name: undefined });
	};

	const initFromData = {
		isCorporate: false,
		organizationID: { name: undefined },
		name: undefined,
		email: undefined,
		phone: undefined,
		address: undefined
	};

	const handleSubmit = async () => {
		disabled = true;

		const parsedContact = addContactsSchema.safeParse(formData);

		if (!parsedContact.success) {
			const errorMap = zodErrorMessagesMap(parsedContact);

			if (errorMap) {
				errorMessages = errorMap;
			}
			disabled = false;
			return;
		}
		try {
			const res = await fetch('/api/contacts.json', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				// const data = await res.json();
				resetForm();
				toasts.add({ message: 'The Contact was added', type: 'success' });
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occurred while adding the contact', type: 'error' });
		}
	};

	const gotoContacts = async () => {
		goto(`/contacts`);
	};

	const handleComboInput = (e: any) => {
		currentCorporateQueryParams = {
			...currentCorporateQueryParams,
			name: e.target.value
		};
		getCorporateContacts(currentCorporateQueryParams);
	};
</script>

<svelte:head>
	<title>Add Contact</title>
</svelte:head>

<div class="flex flex-1 flex-col">
	<!-- Use This -->
	<div>
		<!-- Heading and Buttons Bar -->
		<div class="main-header flex flex-row items-center justify-between">
			<div class="flex">
				<button class="mr-3" on:click={gotoContacts}>
					{@html svgArrow}
				</button>
				<h1 class="text-slate-700 text-2xl font-medium">Contacts</h1>
			</div>
			<!-- Right -->
			<div class="flex items-center" />
		</div>

		<!-- Search and View Bar -->
		<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-center bg-white">
			<div>
				<h2 class="text-center text-2xl font-bold text-pickled-bluewood-600">Edit Contact</h2>
			</div>
		</div>
	</div>
	<!-- End This -->

	<div class="mx-auto mt-2 h-full w-full max-w-md space-y-8">
		<form class="mt-2 space-y-6" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2 shadow-sm">
				<label for="name" class="flex justify-between text-sm">
					<span>Name</span>
					<span class="text-xs text-danger"
						>{errorMessages.get('name') ? errorMessages.get('name') : ''}</span
					>
				</label>
				<input
					use:selectTextOnFocus
					type="text"
					name="name"
					class="input"
					bind:value={formData.name}
				/>

				<Checkbox2
					name="isCorporate"
					label="Individual or Corporate"
					bind:checked={formData.isCorporate}
					errorMessages={errorMessages.get('isCorporate')}
				/>

				{#if !formData.isCorporate}
					<Combobox2
						label="Organization"
						name="organizationID"
						list={contacts.results}
						bind:value={corporateSearch}
						onInput={handleComboInput}
						disabled={formData.isCorporate}
						{errorMessages}
					/>
				{:else}
					<label for="vatOrBpNo" class="flex justify-between text-sm">
						<span>VAT or BP Number</span>
						<span class="text-xs text-danger"
							>{errorMessages.get('vatOrBpNo') ? errorMessages.get('vatOrBpNo') : ''}</span
						>
					</label>
					<input
						use:selectTextOnFocus
						type="text"
						name="vatOrBpNo"
						class="input"
						bind:value={formData.vatOrBpNo}
					/>
				{/if}

				<label for="email" class="flex justify-between text-sm">
					<span>Email</span>
					<span class="text-xs text-danger"
						>{errorMessages.get('email') ? errorMessages.get('email') : ''}</span
					>
				</label>
				<input
					use:selectTextOnFocus
					type="email"
					name="email"
					class="input"
					bind:value={formData.email}
				/>

				<label for="phone" class="flex justify-between text-sm">
					<span>Phone</span>
					<span class="text-xs text-danger"
						>{errorMessages.get('phone') ? errorMessages.get('phone') : ''}</span
					>
				</label>
				<input
					use:selectTextOnFocus
					type="text"
					name="phone"
					class="input"
					bind:value={formData.phone}
				/>

				<label for="address" class="flex justify-between text-sm">
					<span>Address</span>
					<span class="text-xs text-danger"
						>{errorMessages.get('address') ? errorMessages.get('address') : ''}</span
					>
				</label>
				<textarea
					use:selectTextOnFocus
					name="address"
					class="input"
					bind:value={formData.address}
					cols="10"
					rows="5"
				/>

				<div class="mt-6 flex space-x-2">
					<button
						type="submit"
						class="group relative flex w-full justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							{@html svgAddUser}
						</span>
						Update Contact
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
