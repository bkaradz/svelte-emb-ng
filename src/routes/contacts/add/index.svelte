<script lang="ts">
	import { onMount } from 'svelte';
	import suite from '$lib/validation/client/signUp.validate';
	import logger from '$lib/utility/logger';
	import { svgAddUser, svgArrow, svgPlus, svgUpload, svgX } from '$lib/utility/svgLogos';
	import classnames from 'vest/classnames';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import type { ContactsDocument } from '$lib/models/contacts.model';
	import type { metaDataInterface } from '$lib/services/aggregateQuery.services';
	import Input from '$lib/components/Input.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Combobox from '$lib/components/Combobox.svelte';

	let result = suite.get();

	interface contactsInterface extends metaDataInterface {
		results: Array<Omit<ContactsDocument, 'createdAt' | 'updatedAt' | 'password' | 'userRole'>>;
	}

	interface corporateQueryParamsInterface {
		limit: number;
		page: number;
		sort: string;
		isCorporate: boolean;
		name?: string;
	}

	type corporateSearchInterface = Partial<ContactsDocument> & { name: string };

	let corporateSearch: corporateSearchInterface = { name: '' };

	let defaultCorporateQueryParams: Partial<corporateQueryParamsInterface> = {
		limit: 7,
		page: 1,
		sort: 'name',
		isCorporate: true
	};
	let currentCorporateQueryParams = defaultCorporateQueryParams;
	let contacts: contactsInterface;

	onMount(() => {
		getCorporateContacts(currentCorporateQueryParams);
	});

	const getCorporateContacts = async (paramsObj: Partial<corporateQueryParamsInterface>) => {
		try {
			let searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			contacts = await res.json();
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while getting corporate contacts',
				type: 'error'
			});
		}
	};

	interface formDataType {
		name: string;
		organizationID?: Partial<ContactsDocument>;
		isCorporate: boolean;
		email: string;
		phone: string;
		address: string;
	}

	let formData: formDataType = {
		isCorporate: false,
		organizationID: corporateSearch,
		name: '',
		email: '',
		phone: '',
		address: ''
	};

	const handleInput = (event: any) => {
		const name = (event.target as HTMLInputElement).name;
		const value = (event.target as HTMLInputElement).value;
		formData[name] = value;
		result = suite(formData, name);
	};

	$: cn = classnames(result, {
		warning: 'warning',
		invalid: 'error',
		valid: 'success'
	});

	// $: disabled = !result.isValid();

	$: resetForm = () => {
		formData = {
			isCorporate: false,
			organizationID: { name: '' },
			name: '',
			email: '',
			phone: '',
			address: ''
		};
		corporateSearch = { name: '' };
		suite.reset();
		result = suite.get();
	};

	const handleSubmit = async () => {
		try {
			const { organizationID, ...otherData } = formData;
			const finalData = { ...otherData, organizationID: organizationID._id };
			const res = await fetch('/api/contacts.json', {
				method: 'POST',
				body: JSON.stringify(finalData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				// const data = await res.json();
				resetForm();
				toasts.add({ message: 'The Contact was added', type: 'success' });
			}
		} catch (err) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured while adding the contact', type: 'error' });
		}
	};

	const gotoContacts = async () => {
		await goto(`/contacts`);
	};

	const handleUpload = async (e: SubmitEvent) => {
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
		} catch (err) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured while uploading contacts', type: 'error' });
		}
	};

	// const makeMatchBold = (searchMatchString: string) => {
	// 	let MatchedWords = [];
	// 	if (corporateSearch.name) {
	// 		const regex = new RegExp(corporateSearch.name, 'ig');
	// 		MatchedWords = searchMatchString.trim().match(regex);
	// 	}

	// 	let makeBold = `<strong>${MatchedWords[0]}</strong>`;
	// 	let boldedStr = searchMatchString.replace(MatchedWords[0], makeBold);

	// 	return boldedStr;
	// };

	const handleComboInput = (e: any) => {
		currentCorporateQueryParams = {
			...currentCorporateQueryParams,
			name: e.target.value
		};
		// getCorporateContacts(currentCorporateQueryParams);
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
				<form on:submit|preventDefault={handleUpload}>
					<div class="relative">
						<button
							class="absolute border border-royal-blue-500 bg-royal-blue-500 p-2 text-white"
							for="uploadCSV">{@html svgUpload}</button
						>
						<input
							class="w-72 border border-pickled-bluewood-300 bg-pickled-bluewood-100 text-pickled-bluewood-500 ring-royal-blue-500 file:w-10 file:p-1 file:opacity-0"
							type="file"
							name="contacts"
							id="uploadCSV"
							accept=".csv, .CSV"
						/>
						<button
							class="absolute right-0 border border-royal-blue-500 bg-royal-blue-500 p-2 text-white"
							type="submit">{@html svgPlus}</button
						>
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
		<form class="mt-2 space-y-6" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2 shadow-sm">
				<Input
					name="name"
					label="Name"
					bind:value={formData.name}
					onInput={handleInput}
					messages={result.getErrors('name')}
					validityClass={cn('name')}
				/>

				<Checkbox
					name="isCorporate"
					label="Individual or Corparate"
					validityClass={cn('isCorporate')}
					bind:checked={formData.isCorporate}
				/>

				{#if contacts}
					<Combobox
						label="Organization"
						name="organization"
						list={contacts.results}
						bind:value={corporateSearch}
						onInput={handleComboInput}
						disabled={formData.isCorporate}
					/>
				{/if}

				<Input
					name="email"
					label="Email"
					bind:value={formData.email}
					onInput={handleInput}
					type="email"
					messages={result.getErrors('email')}
					validityClass={cn('email')}
				/>

				<Input
					name="phone"
					label="Phone"
					bind:value={formData.phone}
					onInput={handleInput}
					messages={result.getErrors('phone')}
					validityClass={cn('phone')}
				/>

				<Textarea
					name="address"
					label="Address"
					bind:value={formData.address}
					onInput={handleInput}
					messages={result.getErrors('address')}
					validityClass={cn('address')}
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
