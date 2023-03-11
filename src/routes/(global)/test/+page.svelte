<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { createConverter, createConverterHOF, format } from '$lib/services/monetary';
	import {
		currenciesOptions,
		selectedCurrency,
		type CurrencyType
	} from '$lib/stores/setCurrency.store';
	import { dinero, type Dinero } from 'dinero.js';

	let testText = '';

	let showModal = false;

	let selectCurrency: CurrencyType;
	let paidInputVale: number;

	const paidCurrencies = new Map<string, number>();
	const paidCurrenciesUSD = new Map<string, Dinero<number>>();

	let paidCurrenciesArray = [...paidCurrencies.keys()];

	const addPaidAmount = () => {
		const filterSelectCurrency = $currenciesOptions.get(selectCurrency);
		const defaultCurrency = $currenciesOptions.get('USD');

		if (!defaultCurrency) {
			return;
		}

		if (!filterSelectCurrency) {
			return;
		}

		const convertHOF = createConverterHOF();

		const convertAmount = convertHOF(
			dinero({ amount: paidInputVale * 100, currency: filterSelectCurrency.dineroObj }),
			defaultCurrency.dineroObj,
			filterSelectCurrency
		);

		if (!convertAmount) {
			return;
		}

		const convertRate = createConverter($selectedCurrency.dineroObj);

		const convertRateAmount = convertRate(convertAmount, $selectedCurrency.dineroObj);

		if (!convertRateAmount) {
			return;
		}

		paidCurrencies.set(selectCurrency, paidInputVale);
		paidCurrenciesUSD.set(selectCurrency, convertRateAmount);
		paidCurrenciesArray = [...paidCurrencies.keys()];
	};
</script>

<div>
	<button class="btn btn-primary" on:click={() => (showModal = true)}> show modal </button>

	{#if showModal}
		<Modal on:close={() => (showModal = false)}>
			<h2 slot="header">
				Test Input
				<small><em>adjective</em> mod·al \ˈmō-dəl\</small>
			</h2>

			<input class="input my-4" type="text" bind:value={testText} />

			<div slot="footer" class="mt-2 flex justify-end space-x-2">
				<button class="btn btn-primary">Submit</button>
				<button on:click|preventDefault={() => (showModal = false)} class="btn btn-primary"
					>Close</button
				>
			</div>
		</Modal>
	{/if}

	<div>
		<div class="flex shadow-sm mt-10">
			<span
				class="px-4 inline-flex items-center min-w-fit border border-r-0 border-pickled-bluewood-200 bg-pickled-bluewood-50 text-sm text-pickled-bluewood-500"
				>Small</span
			>
			<input
				type="number"
				bind:value={paidInputVale}
				class="py-2 px-3 pr-2 text-right block w-full border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
			/>
			<span
				class=" inline-flex items-center min-w-fit border border-l-0 border-pickled-bluewood-200 bg-pickled-bluewood-50  text-pickled-bluewood-500"
			>
				<select
					bind:value={selectCurrency}
					id="addCurrency"
					name="addCurrency"
					class="block w-full pr-7 border-transparent text-sm bg-pickled-bluewood-50 focus:ring-transparent focus:border-transparent"
				>
					{#each Array.from($currenciesOptions.values()) as currency (currency)}
						<option value={currency.currency}>
							{`${currency.currency} (${currency.symbol})`}
						</option>
					{/each}
				</select>
			</span>
			<span
				class="inline-flex items-center min-w-fit border border-l-0 border-pickled-bluewood-200 bg-pickled-bluewood-50  text-pickled-bluewood-500"
			>
				<button class="btn btn-primary" on:click|preventDefault={addPaidAmount}>Add</button>
			</span>
		</div>
		<div class="mt-3">
			<ul class="space-y-2">
				{#each paidCurrenciesArray as currency (currency)}
					<li
						class="flex text-sm justify-between px-3 py-2 border border-pickled-bluewood-200 bg-pickled-bluewood-200 text-pickled-bluewood-800"
					>
						<span>
							{`${currency} (${paidCurrencies.get(currency)})`}
						</span>
						<span>
							{!paidCurrenciesUSD.get(currency) ? '...' : format(paidCurrenciesUSD.get(currency))}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div>
		<div class="relative mt-10">
			<input
				type="text"
				id="hs-input-with-leading-and-trailing-icon"
				name="hs-input-with-leading-and-trailing-icon"
				class="py-2 px-3 pl-16 pr-16 block w-full border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500 dark:bg-pickled-bluewood-800 dark:border-pickled-bluewood-700 dark:text-pickled-bluewood-400"
				placeholder="0.00"
			/>
			<div class="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-4">
				<span class="text-pickled-bluewood-500">Paid</span>
			</div>
			<div class="absolute inset-y-0 right-0 flex items-center pointer-events-none z-20 pr-4">
				<span class="text-pickled-bluewood-500">USD</span>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
