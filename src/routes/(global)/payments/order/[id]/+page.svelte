<script lang="ts">
	import PaymentDetails from '$lib/components/payments/PaymentDetails.svelte';
	import { format } from '$lib/services/monetary';
	import { selectedCurrency } from '$lib/stores/setCurrency.store';
	import { handleCartCalculations } from '$lib/utility/handleCartCalculations';
	import { generateSONumber } from '$lib/utility/salesOrderNumber.util';
	import type {
		Contacts,
		Options,
		OrderLine,
		Orders,
		PaymentTypeOptions,
		Pricelists,
		Products
	} from '@prisma/client';
	import { dinero, multiply } from 'dinero.js';

	type OrderType = Orders & {
		Pricelists: Pricelists;
		OrderLine: (OrderLine & {
			Products: Products;
		})[];
		customerContact: Contacts;
	};

	$: promise = handleCartCalculations(data.order, $selectedCurrency);

	export let data: {
		order: OrderType;
		currenciesOptions: Options;
		paymentTypeOptions: PaymentTypeOptions[];
	};
</script>

<svelte:head>
	<title>Payments</title>
</svelte:head>

<div class="w-full grid grid-cols-12">
	{#await promise then { subTotal, calculatedVat, grandTotal, order, vat }}
		<div class="col-span-3 bg-pickled-bluewood-50 p-4">
			<div class="flex items-center justify-between pb-3 border-b border-royal-blue-500">
				<h1 class="text-xl capitalize">Order</h1>
			</div>
			{#if data.order}
				<div>
					<h1 class=" pl-2 mt-2 font-semibold">{generateSONumber(data.order.id)}</h1>
				</div>
				<ul class="text-xs mt-2">
					{#each order.OrderLine as lineItem}
						{@const totalPrice = multiply(dinero(lineItem.unitPrice), lineItem.quantity)}
						<li class="gird grid-rows-2 border-b border-pickled-bluewood-400 py-1 px-2">
							<div>
								{lineItem.Products.name}
							</div>
							<div class="flex justify-between">
								<span>
									x{lineItem.quantity}
								</span>
								<span>
									{format(totalPrice)}
								</span>
							</div>
						</li>
					{/each}
				</ul>
				<ul class="text-sm bg-royal-blue-100">
					<li class="flex justify-between px-2 pt-2 pb-1">
						<span> Subtotal </span>
						<span>
							{format(subTotal)}
						</span>
					</li>
					<li class="flex justify-between px-2 pt-1 pb-2 border-b border-pickled-bluewood-400">
						<span> VAT({vat}%) </span>
						<span>
							{format(calculatedVat)}
						</span>
					</li>
					<li class="flex justify-between px-2 py-2">
						<span> Total </span>
						<span>
							{format(grandTotal)}
						</span>
					</li>
				</ul>
			{/if}
		</div>
		<div class="col-span-9 bg-royal-blue-100 p-4">
			<div class="flex items-center justify-between pb-3 border-b border-royal-blue-500">
				<h1 class="text-xl capitalize">Payments Details</h1>
			</div>
			<div>
				<PaymentDetails {grandTotal} paymentTypeOptions={data?.paymentTypeOptions} />
			</div>
		</div>
	{/await}
</div>

<style lang="postcss">
</style>
