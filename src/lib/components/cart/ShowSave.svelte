<script lang="ts">
	export let handleSubmit = async (status: string) => {};
</script>

<div class="my-5 mt-10 space-y-2">
	<button on:click|preventDefault={() => handleSubmit('Quotation')} class="btn btn-primary w-full">
		Create Quotation
	</button>
	<button
		on:click|preventDefault={() => handleSubmit('Sales Order')}
		class="btn btn-primary w-full"
	>
		Create Sales Order
	</button>
	<button on:click|preventDefault={() => handleSubmit('Invoice')} class="btn btn-primary w-full">
		Create Invoice
	</button>
</div>

<!-- <div class="mt-2 flex justify-end space-x-2">
	<button on:click|preventDefault={() => (showSaveModal = false)} class="btn btn-primary"
		>Close</button
	>
</div> -->
