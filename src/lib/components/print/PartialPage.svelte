<script lang="ts">
	import small_logo from '$lib/assets/small_logo.png';
	import { format } from '$lib/services/monetary';
	import type { GetQuotationOrderPrismaReturn } from '$lib/trpc/routes/orders.prisma';
	import { dinero, multiply, type Dinero } from 'dinero.js';

	type OrderType = GetQuotationOrderPrismaReturn['order']
	type PageType = OrderType & {showTotals: boolean, page: string}

	export let order: PageType;
	export let subTotal: Dinero<number>;
	export let calculatedVat: Dinero<number>;
	export let calculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<div class="page">
	<div class="header">
		<div class="flex justify-between items-center">
			<div class="w-1/3">
				<img src={small_logo} alt="logo" class="w-48 mx-auto" />
			</div>
			<div class="p-2 w-2/3">
				<ul class="flex">
					<li class="flex flex-col items-center p-2 border-l-2 border-royal-blue-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
							/>
						</svg>
						<p class="text-xs italic">www.theembroideryshop.co.zw</p>
						<p class="text-xs italic">theembroideryshopzw@gmail.com</p>
					</li>
					<li class="flex flex-col p-2 border-l-2 border-royal-blue-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<p class="text-xs">Lillian Enterprises (Pvt) Ltd t/a</p>
						<p class="text-xs"><b>The Embroidery Shop</b></p>
						<p class="text-xs">Stanfield Ratcliffe Building</p>
						<p class="text-xs">126 J Moyo St & 13th Ave</p>
						<p class="text-xs">Bulawayo</p>
					</li>
				</ul>
			</div>
		</div>
		<div class="w-full h-0.5 bg-royal-blue-500 absolute top-[178px] right-0" />
	</div>
	<div>
		{#if order}
			<slot />
			<div class="flex justify-center py-4">
				<div class="w-full">
					<table class="w-full">
						<thead class="">
							<tr class="border border-pickled-bluewood-300 bg-pickled-bluewood-200 text-white">
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 text-left"> # </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 text-left">
									Product Name
								</th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 text-right"> Quantity </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 text-right"> Unit Price </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 text-right"> Total </th>
							</tr>
						</thead>
						<tbody class="bg-white">
							{#each order.OrderLine as item (item.id)}
								{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal even:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
								>
									<td class="px-4 py-2 text-xs text-pickled-bluewood-500 text-left"
										>{item.productsID}</td
									>
									<td class="px-4 py-2">
										<div class="text-xs text-pickled-bluewood-600 truncate">
											{item.Products.name}
										</div>
									</td>
									<td class="px-4 py-2">
										<div class="text-xs text-pickled-bluewood-500 text-right">
											{item?.quantity}
										</div>
									</td>
									<td class="px-4 py-2 text-xs text-pickled-bluewood-500 text-right truncate"
										>{format(dinero(item.unitPrice))}
									</td>
									<td
										class="px-4 py-2 text-xs text-pickled-bluewood-500 font-semibold text-right truncate"
									>
										{format(totalPrice)}
									</td>
								</tr>
							{/each}
							{#if order.showTotals}
								<tr class="">
									<td colspan="3" />
									<td class="text-xs font-bold px-4">Subtotal</td>
									<td class="text-xs font-bold tracking-wider text-right px-4 py-2"
										>{format(subTotal)}</td
									>
								</tr>
								<tr>
									<th colspan="3" />
									<td class="text-xs font-bold px-4"><b>VAT({vat}%)</b></td>
									<td class="text-xs font-bold text-right px-4 py-2">{format(calculatedVat)}</td>
								</tr>
								<tr class="text-pickled-bluewood-800">
									<th colspan="3" />
									<td class="text-xs font-bold border border-r-0 border-royal-blue-700 px-4"
										><b>Total</b></td
									>
									<td
										class="text-xs font-bold text-right px-4 py-2 border border-l-0 border-royal-blue-700"
										>{format(calculatedTotal)}</td
									>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
	<div class="footer">
		<div class="w-full h-0.5 bg-royal-blue-500" />

		<div class="flex justify-between px-10 pt-2">
			<div>
				<h3 class="text-sm">Banking Details :</h3>
				<ul class="text-xs list-disc list-inside">
					<li>Account Name: <span>Lillian Enterprises P/L</span></li>
					<li>Account No: <span>21301 12883255602015</span></li>
					<li>Bank: <span>Banc ABC</span></li>
					<li>Branch: <span>J Moyo</span></li>
				</ul>
			</div>
			<div class="p-1 text-sm">
				{order?.page}
			</div>
		</div>

		<div class="mb-10">
			<div class="flex items-center justify-center text-xs">
				Thank you very much for doing business with us.
			</div>
		</div>
	</div>
</div>
