<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import type { GetUsersReturn } from '$lib/trpc/routes/authentication.prisma';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { svgLockClosed, svgPencil, svgTrash } from '$lib/utility/svgLogos';

	const tableHeadings = [
		'name',
		'email',
		'phone',
		'address',
		'isActive',
		'edit',
		'delete'
	];

	type ResultsType = GetUsersReturn['results'][0];

	export let data: { users: GetUsersReturn };

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

	const updateUser = async (finalData: ResultsType) => {
		try {
			const updateEmail = finalData?.email?.map(
				(email) => ({ email: email } as unknown as { email: string })
			);
			const updatePhone = finalData?.phone?.map(
				(phone) => ({ phone: phone } as unknown as { phone: string })
			);
			const updateAddress = finalData?.address?.map(
				(address) => ({ address: address } as unknown as { address: string })
			);

			const password = finalData?.password;

			if (!password) {
				return;
			}

			const updateUser = structuredClone({
				...finalData,
				email: updateEmail,
				phone: updatePhone,
				address: updateAddress,
				password
			});

			await trpc().authentication.UpdateUserWithoutPassword.mutate(updateUser);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getUsers();
			toasts.add({ message: `User was updated`, type: 'success' });
		}
	};
	const deleteUser = async (finalNumber: number) => {
		try {
			if (!finalNumber) {
				return;
			}
			await trpc().authentication.deleteById.mutate(finalNumber);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getUsers();
			toasts.add({ message: `User was deleted`, type: 'success' });
		}
	};

	const handleEditable = async (list: ResultsType) => {
		if (isEditableID === undefined) {
			isEditableID = list.id;
		} else {
			await updateUser(list);
			isEditableID = undefined;
		}
	};

	const handleDelete = async (number: number) => {
		await deleteUser(number);
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
		<div class=" block">
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
							
							
							<td class="p-1 text-center">
								<button class=" m-0 p-0" on:click={() => handleEditable(list)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html isEditableID === list.id ? svgLockClosed : svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center">
								<button class=" m-0 p-0" on:click={() => handleDelete(list.id)}>
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
