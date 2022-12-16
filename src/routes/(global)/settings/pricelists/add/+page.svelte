<script lang="ts">
	import Checkbox2 from '$lib/components/Checkbox2.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import logger from '$lib/utility/logger';
	import { svgFloppy, svgPencil, svgPlus, svgTrash } from '$lib/utility/svgLogos';
	import { addPricelistSchema } from '$lib/validation/savePricelists.validate';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import type { Options, PricelistDetails, Pricelists } from '@prisma/client';
	import dayjs from 'dayjs';

	export let data: { embroideryTypes: Options };

	let errorMessages = new Map();

	let tableHeadings = [
		'Embroidery Type',
		'Minimum Quantity',
		'Minimum Price',
		'Price per 1000 stitches',
		'Edit/Update',
		'Delete/Add Row'
	];

	const TODAY = dayjs().format('YYYY-MM-DDTHH:mm');

	type PricelistsDetails = Omit<PricelistDetails, 'id' | 'pricelistsId'> & { id: string };

	type PricelistType = Pick<Pricelists, 'name' | 'isActive' | 'isDefault'> & {
		pricelistDetails: PricelistsDetails[];
	};

	const initPricelist: Partial<PricelistType> = {
		name: TODAY,
		isActive: true,
		isDefault: false,
		pricelistDetails: []
	};

	let pricelist = { ...initPricelist };

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID: string | null = null;

	$: if (pricelist?.pricelistDetails?.length) {
		groupList = new Set(['all']);
		pricelist.pricelistDetails.forEach((list) => {
			groupList.add(list.embroideryTypes);
		});
		groupList = groupList;
	}

	const handleEditable = async (list: PricelistsDetails) => {
		if (isEditableID === null) {
			isEditableID = list.id;
		} else {
			// await updateOrAddOptions(list);
			isEditableID = null;
		}
	};

	const handleDelete = (finalData: PricelistsDetails) => {
		idToRemove = idToRemove.filter((list) => list !== finalData.id);
		pricelist.pricelistDetails = pricelist?.pricelistDetails?.filter(
			(list) => list.id !== finalData.id
		);
	};

	let idToRemove: string[] = [];

	$: handleAddRow = () => {
		const id = crypto.randomUUID();

		if (!Array.isArray(pricelist?.pricelistDetails)) {
			return;
		}

		isEditableID = id;
		idToRemove.push(id);
		pricelist.pricelistDetails = [
			...pricelist.pricelistDetails,
			{
				id: id,
				embroideryTypes: selectedGroup,
				minimumPrice: 0.0,
				minimumQuantity: 0,
				pricePerThousandStitches: 0.0
			}
		];
	};

	$: disabled = false;

	const headleSubmit = async () => {
		disabled = true;

		try {
			const parsedPricelist = addPricelistSchema.safeParse(pricelist);

			if (!parsedPricelist.success) {
				const errorMap = zodErrorMessagesMap(parsedPricelist);

				if (errorMap) {
					errorMessages = errorMap;
				}
				disabled = false;
				return;
			}

			const res = await fetch('/api/pricelists.json', {
				method: 'POST',
				body: JSON.stringify(parsedPricelist.data),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				pricelist = await res.json();
				pricelist = { ...initPricelist };
				disabled = false;
				toasts.add({ message: `${pricelist.name} was added`, type: 'success' });
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({
				message: 'An error has occurred while updating',
				type: 'error'
			});
		}
	};
</script>

{#if pricelist}
	<div class="mb-2 bg-white p-4">
		<h1>Add Pricelist</h1>
	</div>
	<form on:submit|preventDefault={headleSubmit}>
		<div class="space-y-4 bg-white p-2 shadow-lg">
			<div class="flex items-end justify-between">
				<div class="flex items-end space-x-6 ">
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
						bind:value={pricelist.name}
					/>
					<Checkbox2
						name="isActive"
						label="isActive"
						errorMessages={errorMessages.get('isActive')}
						bind:checked={pricelist.isActive}
					/>
					<Checkbox2
						name="isDefault"
						label="isDefault"
						errorMessages={errorMessages.get('isDefault')}
						bind:checked={pricelist.isDefault}
					/>
				</div>
				<div>
					<input {disabled} class="btn btn-primary" type="submit" value="Submit" />
				</div>
			</div>
			<!-- Table start -->
			<div class="w-full  ">
				<div>
					{#each [...groupList] as list, index (index)}
						<button
							on:click|preventDefault={() => (selectedGroup = list)}
							class="mx-1 mb-3 mt-2 justify-center rounded-full border border-transparent px-3 py-1 text-sm font-medium text-white {selectedGroup ===
							list
								? `btn-primary`
								: `btn-tertiary`}">{list}</button
						>
					{/each}
				</div>
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
							{#if Array.isArray(pricelist?.pricelistDetails)}
								{#each pricelist?.pricelistDetails as list (list?.id)}
									{#if selectedGroup === list.embroideryTypes || selectedGroup === 'all'}
										<tr
											class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
										>
											<td class="px-2 py-1">
												{#if Array.isArray(data.embroideryTypes)}
													<select
														bind:value={list.embroideryTypes}
														class="text-sm w-full border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
													>
														{#each data.embroideryTypes as type}
															<option value={type.value}>
																{type.label}
															</option>
														{/each}
													</select>
												{/if}
											</td>
											<td class="px-2 py-1">
												<input
													use:selectTextOnFocus
													class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
													type="number"
													name="minimumQuantity"
													disabled={!(isEditableID === list.id)}
													bind:value={list.minimumQuantity}
												/>
											</td>
											<td class="px-2 py-1">
												<input
													use:selectTextOnFocus
													class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
													type="number"
													name="minimumPrice"
													disabled={!(isEditableID === list.id)}
													bind:value={list.minimumPrice}
												/>
											</td>
											<td class="px-2 py-1">
												<input
													use:selectTextOnFocus
													class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
													type="number"
													name="pricePerThousandStitches"
													disabled={!(isEditableID === list.id)}
													bind:value={list.pricePerThousandStitches}
												/>
											</td>
											<td class="p-1 text-center ">
												<button
													class=" m-0 p-0"
													on:click|preventDefault={() => handleEditable(list)}
												>
													<span class="fill-current text-pickled-bluewood-500">
														{@html isEditableID === list.id ? svgFloppy : svgPencil}
													</span>
												</button>
											</td>

											<td class="p-1 text-center ">
												<button
													class=" m-0 p-0"
													on:click|preventDefault={() => handleDelete(list)}
												>
													<span class="fill-current text-pickled-bluewood-500"
														>{@html svgTrash}</span
													>
												</button>
											</td>
										</tr>
									{/if}
								{/each}
							{/if}
							<tr
								class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 bg-royal-blue-300 font-normal text-white"
							>
								<td class="px-2 py-1">embroideryTypes</td>
								<td class="px-2 py-1">minimumPrice</td>
								<td class="px-2 py-1">minimumQuantity</td>
								<td class="px-2 py-1">pricePerThousandStitches</td>

								<td class="px-2 py-1" />
								<td class="p-1 text-center">
									<button class=" m-0 p-0" on:click|preventDefault={() => handleAddRow()}
										><span class="flex fill-current text-white">{@html svgPlus} Add Row</span
										></button
									>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<pre class="text-xs text-royal-blue-900" />
			</div>
			<!-- Table End -->
		</div>
	</form>
{/if}

<style>
</style>
