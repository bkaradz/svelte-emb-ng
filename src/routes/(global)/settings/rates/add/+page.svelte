<script lang="ts">
	import Checkbox from '$lib/components/Checkbox.svelte';
	import Input from '$lib/components/Input.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgFloppy, svgPencil, svgPlus, svgTrash } from '$lib/utility/svgLogos';
	import type { Options, XchangeRate, XchangeRateDetails } from '@prisma/client';
	import logger from '$lib/utility/logger';
	import dayjs from 'dayjs';
	import { dinero, toUnit } from 'dinero.js';
	import { USD, ZAR } from '@dinero.js/currencies';

	export let data: { currencyOptions: Options[] };

	let tableHeadings = ['Currency', 'Rate', 'Edit/Update', 'Delete/Add Row'];

	const TODAY = dayjs().format('YYYY-MM-DDTHH:mm');

	let rates: Partial<XchangeRate> & { XchangeRateDetails: XchangeRateDetails[] } = {
		xChangeRateDate: TODAY,
		isActive: true,
		isDefault: true,
		XchangeRateDetails: []
	};

	let selectedGroup = 'all';

	let groupList = new Set(['all']);

	$: groupList;

	let isEditableID: number | null = null;

	let newId = 'New Id';

	const getUsedCurrencies = () => {
		return rates.XchangeRateDetails.map((rate) => rate.currency);
	};

	const getUnUsedCurrencies = () => {
		return data.currencyOptions
			.map((item) => item.value)
			.filter((item) => !getUsedCurrencies().includes(item));
	};

	let usedCurrencies: string[] = [];

	let showButton = usedCurrencies.length + 1 < data.currencyOptions.length;

	const handleAddRow = () => {
		usedCurrencies = getUsedCurrencies();
		const unUsedCurrencies = getUnUsedCurrencies();

		isEditableID = null;

		let rateDetailsInit;

		if (unUsedCurrencies.length > 0) {
			rateDetailsInit = {
				id: crypto.randomUUID(),
				currency: unUsedCurrencies[0],
				rate: 1
			};
		} else {
			rateDetailsInit = {
				id: crypto.randomUUID(),
				currency: '',
				rate: 0
			};
		}

		handleEditable(rateDetailsInit);

		rates.XchangeRateDetails = [...rates.XchangeRateDetails, rateDetailsInit];
		showButton = usedCurrencies.length + 1 < data.currencyOptions.length;
	};

	const handleSubmit = async () => {
		const usedCurrenciesLength = getUsedCurrencies().length;
		const numberOfCurrencies = data.currencyOptions.length;
		if (usedCurrenciesLength < numberOfCurrencies) {
			toasts.add({ message: 'Add all currencies', type: 'error' });
			return;
		}
		if (usedCurrenciesLength < [...new Set(getUsedCurrencies())].length) {
			toasts.add({ message: 'Duplicate currencies are not allowed', type: 'error' });
			return;
		}

		try {
			const res = await fetch('/api/rates.json', {
				method: 'POST',
				body: JSON.stringify(rates),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				const resRates = await res.json();
				toasts.add({ message: `Exchange Rate with id ${resRates.id} was added`, type: 'success' });

				rates = {
					id: 0,
					xChangeRateDate: TODAY,
					isActive: true,
					isDefault: true,
					XchangeRateDetails: []
				};
			}
		} catch (err) {
			logger.error(`Error: ${err}`);
			toasts.add({
				message: 'An error has occurred while updating',
				type: 'error'
			});
		}
	};

	const handleEditable = (list: Options) => {
		if (isEditableID === null) {
			isEditableID = list.id;
		} else {
			isEditableID = null;
		}
	};
	const handleDelete = (list: Options) => {
		isEditableID = null;
		rates.XchangeRateDetails = rates.XchangeRateDetails.filter((rate) => rate.id !== list.id);
		usedCurrencies = getUsedCurrencies();
		showButton = usedCurrencies.length < data.currencyOptions.length;
	};
</script>

{#if rates}
	<div class="mb-2 bg-white p-4">
		<h1>Add Exchange Rates</h1>
	</div>
	<form on:submit|preventDefault={handleSubmit}>
		<div class="space-y-4 bg-white p-2 shadow-lg">
			<div class="flex items-end justify-between">
				<div class="flex items-end space-x-6 ">
					<label class=" text-sm" for="id"
						>Exchange Rate Id
						<input class="input w-full" type="text" name="id" id="id" bind:value={newId} disabled />
					</label>
					<Input
						class="input w-full"
						name="xChangeRateDate"
						label="Date Created"
						type="datetime-local"
						bind:value={rates.xChangeRateDate}
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
												class="text-sm border cursor-pointer p-1 border-royal-blue-500 bg-royal-blue-200 hover:bg-royal-blue-300 w-full"
											>
												{#each data.currencyOptions as type}
													<option
														value={type.value}
														class={usedCurrencies.includes(type.value) ? 'hidden' : ''}
													>
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
										<button class=" m-0 p-0" on:click|preventDefault={() => handleEditable(list)}>
											<span class="fill-current text-pickled-bluewood-500">
												{@html isEditableID === list.id ? svgFloppy : svgPencil}
											</span>
										</button>
									</td>

									<td class="p-1 text-center ">
										<button class=" m-0 p-0" on:click|preventDefault={() => handleDelete(list)}>
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
									{#if showButton}
										<button class=" m-0 p-0" on:click|preventDefault={() => handleAddRow()}
											><span class="flex fill-current text-white">{@html svgPlus} Add Row</span
											></button
										>
									{/if}
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
