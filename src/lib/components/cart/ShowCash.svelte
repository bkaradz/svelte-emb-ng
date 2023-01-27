<script lang="ts">
	import { format } from '$lib/services/monetary';
	import type { Options } from '@prisma/client';
	import { dinero, subtract, type Dinero } from 'dinero.js';
	import { currenciesOptions, selectedCurrency } from '$lib/stores/setCurrency.store';
	import { blurOnEscape, selectTextOnFocus } from '$lib/utility/inputSelectDirective';

	export let grandTotal: Dinero<number>;

	let paid = 0;
	// const calculateChange = (grandTotal: Dinero<number>, paid: number) => {
	// 	if (!paid) {
	// 		paid = 0;
	// 	}
	// 	let change = format(
	// 		subtract(dinero({ amount: paid * 100, currency: $selectedCurrency.dineroObj }), grandTotal)
	// 	);
	// 	change = change;
	// 	return change;
	// };
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
				bind:value={paid}
				on:change|preventDefault={() => (!paid ? 0 : paid)}
				class="py-2 px-3 block w-full text-right border-pickled-bluewood-200 shadow-sm text-sm focus:z-10 focus:border-royal-blue-500 focus:ring-royal-blue-500"
			/>
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
				placeholder="test"
			/>
		</div>
	</div>
	<div class="space-y-2">
		<div>
			<button class="btn btn-secondary w-full">Partial Payment</button>
		</div>
		<div>
			<button class="btn btn-secondary w-full">Mixed Currency</button>
		</div>
		{#each $currenciesOptions as currency (currency)}
			<div>
				<button class="btn btn-primary w-full"
					>{` ${currency.currency} (${currency.symbol})`}</button
				>
			</div>
		{/each}
		<!-- <div>
			<button class="btn btn-primary w-full">Rand</button>
		</div>
		<div>
			<button class="btn btn-primary w-full">Pula</button>
		</div>
		<div>
			<button class="btn btn-primary w-full">Bonds</button>
		</div>
		<div>
			<button class="btn btn-primary w-full">RTGS</button>
		</div> -->
	</div>
</div>

<style lang="postcss">
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
