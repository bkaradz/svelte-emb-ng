<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import logger from '$lib/utility/logger';
	import { svgFloppy, svgPencil, svgPlus, svgTrash } from '$lib/utility/svgLogos';
	import type { PaymentTypeOptions } from '@prisma/client';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	export let tableHeadings = [
		'Group',
		'Label',
		'Value',
		'Currency',
		'Active',
		'Default',
		'Edit/Save',
		'Delete & Add Row'
	];

	type newOptions = Omit<
		PaymentTypeOptions,
		'createdAt' | 'updatedAt' | 'createdBy' | 'id' | 'currency'
	> & {
		id?: number | string;
		currency?: string;
	};

	let paymentTypeOptionsList: newOptions[] = [];

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID: undefined | number | string = undefined;

	$: if (paymentTypeOptionsList.length) {
		paymentTypeOptionsList.forEach((list) => {
			groupList.add(list.group);
		});
		groupList = groupList;
	}

	const handleEditable = async (list: newOptions) => {
		if (isEditableID === undefined) {
			isEditableID = list.id;
		} else {
			await updateOrSaveOptions(list);
			isEditableID = undefined;
		}
	};

	$: handleAddRow = () => {
		const id = uuidv4();
		isEditableID = id;
		paymentTypeOptionsList = [
			...paymentTypeOptionsList,
			{
				id: id,
				group: selectedGroup,
				label: 'Edit...',
				value: 'Edit...',
				isActive: true,
				isDefault: false,
				currency: undefined
			}
		];
	};

	const deleteOption = async (id: number) => {
		try {
			await trpc().paymentTypeOptions.deleteById.mutate(id);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			toasts.add({
				message: `Option was deleted`,
				type: 'success'
			});
			getOptions();
		}
	};

	const handleDelete = (finalData: newOptions) => {
		if (finalData.isDefault) {
			toasts.add({
				message: 'You can not delete the default Pricelists',
				type: 'error'
			});
			return;
		}
		/**
		 * May not work
		 */
		if (typeof finalData.id === 'string' || finalData.id === undefined) {
			return;
		}
		deleteOption(finalData.id);
	};

	const updateOrSaveOptions = async (finalData: newOptions) => {
		try {
			if (typeof finalData?.id === 'string' || finalData?.id === undefined) {
				// Remove id
				delete finalData.id;
			}
			if (finalData?.currency === undefined) {
				// Remove id
				delete finalData.currency;
			}

			await trpc().paymentTypeOptions.saveOrUpdatePayments.mutate(finalData);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getOptions();
			toasts.add({ message: `Option was saved or updated successfully`, type: 'success' });
		}
	};

	const getOptions = async () => {
		try {
			paymentTypeOptionsList = await trpc().paymentTypeOptions.getPayments.query({});
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	onMount(() => {
		getOptions();
	});
</script>

<!-- Table start -->
<div class="bg-white p-2 shadow-lg">
	<div>
		{#if paymentTypeOptionsList.length}
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
			{#if paymentTypeOptionsList.length}
				{#each paymentTypeOptionsList as list (list.id)}
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
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									bind:value={list.currency}
									disabled={!(isEditableID === list.id)}
									type="text"
									name="currency"
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
