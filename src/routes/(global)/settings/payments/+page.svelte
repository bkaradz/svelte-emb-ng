<script lang="ts">
	import { enhance } from '$app/forms';
	import PaymentsTypeTable from '$lib/components/PaymentsTypeTable.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import logger from '$lib/utility/logger';
	import { svgPlus, svgUpload } from '$lib/utility/svgLogos';

</script>

<svelte:head>
	<title>Settings: Options</title>
</svelte:head>

<div class="">
	<div class="mb-2 bg-white p-4 flex justify-between items-center">
		<h1>Payment Types</h1>
		<div class="flex items-center">
			<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance>
				<div class="relative">
					<button class="absolute border border-royal-blue-500 bg-royal-blue-500 p-1 text-white"
						>{@html svgUpload}</button
					>
					<input
						class="w-72 border border-pickled-bluewood-300 bg-pickled-bluewood-100 text-pickled-bluewood-500 ring-royal-blue-500 file:w-10 file:p-0 file:opacity-0"
						type="file"
						name="options"
						id="uploadCSV"
						accept=".csv, .CSV"
					/>
					<button
						class="absolute right-0 border border-royal-blue-500 bg-royal-blue-500 p-1 text-white"
						type="submit">{@html svgPlus}</button
					>
				</div>
			</form>
		</div>
	</div>
	<PaymentsTypeTable />
</div>

<style lang="postcss">
</style>
