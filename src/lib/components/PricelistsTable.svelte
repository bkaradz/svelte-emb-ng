<script lang="ts">
	import { goto } from '$app/navigation';
	import logger from '$lib/utility/logger';
	import { svgPencil, svgView, svgXSmall } from '$lib/utility/svgLogos';
	import { onMount } from 'svelte';

	export let tableHeadings = ['Name', 'isActive', 'isDefault', 'View', 'Edit', 'Delete'];

	let pricelists = [];

	const heandleDelete = (id: string) => {
		return id;
	};

	const getPricelists = async () => {
		try {
			const res = await fetch('/api/pricelists.json?');
			pricelists = await res.json();
		} catch (err) {
			logger.error(err.message);
		}
	};

	onMount(() => {
		getPricelists();
	});

	const viewPricelist = async (id: string) => {
		await goto(`/settings/pricelists/view/${id}`);
	};

	const editPricelist = async (id: string) => {
		await goto(`/settings/pricelists/edit/${id}`);
	};

	const heandleAddPricelist = async () => {
		await goto(`/settings/pricelists/add`);
	};
</script>

<div class="mb-2 flex items-center justify-between bg-white p-4">
	<h1>Pricelists</h1>
	<div>
		<button on:click={heandleAddPricelist} class="btn btn-primary rounded-full py-1 px-3"
			>Add Pricelists</button
		>
	</div>
</div>
{#if pricelists.length}
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
					{#each pricelists as list (list._id)}
						<tr
							class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent"
									type="text"
									name="name"
									disabled
									bind:value={list.name}
								/>
							</td>

							<td class="px-2 py-1 text-center">
								<input disabled bind:checked={list.isActive} type="checkbox" name="isActive" />
							</td>
							<td class="px-2 py-1 text-center">
								<input disabled bind:checked={list.isDefault} type="checkbox" name="isDefault" />
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => viewPricelist(list._id)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html svgView}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => editPricelist(list._id)}>
									<span class="fill-current text-pickled-bluewood-500">
										{@html svgPencil}
									</span>
								</button>
							</td>
							<td class="p-1 text-center ">
								<button class=" m-0 p-0" on:click={() => heandleDelete(list._id)}>
									<span class="fill-current text-pickled-bluewood-500">{@html svgXSmall}</span>
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
