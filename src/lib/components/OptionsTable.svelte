<script lang="ts">
	import type { OptionsDocument } from '$lib/models/options.models';
	import { toasts } from '$lib/stores/toasts.store';
	import logger from '$lib/utility/logger';
	import { svgDocumentAdd, svgPencil, svgPlus, svgXSmall } from '$lib/utility/svgLogos';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	export let tableHeadings = [
		'Group',
		'Name',
		'Value',
		'Active',
		'Default',
		'Edit/Save',
		'Delete & Add Row'
	];

	let optionsList: Array<Partial<OptionsDocument>> = [];

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID = null;

	$: if (optionsList.length) {
		optionsList.forEach((list) => {
			groupList.add(list.group);
		});
		groupList = groupList;
	}

	// const handleSubmit = async (option) => {
	// 	try {
	// 		const res = await fetch('/api/options.json', {
	// 			method: 'POST',
	// 			body: JSON.stringify(option),
	// 			headers: { 'Content-Type': 'application/json' }
	// 		});

	// 		if (res.ok) {
	// 			// const data = await res.json();
	// 			toasts.add({ message: 'The Option was added', type: 'success' });
	// 		}
	// 	} catch (err) {
	// 		logger.error(err.messages);
	// 		toasts.add({ message: 'An error has occured while adding the contact', type: 'error' });
	// 	}
	// };

	const heandleEditable = async (list: Partial<OptionsDocument>) => {
		if (isEditableID === null) {
			isEditableID = list._id;
		} else {
			await updateOrAddOptions(list);
			isEditableID = null;
		}
	};

	let idToRemove = [];

	$: heandleAddRow = () => {
		const id = uuidv4();
		isEditableID = id;
		idToRemove.push(id);
		optionsList = [
			...optionsList,
			{
				_id: id,
				group: selectedGroup,
				name: 'Edit...',
				value: 'Edit...',
				isActive: true,
				isDefault: false
			}
		];
	};

	const deleteOption = async (finalData: any) => {
		try {
			// let searchParams = new URLSearchParams(paramsObj as string);
			const res = await fetch('/api/options.json', {
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
				getOptions();
			}
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while updating user',
				type: 'error'
			});
			// error = err.message;
		}
	};

	const heandleDelete = (finalData: any) => {
		idToRemove = idToRemove.filter((list) => list !== finalData._id);
		deleteOption(finalData);
	};

	const updateOrAddOptions = async (finalData: any) => {
		try {
			// let searchParams = new URLSearchParams(paramsObj as string);
			if (idToRemove.includes(finalData._id)) {
				// Remove _id
				delete finalData._id;
				idToRemove = idToRemove.filter((list) => list !== finalData._id);

				const res = await fetch('/api/options.json', {
					method: 'POST',
					body: JSON.stringify(finalData),
					headers: { 'Content-Type': 'application/json' }
				});
				if (res.ok) {
					const option = await res.json();
					toasts.add({ message: `${option.name} was added`, type: 'success' });
				}
			} else {
				const res = await fetch('/api/options.json', {
					method: 'PUT',
					body: JSON.stringify(finalData),
					headers: { 'Content-Type': 'application/json' }
				});
				if (res.ok) {
					const option = await res.json();
					toasts.add({ message: `${option.name} was updated`, type: 'success' });
				}
			}
			getOptions();
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while updating user',
				type: 'error'
			});
			// error = err.message;
		}
	};

	const getOptions = async () => {
		try {
			// let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/options.json?');
			optionsList = await res.json();
		} catch (err) {
			logger.error(err.message);
			// error = err.message;
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
	<div class="">
		<table class="w-full rounded-lg text-left text-sm">
			<thead>
				<tr
					class="sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
				>
					{#each tableHeadings as header (header)}
						<th class="px-2 py-2">{header}</th>
					{/each}
				</tr>
			</thead>
			<tbody class="">
				{#if optionsList.length}
					{#each optionsList as list (list._id)}
						{#if selectedGroup === list.group || selectedGroup === 'all'}
							<tr
								class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
							>
								<td class="px-2 py-1">
									<input
										class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
										type="text"
										name="group"
										disabled={!(isEditableID === list._id)}
										bind:value={list.group}
									/>
								</td>
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
										type="text"
										name="value"
										disabled={!(isEditableID === list._id)}
										bind:value={list.value}
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
										bind:checked={list.isDefault}
										disabled={!(isEditableID === list._id)}
										type="checkbox"
										name="isDefault"
									/>
								</td>
								<td class="p-1 text-center ">
									<button class=" m-0 p-0" on:click|preventDefault={() => heandleEditable(list)}>
										<span class="fill-current text-pickled-bluewood-500">
											{@html isEditableID === list._id ? svgDocumentAdd : svgPencil}
										</span>
									</button>
								</td>
								<td class="p-1 text-center ">
									<button class=" m-0 p-0" on:click|preventDefault={() => heandleDelete(list._id)}>
										<span class="fill-current text-pickled-bluewood-500">{@html svgXSmall}</span>
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
					<td class="px-2 py-1">Name</td>
					<td class="px-2 py-1">value</td>
					<td class="px-2 py-1">
						<input disabled type="checkbox" name="isActive" checked={false} />
					</td>
					<td class="px-2 py-1">
						<input disabled type="checkbox" name="isActive" checked={true} />
					</td>
					<td class="px-2 py-1" />
					<td class="p-1 text-center">
						<button class=" m-0 p-0" on:click|preventDefault={() => heandleAddRow()}
							><span class="flex fill-current text-white">{@html svgPlus} Add Row</span></button
						>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<!-- Table End -->
<style lang="postcss">
</style>
