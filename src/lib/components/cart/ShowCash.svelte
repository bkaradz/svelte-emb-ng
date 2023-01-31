<script lang="ts">
	import { subtract } from 'dinero.js';
	import type { Dinero, Currency, Rates } from 'dinero.js';
	import { convert, dinero, toSnapshot } from 'dinero.js';
	import { blurOnEscape, selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { createConverter, createConverterHOF, format } from '$lib/services/monetary';
	import { currenciesOptions, selectedCurrency } from '$lib/stores/setCurrency.store';
	import type { CurrencyOption, CurrencyType } from '$lib/stores/setCurrency.store';
	import { svgTrashSmall } from '$lib/utility/svgLogos';

	export let grandTotal: Dinero<number>;

	let paidInputVale: number = 0;

	let paidCurrencies = new Map<CurrencyType, number>();
	let paidCurrenciesUSD = new Map<CurrencyType, Dinero<number>>();
	let paidGlobalCurrency = new Map<CurrencyType, Dinero<number>>();

	let paidCurrenciesArray = [...paidCurrencies.keys()];

	const addPaidAmount = (selectCurrency: CurrencyType) => {
		if (paidInputVale <= 0) {
			return;
		}
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
		paidCurrenciesUSD.set(selectCurrency, convertAmount);
		paidGlobalCurrency.set(selectCurrency, convertRateAmount);

		paidCurrenciesArray = [...paidCurrencies.keys()];
		paidInputVale = 0;
		getOutstanding();
	};

	let outstanding: Dinero<number> = grandTotal;

	const getOutstanding = () => {
		const subtractMany = (subtrahends: Dinero<number>[]) => subtrahends.reduce(subtract);

		outstanding = subtractMany([grandTotal, ...[...paidGlobalCurrency.values()]]);
	};

	const deletePaidAmount = (currency: CurrencyType) => {
		paidCurrencies.delete(currency);
		paidCurrenciesUSD.delete(currency);
		paidGlobalCurrency.delete(currency);

		paidCurrenciesArray = [...paidCurrencies.keys()];
		getOutstanding();
	};
</script>

<div class="grid grid-cols-3 mt-10 space-x-2">
	<div class="col-span-2 space-y-2">
		<div class="flex shadow-sm">
			<span
				class="px-4 inline-flex items-center min-w-fit border border-r-0 border-pickled-bluewood-200 bg-pickled-bluewood-50 text-sm text-pickled-bluewood-500"
				>Cash Due</span
			>
			<input
				type="text"
				disabled
				class="py-2 px-3 block w-full text-right bg-pickled-bluewood-700 placeholder-white border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
				placeholder={format(grandTotal)}
			/>
		</div>
		<div class="flex shadow-sm">
			<span
				class="px-4 inline-flex items-center min-w-fit border border-r-0 border-pickled-bluewood-200 bg-pickled-bluewood-50 text-sm text-pickled-bluewood-500"
				>Paid</span
			>
			<input
				type="number"
				use:selectTextOnFocus
				use:blurOnEscape
				bind:value={paidInputVale}
				on:change|preventDefault={() => (!paidInputVale ? 0 : paidInputVale)}
				class="py-2 px-3 block w-full text-right border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
			/>
		</div>
		<div class="mt-3">
			<ul class="space-y-2">
				{#each paidCurrenciesArray as currency (currency)}
					<li
						class="flex text-sm justify-between items-center border border-pickled-bluewood-900 bg-pickled-bluewood-700 text-white"
					>
						<span class="flex justify-center items-center">
							<button
								on:click|preventDefault={() => deletePaidAmount(currency)}
								class="bg-pickled-bluewood-500 px-3 py-2"
							>
								{@html svgTrashSmall}
							</button>
							<span class="px-2">
								{`${currency} (${paidCurrencies.get(currency)})`}
							</span>
						</span>
						<span class="px-3">
							{!paidGlobalCurrency.get(currency) ? '...' : format(paidGlobalCurrency.get(currency))}
						</span>
					</li>
				{/each}
			</ul>
		</div>
		<div class="flex shadow-sm">
			<span
				class="px-4 inline-flex items-center min-w-fit border border-r-0 border-pickled-bluewood-200 bg-pickled-bluewood-50 text-sm text-pickled-bluewood-500"
				>Outstanding</span
			>
			<input
				type="text"
				disabled
				class="py-2 px-3 block w-full text-right border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
				placeholder={format(outstanding)}
			/>
		</div>
	</div>
	<div class="space-y-2">
		{#each Array.from($currenciesOptions.values()) as currency (currency)}
			<div>
				<button
					on:click|preventDefault={() => addPaidAmount(currency.currency)}
					class="btn btn-primary w-full {paidCurrenciesArray.includes(currency.currency)
						? 'bg-success'
						: ''}">{` ${currency.currency} (${currency.symbol})`}</button
				>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
