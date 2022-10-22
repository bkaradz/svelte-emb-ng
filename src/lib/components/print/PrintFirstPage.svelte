<script lang="ts">
	import dayjs from 'dayjs';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type { Dinero } from 'dinero.js';
	import type { Prisma } from '@prisma/client';
	import PartialPage from './PartialPage.svelte';

	type Orders = Prisma.OrdersGetPayload<Prisma.OrdersArgs>;

	export let order: Orders;
	export let subTotal: Dinero<number>;
	export let calclculatedVat: Dinero<number>;
	export let calclculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<PartialPage {order} {subTotal} {calclculatedVat} {calclculatedTotal} {vat}>
	<div class="flex justify-between p-4">
		<div class="w-1/3">
			<h6 class="font-bold text-xl">
				{order.accountsStatus}
			</h6>
			<h6 class="font-bold">
				{order.accountsStatus} # :
				<span class="text-sm font-medium">{generateSONumber(order.id)}</span>
			</h6>
			<h6 class="font-bold">
				Order Date : <span class="text-sm font-medium"
					>{dayjs(order?.orderDate).format('DD/MM/YYYY')}</span
				>
			</h6>
		</div>
		<div class="w-1/3">
			<address class="text-sm">
				<span class="font-bold"> Billed To : </span>
				<span>{order?.customerContact?.name}</span>
				<p>
					{order?.customerContact?.address.length > 0 ? order?.customerContact?.address[0] : '...'}
				</p>
			</address>
		</div>
		<div class="w-1/3">
			<address class="text-sm">
				<span class="font-bold">Ship To :</span>
				<span>{order?.customerContact?.name}</span>
				<p>
					{order?.customerContact?.address.length > 1 ? order?.customerContact?.address[1] : '...'}
				</p>
			</address>
		</div>
		<div />
	</div>
</PartialPage>
