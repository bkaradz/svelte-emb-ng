<script lang="ts">
	import { toasts } from '$lib/stores/toasts.store';
	import { goto } from '$app/navigation';
	import { svgTrash, svgView } from '$lib/utility/svgLogos';
	import type { Pricelists } from '@prisma/client';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	export let tableHeadings = ['Id #', 'Name', 'Date', 'isActive', 'isDefault', 'View', 'Delete'];

	let pricelists: Pricelists[] = [];

	const handleDelete = async (list: Pricelists) => {
		if (list.isDefault) {
			toasts.add({
				message: 'You can now delete the default Pricelists',
				type: 'error'
			});
			return;
		}
		try {
			await trpc().pricelists.deleteById.mutate(list.id);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			getPricelists();
			toasts.add({ message: `Pricelist was deleted successfully`, type: 'success' });
		}
	};

	const getPricelists = async () => {
		try {
			pricelists = (await trpc().pricelists.getPricelists.query({})) as unknown as Pricelists[];
		} catch (err: any) {
			handleErrors(err);
		}
	};

	onMount(() => {
		getPricelists();
	});

	const viewPricelist = async (id: number) => {
		goto(`/settings/pricelists/view/${id}`);
	};

	const editPricelist = async (id: number) => {
		goto(`/settings/pricelists/edit/${id}`);
	};

	const handleAddPricelist = async () => {
		goto(`/settings/pricelists/add`);
	};
</script>

<div class="mb-2 flex items-center justify-between bg-white p-4">
	<h1>Pricelists</h1>
	<div>
		<button on:click={handleAddPricelist} class="btn btn-primary rounded-full py-1 px-3"
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
							<th class="px-2 py-2 text-left">{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="overflow-y-scroll">
					{#each pricelists as list (list.id)}
						<tr
							class="text-left whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal odd:bg-pickled-bluewood-100 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
						>
							<td class="px-2 py-1 text-left">
								<input
									class="m-0 border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent text-left"
									type="text"
									name="id"
									disabled
									bind:value={list.id}
								/>
							</td>

							<td class="px-2 py-1">
								<input
									class="m-0 w-full border-none bg-transparent p-0 text-sm focus:border-transparent focus:ring-transparent text-left"
									type="text"
									name="name"
									disabled
									bind:value={list.name}
								/>
							</td>

							<td class="px-2 py-1 text-left">
								{dayjs(list.createdAt).format('DD-MM-YYYY')}
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
