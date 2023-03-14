<script lang="ts">
	import type { SaveOrder } from '$lib/validation/saveOrder.validate';
	import type { Dinero } from 'dinero.js';
	import PartialPage from './PartialPage.svelte';

	export let order: SaveOrder;
	export let subTotal: Dinero<number>;
	export let calculatedVat: Dinero<number>;
	export let calculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<PartialPage {order} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
