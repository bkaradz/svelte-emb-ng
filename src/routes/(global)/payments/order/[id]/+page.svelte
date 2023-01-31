<script lang="ts">
	import { format } from '$lib/services/monetary';
	import { selectedCurrency } from '$lib/stores/setCurrency.store';
	import { handleCartCalculations } from '$lib/utility/handleCartCalculations';
	import type { Contacts, OrderLine, Orders, Pricelists, Products } from '@prisma/client';
	import { dinero, multiply } from 'dinero.js';

	type OrderType = Orders & {
		Pricelists: Pricelists;
		OrderLine: (OrderLine & {
			Products: Products;
		})[];
		customerContact: Contacts;
	};

	$: promise = handleCartCalculations(data.order, $selectedCurrency);

	export let data: { order: OrderType };
	console.log('🚀 ~ file: +page.svelte:4 ~ data', data);
</script>

<svelte:head>
	<title>Payments</title>
</svelte:head>

<div class="w-full grid grid-cols-12">
	{#await promise then { totalCartItems, subTotal, calculatedVat, grandTotal, order, vat }}
		<div class="col-span-3 bg-pickled-bluewood-50 p-4">
			{#if data.order}
				<ul class="text-xs ">
					{#each data.order.OrderLine as lineItem}
						{@const totalPrice = multiply(dinero(lineItem.unitPrice), lineItem.quantity)}
						<li class="gird grid-rows-2 border-b border-pickled-bluewood-400 py-1">
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
				<ul>
					<li>
						<span> Sub Total </span>
						<span>
							{format(subTotal)}
						</span>
					</li>
				</ul>
			{/if}
		</div>
		<div class="col-span-9 bg-royal-blue-100 p-4">
			<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
				<h1 class="text-2xl font-semibold capitalize">Payments Details</h1>
			</div>
		</div>
	{/await}
</div>

<style lang="postcss">
</style>
