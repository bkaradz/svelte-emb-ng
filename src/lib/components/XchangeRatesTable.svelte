<script lang="ts">
	import { goto } from '$app/navigation';
	import logger from '$lib/utility/logger';
	import { svgPencil, svgTrash, svgView } from '$lib/utility/svgLogos';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	export let tableHeadings = ['#', 'Date', 'isActive', 'isDefault', 'View', 'Edit', 'Delete'];

	let rates: any[] = [];

	const heandleDelete = (id: string) => {
		return id;
	};

	const getRates = async () => {
		try {
			const res = await fetch('/api/xRates.json?');
			rates = await res.json();
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};

	onMount(() => {
		getRates();
	});

	const viewPricelist = async (id: string) => {
		goto(`/settings/rates/view/${id}`);
	};

	const editPricelist = async (id: string) => {
		goto(`/settings/rates/edit/${id}`);
	};

	const heandleAddPricelist = async () => {
		goto(`/settings/rates/add`);
	};
</script>

<div class="mb-2 flex items-center justify-between bg-white p-4">
	<h1>rates</h1>
	<div>
		<button on:click={heandleAddPricelist} class="btn btn-primary rounded-full py-1 px-3"
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
								<button class=" m-0 p-0" on:click={() => editPricelist(list.id)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => heandleDelete(list.id)}>
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
