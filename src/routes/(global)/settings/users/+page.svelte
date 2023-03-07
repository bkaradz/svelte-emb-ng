<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import type { Current, Next, Previous } from '$lib/utility/pagination.util';
	import { svgLockClosed, svgPencil, svgTrash } from '$lib/utility/svgLogos';
	import type { UserRegister } from '$lib/validation/userRegister.validate';
	import type { Contacts } from '@prisma/client';
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

	type UserData = {
		next: Next;
		previous: Previous;
		current: Current;
		limit: number;
		endIndex: number;
		page: number;
		totalPages: number;
		totalRecords: number;
		results: Contacts[];
	};

	export let data: { users: UserData };

	let contacts = data.users.results;
	let isEditableID: number | undefined = undefined;

	const getUsers = async () => {
		getUsers;
		try {
			const resUsers = await trpc().authentication.getUsers.query({});
			contacts = resUsers.results;
		} catch (err: any) {
			handleErrors(err);
		}
	};

	const updateUser = async (finalData: UserRegister) => {
		try {
			await trpc().authentication.registerOrUpdateUser.mutate(finalData);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getUsers();
			toasts.add({ message: `User was updated`, type: 'success' });
		}
	};
	const deleteUser = async (finalData: UserRegister) => {
		try {
			if (!finalData.id) {
				return;
			}
			await trpc().authentication.deleteById.mutate(finalData.id);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getUsers();
			toasts.add({ message: `User was deleted`, type: 'success' });
		}
	};

	onMount(() => {
		getUsers();
	});

	const handleEditable = async (list: UserRegister) => {
		if (isEditableID === undefined) {
			isEditableID = list.id;
		} else {
			await updateUser(list);
			isEditableID = undefined;
		}
	};

	const handleDelete = async (list: UserRegister) => {
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
					{#each contacts as list (list.id)}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="name"
									disabled={!(isEditableID === list.id)}
									bind:value={list.name}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="email"
									name="email"
									disabled={!(isEditableID === list.id)}
									bind:value={list.email[0].email}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="phone"
									disabled={!(isEditableID === list.id)}
									bind:value={list.phone[0].phone}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="address"
									disabled={!(isEditableID === list.id)}
									bind:value={list.address[0].address}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									bind:checked={list.isActive}
									disabled={!(isEditableID === list.id)}
									type="checkbox"
									name="isActive"
								/>
							</td>
							<td class="px-2 py-1">
								<input
									bind:checked={list.isUser}
									disabled={!(isEditableID === list.id)}
									type="checkbox"
									name="isUser"
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="userRole"
									disabled={!(isEditableID === list.id)}
									bind:value={list.userRole}
								/>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => handleEditable(list)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html isEditableID === list.id ? svgLockClosed : svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => handleDelete(list)}>
									<span class="fill-current text-pickled-bluewood-500">{@html svgTrash}</span>
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
