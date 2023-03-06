<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { goto } from '$app/navigation';
	import { svgTrash, svgView } from '$lib/utility/svgLogos';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import type { ExchangeRate } from '@prisma/client';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	export let tableHeadings = ['#', 'Date', 'isActive', 'isDefault', 'View', 'Delete'];

	let rates: ExchangeRate[] = [];

	const handleDelete = async (list: ExchangeRate) => {
		if (list.isDefault) {
			toasts.add({
				message: 'You can now delete the default Eexchange Rates',
				type: 'error'
			});
			return;
		}
		try {
			await trpc().exchangeRate.deleteById.mutate(list.id);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getRates(defaultQueryParams);
			toasts.add({ message: `Eexchange Rate was deleted`, type: 'success' });
		}
	};

	let defaultQueryParams = {};

	const getRates = async (paramsObj: any) => {
		try {
			const resRates = await trpc().exchangeRate.getExchangeRates.query(paramsObj);
			if (resRates) {
				rates = resRates;
			}
		} catch (err: any) {
			handleErrors(err);
		}
	};

	onMount(() => getRates(defaultQueryParams));

	const viewPricelist = async (id: number) => {
		goto(`/settings/rates/view/${id}`);
	};

	const handleAddPricelist = async () => {
		goto(`/settings/rates/add`);
	};
</script>

<div class="mb-2 flex items-center justify-between bg-white p-4">
	<h1>Eexchange Rates</h1>
	<div>
		<button on:click={handleAddPricelist} class="btn btn-primary rounded-full py-1 px-3"
			>Add Rates</button
		>
	</div>
</div>
{#if rates.length}
	<!-- Table start -->
	<div class="w-full bg-white p-2 shadow-lg">
		<div class=" block ">
			<table class="relative w-full rounded-lg text-left text-sm">
				<thead>
					<tr
						class=" sticky border border-b-0 border-pickled-bluewood-700 bg-pickled-bluewood-700 text-white"
					>
						{#each tableHeadings as header (header)}
							<th class="px-2 py-2 text-center">{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="overflow-y-scroll">
					{#each rates as list (list.id)}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1 ">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent text-center"
									type="text"
									name="id"
									disabled
									bind:value={list.id}
								/>
							</td>
							<td class="px-2 py-1 text-center">
								{dayjs(list.xChangeRateDate).format('DD-MM-YYYY')}
							</td>

							<td class="px-2 py-1 text-center">
								<input disabled bind:checked={list.isActive} type="checkbox" name="isActive" />
							</td>
							<td class="px-2 py-1 text-center">
								<input disabled bind:checked={list.isDefault} type="checkbox" name="isDefault" />
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => viewPricelist(list.id)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html svgView}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => handleDelete(list)}>
									<span class="fill-current text-pickled-bluewood-500">{@html svgTrash}</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<!-- Table End -->
{/if}

<style>
</style>
