<script lang="ts">
	import { createConverter, createConverterHOF, format } from '$lib/services/monetary';
	import { currenciesOptions, selectedCurrency } from '$lib/stores/setCurrency.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { blurOnEscape, selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { svgTrashSmall } from '$lib/utility/svgLogos';
	import type { PaymentTypeOptions } from '@prisma/client';
	import type { Dinero } from 'dinero.js';
	import { dinero, subtract } from 'dinero.js';
	import type { Snapshot } from '../../../routes/$types';

	export let grandTotal: Dinero<number>;
	export let paymentTypeOptions: PaymentTypeOptions[];

	let paidInputValue: number = 0;

	let paidCurrencies = new Map<
		string,
		{
			paymentType: string;
			value: number;
			paidDefaultCurrency: Dinero<number>;
			paidGlobalCurrency: Dinero<number>;
		}
	>();

	let paidCurrenciesArray = [...paidCurrencies.keys()];

	const filterPayments = (type: string) => {
		return paymentTypeOptions.filter((item) => item.group === type);
	};

	const addPaidAmount = (paymentTypeOptions: PaymentTypeOptions) => {
		if (paidInputValue <= 0) {
			toasts.add({
				message: 'Please add paid amount',
				type: 'error'
			});
			return;
		}

		if (selectedPayment !== 'cash' && !referenceValue) {
			toasts.add({
				message: 'Reference number is required',
				type: 'error'
			});
			return;
		}

		if (!paymentTypeOptions.currency) {
			toasts.add({
				message: 'Selected currency not found',
				type: 'error'
			});
			return;
		}

		const filterSelectCurrency = $currenciesOptions.get(paymentTypeOptions.currency);
		const defaultCurrency = $currenciesOptions.get('USD');

		if (!defaultCurrency) {
			toasts.add({
				message: 'Default currency not found',
				type: 'error'
			});
			return;
		}

		if (!filterSelectCurrency) {
			toasts.add({
				message: 'Selected currency not found',
				type: 'error'
			});
			return;
		}

		const convertHOF = createConverterHOF();

		const convertAmount = convertHOF(
			dinero({ amount: paidInputValue * 100, currency: filterSelectCurrency.dineroObj }),
			defaultCurrency.dineroObj,
			filterSelectCurrency
		);

		if (!convertAmount) {
			toasts.add({
				message: 'Failed to convert amount',
				type: 'error'
			});
			return;
		}

		const convertRate = createConverter($selectedCurrency.dineroObj);

		const convertRateAmount = convertRate(convertAmount, $selectedCurrency.dineroObj);

		if (!convertRateAmount) {
			return;
		}

		paidCurrencies.set(paymentTypeOptions.value, {
			paymentType: paymentTypeOptions.label,
			value: paidInputValue,
			paidDefaultCurrency: convertAmount,
			paidGlobalCurrency: convertRateAmount
		});

		paidCurrenciesArray = [...paidCurrencies.keys()];

		paidInputValue = 0;
		getOutstanding();
	};

	let outstanding: Dinero<number> = grandTotal;

	const getOutstanding = () => {
		const subtractMany = (subtrahends: Dinero<number>[]) => subtrahends.reduce(subtract);

		const paidGlobalCurrencyArray = [...paidCurrencies.values()].map(
			(item) => item.paidGlobalCurrency
		);

		outstanding = subtractMany([grandTotal, ...paidGlobalCurrencyArray]);
	};

	const deletePaidAmount = (currency: string) => {
		paidCurrencies.delete(currency);

		paidCurrenciesArray = [...paidCurrencies.keys()];
		getOutstanding();
	};

	let selectedPayment = 'cash';
	let cashOptions = 'USD';
	let referenceValue: string | undefined = undefined;

	export const snapshot: Snapshot = {
		capture: () => paidCurrencies,
		restore: (value) => (paidCurrencies = value)
	};
</script>

<div class="grid grid-cols-4 mt-10 space-x-2">
	<div class=" space-y-2 col-span-2">
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
				bind:value={paidInputValue}
				on:change|preventDefault={() => (!paidInputValue ? 0 : paidInputValue)}
				class="py-2 px-3 block w-full text-right border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
			/>
		</div>
		{#if !(selectedPayment === 'cash')}
			<div class="flex shadow-sm">
				<span
					class="px-4 inline-flex items-center min-w-fit border border-r-0 border-pickled-bluewood-200 bg-pickled-bluewood-50 text-sm text-pickled-bluewood-500"
					>Ref Number</span
				>
				<input
					type="text"
					use:selectTextOnFocus
					use:blurOnEscape
					bind:value={referenceValue}
					class="py-2 px-3 block w-full text-right border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
				/>
			</div>
		{/if}
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
								{`${paidCurrencies.get(currency)?.paymentType} 
								(${paidCurrencies.get(currency)?.value})`}
							</span>
						</span>
						<span class="px-3">
							{!paidCurrencies.get(currency)?.paidGlobalCurrency
								? '...'
								: format(paidCurrencies.get(currency)?.paidGlobalCurrency)}
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
		{#each filterPayments('paymentType') as payment (payment)}
			<button
				on:click={() => {
					selectedPayment = payment.value;
					cashOptions = 'USD';
				}}
				class="btn btn-primary w-full {payment.value === selectedPayment ? 'bg-success' : ''}"
			>
				{payment.label}
			</button>
		{/each}
	</div>
	<div class="space-y-2">
		{#each filterPayments(selectedPayment) as payment (payment)}
			<button
				on:click={() => {
					cashOptions = payment.value;
					if (!payment.currency) {
						return;
					}
					addPaidAmount(payment);
				}}
				class="btn btn-primary w-full {paidCurrenciesArray.includes(payment.value)
					? 'bg-success'
					: ''}"
			>
				{payment.label}
			</button>
		{/each}
	</div>
	<div class="space-y-2">
		{#each filterPayments(cashOptions) as payment (payment)}
			<button on:click={() => {}} class="btn btn-primary w-full">
				{payment.label}
			</button>
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
