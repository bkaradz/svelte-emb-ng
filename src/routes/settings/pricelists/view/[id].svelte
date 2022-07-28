<script lang="ts">
	import { page } from '$app/stores';
	import suite from '$lib/validation/client/signUp.validate';
	import classnames from 'vest/classnames';
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import Input from '$lib/components/Input.svelte';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import type { PricelistsDocument, PricelistsSubDocument } from '$lib/models/pricelists.model';
	import { dinero, toFormat, type DineroOptions } from 'dinero.js';
	import { convertPricelist } from '$lib/utility/pricelists.utils';

	let result = suite.get();

	export let tableHeadings = [
		'Embroidery Type',
		'Minimum Quantity',
		'Minimum Price',
		'Price per 1000 stitches'
	];

	const endpoint = `/api/pricelists/${$page.params.id}.json`;

	let pricelist: PricelistsDocument;

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID = null;

	$: if (pricelist?.pricelists?.length) {
		pricelist.pricelists.forEach((list: PricelistsSubDocument) => {
			groupList.add(list.embroideryTypes);
		});
	}

	onMount(async () => {
		try {
			const res = await fetch(endpoint);
			if (res.ok) {
				const tempPricelist = await res.json();
				pricelist = tempPricelist ? convertPricelist(tempPricelist) : null;
			}
		} catch (err) {
			logger.error(err.message);
		}
	});

	$: cn = classnames(result, {
		warning: 'warning',
		invalid: 'error',
		valid: 'success'
	});
</script>

{#if pricelist}
	<div class="mb-2 bg-white p-4">
		<h1>Pricelist Details View</h1>
	</div>
	<form>
		<div class="space-y-4 bg-white p-2 shadow-lg">
			<div class="flex items-end justify-between">
				<div class="flex items-end space-x-6 ">
					<Input
						name="name"
						label="Name"
						disabled={true}
						bind:value={pricelist.name}
						messages={result.getErrors('name')}
						validityClass={cn('name')}
					/>
					<Checkbox
						name="isActive"
						label="isActive"
						disabled={true}
						validityClass={cn('isActive')}
						bind:checked={pricelist.isActive}
					/>
					<Checkbox
						name="isDefault"
						label="isDefault"
						disabled={true}
						validityClass={cn('isDefault')}
						bind:checked={pricelist.isDefault}
					/>
				</div>
				<div>
					<input class="btn btn-primary hidden" type="submit" value="Submit" />
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
							{#each pricelist.pricelists as list (list._id)}
								{#if selectedGroup === list.embroideryTypes || selectedGroup === 'all'}
									<tr
										class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
									>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="embroideryTypes"
												disabled={!(isEditableID === list._id)}
												bind:value={list.embroideryTypes}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="minimumQuantity"
												disabled={!(isEditableID === list._id)}
												bind:value={list.minimumQuantity}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="minimumPrice"
												disabled={!(isEditableID === list._id)}
												bind:value={list.minimumPrice}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="pricePerThousandStitches"
												disabled={!(isEditableID === list._id)}
												bind:value={list.pricePerThousandStitches}
											/>
										</td>
									</tr>
								{/if}
							{/each}
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
