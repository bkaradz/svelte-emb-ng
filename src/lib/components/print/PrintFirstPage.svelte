<script lang="ts">
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type { Prisma } from '@prisma/client';
	import dayjs from 'dayjs';
	import type { Dinero } from 'dinero.js';
	import PartialPage from './PartialPage.svelte';

	type Orders = Prisma.OrdersGetPayload<Prisma.OrdersArgs>;

	export let order: Orders;
	export let subTotal: Dinero<number>;
	export let calculatedVat: Dinero<number>;
	export let calculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<PartialPage {order} {subTotal} {calculatedVat} {calculatedTotal} {vat}>
	<div class="flex justify-between py-4">
		<div class="w-1/3">
			<!-- <h6 class="font-bold text-xl">
				{order.accountsStatus}
			</h6> -->
			<h6 class="font-bold text-sm">
				{order.accountsStatus} # :
				<span class="text-sm font-medium">{generateSONumber(order.id)}</span>
			</h6>
			<h6 class="font-bold text-xs">
				Order Date : <span class="text-xs font-medium"
					>{dayjs(order?.orderDate).format('DD/MM/YYYY')}</span
				>
			</h6>
		</div>
		<div class="w-1/3">
			<address class="text-xs">
				<span class="font-bold"> Billed To : </span>
				<span>{order?.customerContact?.name}</span>
				<p>
					{order?.customerContact?.address?.length > 0 ? order?.customerContact?.address[0] : '...'}
				</p>
			</address>
		</div>
		<div class="w-1/3">
			<address class="text-xs">
				<span class="font-bold">Ship To :</span>
				<span>{order?.customerContact?.name}</span>
				<p>
					{order?.customerContact?.address?.length > 1 ? order?.customerContact?.address[1] : '...'}
				</p>
			</address>
		</div>
		<div />
	</div>
</PartialPage>
