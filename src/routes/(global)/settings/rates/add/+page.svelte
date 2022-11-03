<script lang="ts">
	// throw new Error("@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)");

	import Checkbox from '$lib/components/Checkbox.svelte';
	import Input from '$lib/components/Input.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import logger from '$lib/utility/logger';
	import { svgFloppy, svgPencil, svgPlus, svgTrash } from '$lib/utility/svgLogos';
	import suite from '$lib/validation/client/signUp.validate';
	import type { XchangeRate, XchangeRateDetails } from '@prisma/client';
	import dayjs from 'dayjs';
	import { v4 as uuidv4 } from 'uuid';
	import classnames from 'vest/classnames';

	export let data;
	$: console.log('🚀 ~ file: +page.svelte ~ line 16 ~ data', data);

	let result = suite.get();

	let tableHeadings = ['Currency', 'Rate', 'Edit/Update', 'Delete/Add Row'];

	const TODAY = dayjs().format('YYYY-MM-DDTHH:mm');

	const rateDetailsInit = {
		currency: '',
		rate: 0
	};

	const rates: Partial<XchangeRate> & { XchangeRateDetails: XchangeRateDetails[] } = {
		id: 0,
		xChangeRateDate: TODAY,
		isActive: true,
		isDefault: true,
		XchangeRateDetails: []
	};

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID = 0;

	const heandleAddRow = () => {
		rates.XchangeRateDetails.push(rateDetailsInit);
	};
	const handleCurrencyType = () => {};
	const headleSubmit = () => {};
	const heandleEditable = () => {};
	const heandleDelete = () => {};
	const handleInput = () => {};
</script>

{#if rates}
	<div class="mb-2 bg-white p-4">
		<h1>Add Exchange Rates</h1>
	</div>
	<form on:submit|preventDefault={headleSubmit}>
		<div class="space-y-4 bg-white p-2 shadow-lg">
			<div class="flex items-end justify-between">
				<div class="flex items-end space-x-6 ">
					<label class=" text-sm" for="id"
						>Rate Id
						<input
							class="input w-full"
							type="text"
							name="id"
							id="id"
							bind:value={rates.id}
							disabled
						/>
					</label>
					<Input
						class="input w-full"
						name="xChangeRateDate"
						label="Date Created"
						type="datetime-local"
						bind:value={rates.xChangeRateDate}
						onInput={handleInput}
						messages={result.getErrors('name')}
					/>
					<Checkbox name="isActive" label="isActive" bind:checked={rates.isActive} />
					<Checkbox name="isDefault" label="isDefault" bind:checked={rates.isDefault} />
				</div>
				<div>
					<input class="btn btn-primary" type="submit" value="Submit" />
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
							{#each rates.XchangeRateDetails as list (list.id)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
								>
									<td class="px-2 py-1">
										{#if data?.currencyOptions}
											<select
												bind:value={list.currency}
												disabled={!(isEditableID === list.id)}
												on:change|preventDefault={() => handleCurrencyType(item)}
												class="text-sm border cursor-pointer p-1 rounded border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300"
											>
												{#each data.currencyOptions as type}
													<option value={type.value}>
														{type.label}
													</option>
												{/each}
											</select>
										{/if}
									</td>
									<td class="px-2 py-1">
										<input
											class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
											type="text"
											name="minimumQuantity"
											disabled={!(isEditableID === list.id)}
											bind:value={list.rate}
										/>
									</td>

									<td class="p-1 text-center ">
										<button class=" m-0 p-0" on:click|preventDefault={() => heandleEditable(list)}>
											<span class="fill-current text-pickled-bluewood-500">
												{@html isEditableID === list.id ? svgFloppy : svgPencil}
											</span>
										</button>
									</td>

									<td class="p-1 text-center ">
										<button class=" m-0 p-0" on:click|preventDefault={() => heandleDelete(list)}>
											<span class="fill-current text-pickled-bluewood-500">{@html svgTrash}</span>
										</button>
									</td>
								</tr>
							{/each}
							<tr
								class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 bg-royal-blue-300 font-normal text-white"
							>
								<td class="px-2 py-1">Currency</td>
								<td class="px-2 py-1">Rate</td>

								<td class="px-2 py-1" />
								<td class="p-1 text-center">
									<button class=" m-0 p-0" on:click|preventDefault={() => heandleAddRow()}
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
