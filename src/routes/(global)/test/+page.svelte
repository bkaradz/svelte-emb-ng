<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	let testText = '';

	let showModal = false;
</script>

<div>
	<button class="btn btn-primary" on:click={() => (showModal = true)}> show modal </button>

	{#if showModal}
		<Modal on:close={() => (showModal = false)}>
			<h2 slot="header">
				Test Input
				<small><em>adjective</em> mod·al \ˈmō-dəl\</small>
			</h2>

			<input class="input my-4" type="text" bind:value={testText} />

			<div slot="footer" class="mt-2 flex justify-end space-x-2">
				<button class="btn btn-primary">Submit</button>
				<button on:click|preventDefault={() => (showModal = false)} class="btn btn-primary"
					>Close</button
				>
			</div>
		</Modal>
	{/if}
</div>
