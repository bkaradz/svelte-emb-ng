<script lang="ts">
	import type { Dinero } from 'dinero.js';
	import type { Prisma } from '@prisma/client';
	import PartialPage from './PartialPage.svelte';

	type Orders = Prisma.OrdersGetPayload<Prisma.OrdersArgs>;

	export let order: Orders;
	export let subTotal: Dinero<number>;
	export let calculatedVat: Dinero<number>;
	export let calculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<PartialPage {order} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
