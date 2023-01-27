<script lang="ts">
	import ArrowProgressBar from '$lib/components/ArrowProgressBar.svelte';
	import { dinero, convert, toUnit } from 'dinero.js';
	import { USD, EUR } from '@dinero.js/currencies';

	const rates = { EUR: { amount: 89, scale: 2 } };
	const ratesE = { USD: { amount: (1 / 0.89) * 100, scale: 2 } };
	const d = dinero({ amount: 500, currency: USD });
	const e = dinero({ amount: 445, currency: EUR });

	const eur = convert(d, EUR, rates); // a Dinero object with amount 44500 and scale 4
	const usd = convert(eur, USD, ratesE); // a Dinero object with amount 44500 and scale 4
</script>

<svelte:head>
	<title>Production</title>
</svelte:head>

<ArrowProgressBar />
