<script lang="ts">
	import { goto } from '$app/navigation';
	import Checkbox2 from '$lib/components/Checkbox2.svelte';
	import Combobox2 from '$lib/components/Combobox2.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import logger from '$lib/utility/logger';
	import type { Pagination } from '$lib/utility/pagination.util';
	import {
		svgAddUser,
		svgArrow,
		svgMinusCircle,
		svgPlus,
		svgPlusCircle,
		svgUpload,
		svgX
	} from '$lib/utility/svgLogos';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { saveContactsSchema } from '$lib/validation/saveContact.validate';
	import type { Address, Contacts, Email, Phone } from '@prisma/client';

	let errorMessages = new Map();

	type newContacts = Contacts & { email: Email[]; phone: Phone[]; address: Address[] };

	type CustomersTypes = Pagination & { results: newContacts[] };

	type ContactsTypes = Pagination & { results: Contacts[] };

	export let data: { contacts: ContactsTypes };

	interface corporateQueryParamsInterface {
		limit: number;
		page: number;
		sort: string;
		isCorporate: boolean;
		name?: string;
	}

	let corporateSearch: Partial<Contacts> = { name: '' };

	$: formData.organisationID = corporateSearch?.id;

	let defaultCorporateQueryParams: Partial<corporateQueryParamsInterface> = {
		limit: 3,
		page: 1
	};

	let currentCorporateQueryParams = defaultCorporateQueryParams;
	let contacts = data.contacts;

	const getCorporateContacts = async (paramsObj: Partial<corporateQueryParamsInterface>) => {
		try {
			contacts = (await trpc().contacts.getCorporate.query(paramsObj)) as unknown as CustomersTypes;
		} catch (err: any) {
			handleErrors(err);
		}
	};


	$: resetForm = () => {
		formData = structuredClone(initFromData);
		corporateSearch = Object.create({ name: undefined });
		getCorporateContacts(defaultCorporateQueryParams);
	};

	const initFromData = {
		isCorporate: false,
		organisationID: { name: undefined },
		name: undefined,
		email: [''],
		phone: [''],
		address: undefined
	};

	let formData = structuredClone(initFromData);

	const handleSubmit = async () => {

		const parsedContact = saveContactsSchema.safeParse(formData);

		if (!parsedContact.success) {
			const errorMap = zodErrorMessagesMap(parsedContact);

			if (errorMap) {
				errorMessages = errorMap;
			}
			return;
		}
		try {
			(await trpc().contacts.saveOrUpdateContact.mutate(
				parsedContact.data
			)) as unknown as CustomersTypes;
		} catch (err: any) {
			handleErrors(err);
		} finally {
			resetForm();
			toasts.add({
				message: 'Contact was successfully added',
				type: 'success'
			});
		}
	};

	const gotoContacts = async () => {
		goto(`/contacts`);
	};

	const handleUpload = async (e: Event) => {
		try {
			const formElm = e.target as HTMLFormElement;
			const formData = new FormData(formElm);

			const res = await fetch('/api/contacts/upload.json', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				formElm.reset();
				toasts.add({ message: 'Contacts uploaded', type: 'success' });
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occurred while uploading contacts', type: 'error' });
		}
	};

	const handleComboInput = (e: any) => {
		currentCorporateQueryParams = {
			...currentCorporateQueryParams,
			name: e.target.value
		};
		getCorporateContacts(currentCorporateQueryParams);
	};

	const addEmailField = (index: number) => {
		if (index === formData.email.length - 1) {
			formData.email = [...formData.email, ''];
			return;
		}
		formData.email = formData.email.filter((_email, i) => i !== index);
	};

	const addPhoneField = (index: number) => {
		if (index === formData.phone.length - 1) {
			formData.phone = [...formData.phone, ''];
			return;
		}
		formData.phone = formData.phone.filter((_phone, i) => i !== index);
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
			<div class="flex items-center">
				<form on:submit|preventDefault={handleUpload} method="POST">
					<div class="relative">
						<button class="absolute border border-royal-blue-500 bg-royal-blue-500 p-2 text-white">
							{@html svgUpload}
						</button>
						<input
							class="w-72 border border-pickled-bluewood-300 bg-pickled-bluewood-100 text-pickled-bluewood-500 ring-royal-blue-500 file:w-10 file:p-1 file:opacity-0"
							type="file"
							name="contacts"
							id="uploadCSV"
							accept=".csv, .CSV"
						/>
						<button
							class="absolute right-0 border border-royal-blue-500 bg-royal-blue-500 p-2 text-white"
							type="submit"
						>
							{@html svgPlus}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Search and View Bar -->
		<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-center bg-white">
			<div>
				<h2 class="text-center text-2xl font-bold text-pickled-bluewood-600">Add Contact</h2>
			</div>
		</div>
	</div>
	<!-- End This -->

	<div class="mx-auto mt-2 h-full w-full max-w-md space-y-8">
		<form class="mt-2 space-y-6" on:submit|preventDefault={handleSubmit} method="POST">
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

				{#if formData.isCorporate}
					<Checkbox2
						name="isCorporate"
						label="Corporate"
						bind:checked={formData.isCorporate}
						errorMessages={errorMessages.get('isCorporate')}
					/>
				{:else}
					<Checkbox2
						name="isCorporate"
						label="Individual"
						bind:checked={formData.isCorporate}
						errorMessages={errorMessages.get('isCorporate')}
					/>
				{/if}

				{#if !formData.isCorporate}
					<Combobox2
						label="Organization"
						name="organisationID"
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
					<span class="text-xs text-danger">
						{errorMessages.get('email') ? errorMessages.get('email') : ''}
					</span>
				</label>
				{#each formData.email as v, i (i)}
					<div class="flex items-center space-x-2">
						<input type="email" name="email" class="input" bind:value={v} />
						<button on:click|preventDefault={() => addEmailField(i)}>
							{#if i < formData.email.length - 1}
								{@html svgMinusCircle}
							{:else}
								{@html svgPlusCircle}
							{/if}
						</button>
					</div>
				{/each}

				<label for="phone" class="flex justify-between text-sm">
					<span>Phone</span>
					<span class="text-xs text-danger">
						{errorMessages.get('phone') ? errorMessages.get('phone') : ''}
					</span>
				</label>
				{#each formData.phone as v, i (i)}
					<div class=" flex items-center space-x-2">
						<input type="text" name="phone" class="input" bind:value={v} />
						<button on:click|preventDefault={() => addPhoneField(i)}>
							{#if i < formData.phone.length - 1}
								{@html svgMinusCircle}
							{:else}
								{@html svgPlusCircle}
							{/if}
						</button>
					</div>
				{/each}

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
						Add Contact
					</button>
					<button
						on:click|preventDefault={() => resetForm()}
						class="group relative flex w-full justify-center  border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2"
					>
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							{@html svgX}
						</span>
						Reset
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
