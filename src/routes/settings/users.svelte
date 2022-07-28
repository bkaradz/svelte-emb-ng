<script lang="ts">
	import type { ContactsDocument } from '$lib/models/contacts.model';

	import { toasts } from '$lib/stores/toasts.store';

	import logger from '$lib/utility/logger';
	import { svgLockClosed, svgPencil, svgXSmall } from '$lib/utility/svgLogos';
	import { onMount } from 'svelte';

	const tableHeadings = [
		'name',
		'email',
		'phone',
		'address',
		'isActive',
		'isUser',
		'userRole',
		'edit',
		'delete'
	];

	let contacts: Array<Partial<ContactsDocument>> = [];
	let isEditableID = null;

	const getUsers = async () => {
		try {
			const res = await fetch('/api/auth.json');
			contacts = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	const updateUser = async (finalData: Partial<ContactsDocument>) => {
		try {
			// let searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/auth.json', {
				method: 'PUT',
				body: JSON.stringify(finalData),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.ok) {
				const user = await res.json();
				toasts.add({
					message: `${user.name} was updated`,
					type: 'success'
				});
				getUsers();
			}
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while updating user',
				type: 'error'
			});
		}
	};
	const deleteUser = async (finalData: Partial<ContactsDocument>) => {
		try {
			// let searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/auth.json', {
				method: 'DELETE',
				body: JSON.stringify(finalData),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.ok) {
				const user = await res.json();
				toasts.add({
					message: `${user.name} was deleted`,
					type: 'success'
				});
				getUsers();
			}
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while updating user',
				type: 'error'
			});
		}
	};

	onMount(() => {
		// heandleEditable(-1, true);
		getUsers();
	});

	const heandleEditable = async (list: Partial<ContactsDocument>) => {
		if (isEditableID === null) {
			isEditableID = list._id;
		} else {
			await updateUser(list);
			isEditableID = null;
		}
	};

	const heandleDelete = async (list: Partial<ContactsDocument>) => {
		await deleteUser(list);
	};
</script>

<svelte:head>
	<title>Settings: Users</title>
</svelte:head>

<div class="mb-2 bg-white p-4">
	<h1>Users</h1>
</div>
{#if contacts}
	<div class="w-full bg-white p-2 shadow-lg">
		<div class=" block ">
			<table class="relative w-full rounded-lg text-left text-sm">
				<thead>
					<tr
						class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
					>
						{#each tableHeadings as header (header)}
							<th class="px-2 py-2">{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="overflow-y-auto">
					{#each contacts as list (list._id)}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="name"
									disabled={!(isEditableID === list._id)}
									bind:value={list.name}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="email"
									name="email"
									disabled={!(isEditableID === list._id)}
									bind:value={list.email}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="phone"
									disabled={!(isEditableID === list._id)}
									bind:value={list.phone}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="address"
									disabled={!(isEditableID === list._id)}
									bind:value={list.address}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									bind:checked={list.isActive}
									disabled={!(isEditableID === list._id)}
									type="checkbox"
									name="isActive"
								/>
							</td>
							<td class="px-2 py-1">
								<input
									bind:checked={list.isUser}
									disabled={!(isEditableID === list._id)}
									type="checkbox"
									name="isUser"
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="userRole"
									disabled={!(isEditableID === list._id)}
									bind:value={list.userRole}
								/>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => heandleEditable(list)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html isEditableID === list._id ? svgLockClosed : svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => heandleDelete(list)}>
									<span class="fill-current text-pickled-bluewood-500">{@html svgXSmall}</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
</style>
