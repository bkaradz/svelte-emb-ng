<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Combobox from '$lib/components/Combobox.svelte';
	import Input from '$lib/components/Input.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import type { AggregateContactsDocument, ContactsDocument } from '$lib/models/contacts.model';
	import { toasts } from '$lib/stores/toasts.store';
	import logger from '$lib/utility/logger';
	import { svgArrow, svgRefresh, svgXCircle } from '$lib/utility/svgLogos';
	import suite from '$lib/validation/client/signUp.validate';
	import { onMount } from 'svelte';
	import classnames from 'vest/classnames';

	const endpoint = `/api/contacts/${$page.params.id}.json`;

	let result = suite.get();

	let editContact: Partial<ContactsDocument>;

	// interface contactsInterface extends metaDataInterface {
	// 	results: Array<Omit<ContactsDocument, 'createdAt' | 'updatedAt' | 'password' | 'userRole'>>;
	// }
	interface corporateQueryParamsInterface {
		limit: number;
		page: number;
		sort: string;
		isCorporate: boolean;
		name?: string;
	}

	// type corporateSearchInterface = Partial<ContactsDocument> & { name: string; _id?: string };

	let corporateSearch: any = { name: null };

	// let showList = false;

	// function handleShowList() {
	// 	if (showList) {
	// 		showList = false;
	// 	}
	// }

	let defaultCorporateQueryParams: Partial<corporateQueryParamsInterface> = {
		limit: 7,
		page: 1,
		sort: 'name',
		isCorporate: true
	};
	let currentCorporateQueryParams = defaultCorporateQueryParams;
	let corporateContacts: Partial<AggregateContactsDocument>;

	onMount(() => {
		getCorporateContacts(currentCorporateQueryParams);
	});

	const getCorporateContacts = async (paramsObj: Partial<corporateQueryParamsInterface>) => {
		try {
			let searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/contacts.json?' + searchParams.toString());
			corporateContacts = await res.json();
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while getting corporate contacts',
				type: 'error'
			});
		}
	};

	// interface formDataType {
	// 	name: string;
	// 	organizationID?: Partial<ContactsDocument>;
	// 	isCorporate: boolean;
	// 	email: string;
	// 	phone: string;
	// 	address: string;
	// }

	// let formData: formDataType = {
	// 	isCorporate: false,
	// 	organizationID: corporateSearch,
	// 	name: '',
	// 	email: '',
	// 	phone: '',
	// 	address: ''
	// };

	let formData = {
		...editContact,
		organizationID: corporateSearch?._id
	};

	$: formData;

	$: corporateSearch = editContact?.organizationID ? editContact?.organizationID : { name: '' };

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

	onMount(async () => {
		const res = await fetch(endpoint);
		if (res.ok) {
			const results = await res.json();
			editContact = results;
		}
	});

	const handleUpdate = async () => {
		try {
			const res = await fetch('/api/contacts.json', {
				method: 'PUT',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				// const data = await res.json();

				suite.reset();
			}
		} catch (err) {
			logger.error(err.messages);
			toasts.add({
				message: 'An error has occured while updating contacts',
				type: 'error'
			});
		}
	};

	const gotoContacts = async () => {
		await goto(`/contacts`);
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

	const handleCancel = async () => {
		await goto(`/contacts/${$page.params.id}`);
	};

	const handleComboInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		currentCorporateQueryParams = {
			...currentCorporateQueryParams,
			name: (event.target as HTMLInputElement).value
		};
		getCorporateContacts(currentCorporateQueryParams);
	};
</script>

<svelte:head>
	<title>Edit Contacts</title>
</svelte:head>

{#if editContact && corporateContacts}
	<div class="flex flex-1 flex-col">
		<!-- Use This -->
		<div>
			<!-- Heading and Buttons Bar -->
			<div class="main-header flex flex-row items-center justify-between">
				<!-- Left -->
				<div class="flex">
					<button class="mr-3" on:click={gotoContacts}>
						{@html svgArrow}
					</button>
					<h1 class="text-slate-700 text-2xl font-medium">Contacts</h1>
				</div>
				<!-- Right -->
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
			<form class="mt-2 space-y-6" on:submit|preventDefault={handleUpdate}>
				<input type="hidden" name="userid" value="true" />
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

					{#if corporateContacts}
						<Combobox
							label="Organization"
							name="organization"
							list={corporateContacts.results}
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
							class="group relative flex w-full justify-center  border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2"
						>
							<span class="absolute inset-y-0 left-0 flex items-center pl-3">
								{@html svgRefresh}
							</span>
							Update Contact
						</button>
						<button
							on:click|preventDefault={handleCancel}
							class="group relative flex w-full justify-center  border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2"
						>
							<span class="absolute inset-y-0 left-0 flex items-center pl-3">
								{@html svgXCircle}
							</span>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{:else}
	<Loading />
{/if}

<style lang="postcss">
</style>
