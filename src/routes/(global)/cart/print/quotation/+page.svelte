<script lang="ts">
	import small_logo from '$lib/assets/small_logo.png';
</script>

<div class="flex flex-1 flex-col w-full">
	<div
		class="flex flex-1 flex-wrap items-center justify-center bg-royal-blue-50 border-danger overflow-y-scroll gap-3 p-3"
	>
		<div class="page">
			<div class="header">
				<div class="flex justify-between items-center">
					<div>
						<img src={small_logo} alt="logo" class="w-48" />
					</div>
					<div class="p-2">
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
								<span class="text-sm italic"> www.theembroideryshop.co.zw </span>
								<span class="text-sm italic"> theembroideryshopzw@gmail.com </span>
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
								<span class="text-sm"> Lillian Enterprises (Pvt) Ltd t/a The Embroidery Shop </span>
								<span class="text-sm"> Stanfield Ratcliffe Building </span>
								<span class="text-sm"> 126 J Moyo St & 13th Ave </span>
								<span class="text-sm"> Bulawayo </span>
							</li>
						</ul>
					</div>
				</div>
				<div class="w-full h-0.5 bg-royal-blue-500" />
			</div>
			<div class="flex justify-between p-4">
				<div>
					<h6 class="font-bold">Order # : <span class="text-sm font-medium"> 12/12/2022</span></h6>
					<h6 class="font-bold">
						Order Date : <span class="text-sm font-medium"> 12/12/2022</span>
					</h6>
				</div>
				<div class="w-40">
					<address class="text-sm">
						<span class="font-bold"> Billed To : </span>
						Joe Smith 795 Folsom Ave San Francisco, CA 94107 P: (123) 456-7890
					</address>
				</div>
				<div class="w-40">
					<address class="text-sm">
						<span class="font-bold">Ship To :</span>
						Joe doe 800 Folsom Ave San Francisco, CA 94107 P: + 111-456-7890
					</address>
				</div>
				<div />
			</div>
			<div class="flex justify-center p-4">
				<div class="border-b border-pickled-bluewood-200 shadow w-full">
					<table class="w-full">
						<thead class="">
							<tr
								class="border border-b-0 border-pickled-bluewood-300 bg-pickled-bluewood-200 text-white"
							>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 "> # </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 "> Product Name </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 "> Quantity </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 "> Rate </th>
								<th class="px-4 py-2 text-xs text-pickled-bluewood-500 "> Subtotal </th>
							</tr>
						</thead>
						<tbody class="bg-white">
							<tr
								class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
							>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500 "> 1 </td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-900">
										Amazon Brand - Symactive Men's Regular Fit T-Shirt
									</div>
								</td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-500">4</div>
								</td>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500"> $20 </td>
								<td class="px-6 py-2"> $30 </td>
							</tr>
							<tr
								class="whitespace-no-wrap  w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
							>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500"> 2 </td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-900">
										Amazon Brand - Symactive Men's Regular Fit T-Shirt
									</div>
								</td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-500">2</div>
								</td>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500"> $60 </td>
								<td class="px-6 py-2"> $12 </td>
							</tr>
							<tr
								class="whitespace-no-wrap  w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
							>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500"> 3 </td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-900">
										Amazon Brand - Symactive Men's Regular Fit T-Shirt
									</div>
								</td>
								<td class="px-6 py-2">
									<div class="text-sm text-pickled-bluewood-500">1</div>
								</td>
								<td class="px-6 py-2 text-sm text-pickled-bluewood-500"> $10 </td>
								<td class="px-6 py-2"> $13 </td>
							</tr>
							<tr class="">
								<td colspan="3" />
								<td class="text-sm font-bold">Sub Total</td>
								<td class="text-sm font-bold tracking-wider"><b>$950</b></td>
							</tr>
							<!--end tr-->
							<tr>
								<th colspan="3" />
								<td class="text-sm font-bold"><b>Tax Rate</b></td>
								<td class="text-sm font-bold"><b>$1.50%</b></td>
							</tr>
							<!--end tr-->
							<tr class="text-white bg-pickled-bluewood-800">
								<th colspan="3" />
								<td class="text-sm font-bold"><b>Total</b></td>
								<td class="text-sm font-bold"><b>$999.0</b></td>
							</tr>
							<!--end tr-->
						</tbody>
					</table>
				</div>
			</div>
			<div class="footer">
				<div class="w-full h-0.5 bg-royal-blue-500" />

				<div class="flex justify-between p-1">
					<div>
						<h3 class="text-xl">Banking Details :</h3>
						<ul class="text-xs list-disc list-inside">
							<li>All accounts are to be paid within 7 days from receipt of invoice.</li>
							<li>To be paid by cheque or credit card or direct payment online.</li>
							<li>If account is not paid within 7 days the credits details supplied.</li>
						</ul>
					</div>
					<div class="p-1">
						<h3>Signature</h3>
						<div class="text-4xl italic text-royal-blue-500">AAA</div>
					</div>
				</div>

				<div class="">
					<div class="flex items-center justify-center">
						Thank you very much for doing business with us.
					</div>
					<div class="flex items-end justify-end space-x-3 printButtons">
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-success"
							>Print</button
						>
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-danger"
							>Cancel</button
						>
					</div>
				</div>
			</div>
		</div>
		<div class="page">
			<div class="header">
				<div class="flex justify-between items-center">
					<div>
						<img src={small_logo} alt="logo" class="w-48" />
					</div>
					<div class="p-2">
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
								<span class="text-sm italic"> www.theembroideryshop.co.zw </span>
								<span class="text-sm italic"> theembroideryshopzw@gmail.com </span>
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
								<span class="text-sm"> Lillian Enterprises (Pvt) Ltd t/a The Embroidery Shop </span>
								<span class="text-sm"> Stanfield Ratcliffe Building </span>
								<span class="text-sm"> 126 J Moyo St & 13th Ave </span>
								<span class="text-sm"> Bulawayo </span>
							</li>
						</ul>
					</div>
				</div>
				<div class="w-full h-0.5 bg-royal-blue-500" />
			</div>
			<div class="footer">
				<div class="w-full h-0.5 bg-royal-blue-500" />

				<div class="flex justify-between p-1">
					<div>
						<h3 class="text-xl">Banking Details :</h3>
						<ul class="text-xs list-disc list-inside">
							<li>All accounts are to be paid within 7 days from receipt of invoice.</li>
							<li>To be paid by cheque or credit card or direct payment online.</li>
							<li>If account is not paid within 7 days the credits details supplied.</li>
						</ul>
					</div>
					<div class="p-1">
						<h3>Signature</h3>
						<div class="text-4xl italic text-royal-blue-500">AAA</div>
					</div>
				</div>

				<div class="">
					<div class="flex items-center justify-center">
						Thank you very much for doing business with us.
					</div>
					<div class="flex items-end justify-end space-x-3 printButtons">
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-success"
							>Print</button
						>
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-danger"
							>Cancel</button
						>
					</div>
				</div>
			</div>
		</div>
		<div class="page">
			<div class="header">
				<div class="flex justify-between items-center">
					<div>
						<img src={small_logo} alt="logo" class="w-48" />
					</div>
					<div class="p-2">
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
								<span class="text-sm italic"> www.theembroideryshop.co.zw </span>
								<span class="text-sm italic"> theembroideryshopzw@gmail.com </span>
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
								<span class="text-sm"> Lillian Enterprises (Pvt) Ltd t/a The Embroidery Shop </span>
								<span class="text-sm"> Stanfield Ratcliffe Building </span>
								<span class="text-sm"> 126 J Moyo St & 13th Ave </span>
								<span class="text-sm"> Bulawayo </span>
							</li>
						</ul>
					</div>
				</div>
				<div class="w-full h-0.5 bg-royal-blue-500" />
			</div>
			<div class="footer">
				<div class="w-full h-0.5 bg-royal-blue-500" />

				<div class="flex justify-between p-1">
					<div>
						<h3 class="text-xl">Banking Details :</h3>
						<ul class="text-xs list-disc list-inside">
							<li>All accounts are to be paid within 7 days from receipt of invoice.</li>
							<li>To be paid by cheque or credit card or direct payment online.</li>
							<li>If account is not paid within 7 days the credits details supplied.</li>
						</ul>
					</div>
					<div class="p-1">
						<h3>Signature</h3>
						<div class="text-4xl italic text-royal-blue-500">AAA</div>
					</div>
				</div>

				<div class="">
					<div class="flex items-center justify-center">
						Thank you very much for doing business with us.
					</div>
					<div class="flex items-end justify-end space-x-3 printButtons">
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-success"
							>Print</button
						>
						<button
							class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold rounded text-white bg-danger"
							>Cancel</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.page {
		position: relative;
		/* width: 21cm;
		min-height: 29.7cm;
		padding: 1cm;
		margin: 1cm 1cm;
		border: 1px #d3d3d3 solid;
		border-radius: 5px;
		background: white;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); */
		background: white;
		padding: 1cm;
		width: 21cm;
		height: 29.7cm;
		display: block;
		/* margin: 0 auto; */

		/* margin-top: 0.5cm; */
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}

	.footer {
		width: 100%;
		position: absolute;
		bottom: 0px;
		left: 0px;
	}

	@page {
		size: A4;
		margin: 0;
	}

	@media print {
		.page {
			margin: 0;
			border: initial;
			border-radius: initial;
			width: initial;
			min-height: initial;
			box-shadow: initial;
			background: initial;
			page-break-after: always;
		}
	}
</style>
