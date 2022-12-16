<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import logger from '$lib/utility/logger';
	import { svgFloppy, svgPencil, svgPlus, svgTrash } from '$lib/utility/svgLogos';
	import type { Options } from '@prisma/client';
	import { onMount } from 'svelte';
	import { TRPCClientError } from '@trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	export let tableHeadings = [
		'Group',
		'Label',
		'Value',
		'Active',
		'Default',
		'Edit/Save',
		'Delete & Add Row'
	];

	let optionsList: Options[] = [];

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID: null | number | string = null;

	$: if (optionsList.length) {
		optionsList.forEach((list) => {
			groupList.add(list.group);
		});
		groupList = groupList;
	}

	const handleEditable = async (list: Partial<Options>) => {
		if (isEditableID === null) {
			isEditableID = list.id;
		} else {
			await updateOrAddOptions(list);
			isEditableID = null;
		}
	};

	let idToRemove: string[] = [];

	$: handleAddRow = () => {
		const id = crypto.randomUUID();
		isEditableID = id;
		idToRemove.push(id);
		optionsList = [
			...optionsList,
			{
				id: id,
				group: selectedGroup,
				label: 'Edit...',
				value: 'Edit...',
				isActive: true,
				isDefault: false
			}
		];
	};

	const deleteOption = async (id: number) => {
		try {
			await trpc().options.deleteById.mutate(id);
		} catch (err: any) {
			handleErrors(err);
			// if (err instanceof TRPCClientError) {
			// 	logger.error(`Error: ${JSON.parse(err.message)}`);
			// } else {
			// 	logger.error(`Error: ${err}`);
			// }
			// toasts.add({
			// 	message: 'An error occurred',
			// 	type: 'error'
			// });
		} finally {
			toasts.add({
				message: `Option was deleted`,
				type: 'success'
			});
			getOptions();
		}
	};

	const handleDelete = (finalData: Options) => {
		if (finalData.isDefault) {
			toasts.add({
				message: 'You can not delete the default Pricelists',
				type: 'error'
			});
			return;
		}
		idToRemove = idToRemove.filter((list) => list !== finalData.id);
		deleteOption(finalData.id);
	};

	const updateOrAddOptions = async (finalData: Partial<Options>) => {
		try {
			// let searchParams = new URLSearchParams(paramsObj as string);
			if (idToRemove.includes(finalData.id)) {
				// Remove id
				delete finalData.id;
				idToRemove = idToRemove.filter((list) => list !== finalData.id);

				// const res = await fetch('/api/options.json', {
				// 	method: 'POST',
				// 	body: JSON.stringify(finalData),
				// 	headers: { 'Content-Type': 'application/json' }
				// });
				// if (res.ok) {
				// 	const option = await res.json();
				// 	toasts.add({ message: `${option.name} was added`, type: 'success' });
				// }
			}
			// else {
			// 	const res = await fetch('/api/options.json', {
			// 		method: 'PUT',
			// 		body: JSON.stringify(finalData),
			// 		headers: { 'Content-Type': 'application/json' }
			// 	});
			// 	if (res.ok) {
			// 		const option = await res.json();
			// 		toasts.add({ message: `${option.name} was updated`, type: 'success' });
			// 	}
			// }
			await trpc().options.saveOrUpdateOption.mutate(finalData);
		} catch (err: any) {
			handleErrors(err);
			// logger.error(`Error: ${err}`);
			// toasts.add({
			// 	message: 'An error has occurred while updating user',
			// 	type: 'error'
			// });
		} finally {
			getOptions();
			toasts.add({ message: `Option was saved or updated successfully`, type: 'success' });
		}
	};

	const getOptions = async () => {
		try {
			optionsList = (await trpc().options.getOptions.query({})) as unknown as Options[];
			// const res = await fetch('/api/options.json?');
			// optionsList = await res.json();
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			// error = `Error: ${err}`;
		}
	};

	onMount(() => {
		getOptions();
	});
</script>

<!-- Table start -->
<div class="bg-white p-2 shadow-lg">
	<div>
		{#if optionsList.length}
			{#each [...groupList] as list, index (index)}
				<button
					on:click|preventDefault={() => (selectedGroup = list)}
					class="mx-1 mb-3 mt-2 justify-center rounded-full border border-transparent px-3 py-1 text-sm font-medium text-white {selectedGroup ===
					list
						? `btn-primary`
						: `btn-tertiary`}">{list}</button
				>
			{/each}
		{/if}
	</div>
	<table class="w-full text-left text-sm">
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
			{#if optionsList.length}
				{#each optionsList as list (list.id)}
					{#if selectedGroup === list.group || selectedGroup === 'all'}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="group"
									disabled={!(isEditableID === list.id)}
									bind:value={list.group}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="name"
									disabled={!(isEditableID === list.id)}
									bind:value={list.label}
								/>
							</td>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="value"
									disabled={!(isEditableID === list.id)}
									bind:value={list.value}
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
									bind:checked={list.isDefault}
									disabled={!(isEditableID === list.id)}
									type="checkbox"
									name="isDefault"
								/>
							</td>
							<td class="p-1">
								<button class=" m-0 p-0" on:click|preventDefault={() => handleEditable(list)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html isEditableID === list.id ? svgFloppy : svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center">
								<button class="m-0 p-0" on:click|preventDefault={() => handleDelete(list)}>
									<span class="fill-current text-pickled-bluewood-500">{@html svgTrash}</span>
								</button>
							</td>
						</tr>
					{/if}
				{/each}
			{/if}
			<tr
				class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 bg-royal-blue-300 font-normal text-white"
			>
				<td class="px-2 py-1">Group</td>
				<td class="px-2 py-1">Label</td>
				<td class="px-2 py-1">value</td>
				<td class="px-2 py-1">
					<input disabled type="checkbox" name="isActive" checked={false} />
				</td>
				<td class="px-2 py-1">
					<input disabled type="checkbox" name="isActive" checked={true} />
				</td>
				<td class="px-2 py-1" />
				<td class="p-1 text-center">
					<button class=" m-0 p-0" on:click|preventDefault={() => handleAddRow()}
						><span class="flex fill-current text-white">{@html svgPlus} Add Row</span></button
					>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<!-- Table End -->
<style lang="postcss">
	thead,
	tbody {
		display: block;
	}
	tbody td,
	thead th {
		width: 350px;
	}
	/* table {
		table-layout: auto;
		width: 100%;
	} */

	tbody {
		height: calc(100vh - 328px);
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
