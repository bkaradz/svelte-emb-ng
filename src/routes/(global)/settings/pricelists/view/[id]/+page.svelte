<script lang="ts">
	import { page } from '$app/stores';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import Checkbox2 from '$lib/components/Checkbox2.svelte';
	import type { PricelistDetails, Pricelists } from '@prisma/client';

	type Pricelist = Pricelists & { PricelistDetails: PricelistDetails[] };

	export let data: { pricelist: Pricelist };

	let errorMessages = new Map();

	let tableHeadings = [
		'Embroidery Type',
		'Minimum Quantity',
		'Minimum Price',
		'Price per 1000 stitches'
	];

	let pricelist = data.pricelist;

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;
</script>

{#if pricelist}
	<div class="mb-2 bg-white p-4">
		<h1>View Pricelist</h1>
	</div>
	<form>
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
						disabled
						bind:value={pricelist.name}
					/>

					<Checkbox2
						name="isActive"
						label="isActive"
						disabled
						errorMessages={errorMessages.get('isActive')}
						bind:checked={pricelist.isActive}
					/>
					<Checkbox2
						name="isDefault"
						label="isDefault"
						disabled
						errorMessages={errorMessages.get('isDefault')}
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
							{#each pricelist.PricelistDetails as list (list.id)}
								{#if selectedGroup === list.embroideryTypes || selectedGroup === 'all'}
									<tr
										class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
									>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="embroideryTypes"
												disabled
												bind:value={list.embroideryTypes}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="minimumQuantity"
												disabled
												bind:value={list.minimumQuantity}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="minimumPrice"
												disabled
												bind:value={list.minimumPrice}
											/>
										</td>
										<td class="px-2 py-1">
											<input
												class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
												type="text"
												name="pricePerThousandStitches"
												disabled
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
