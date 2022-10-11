<script lang="ts">
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import { Buffer } from 'buffer';

	let options: any[];
	let selected: any;

	onMount(() => {
		getOptions();
	});

	const filterOptionsGroup = (group: string) => {
		return options.filter((option: { group: string }) => option.group === group);
	};

	const getOptions = async () => {
		try {
			const res = await fetch('/api/options.json');
			options = await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	// const file = new Blob([response.data], { type: 'application/pdf' })

	//       const fileURL = URL.createObjectURL(file)

	//       const pdfWindow = window.open()
	//       pdfWindow.location.href = fileURL

	const generatePDF = async () => {
		const res = await fetch('/api/pdf.json', {
			method: 'post',
			headers: {
				Accept: 'application/json'
			}
		});

		if (res.ok) {
			const json = await res.json();
			console.log('🚀 ~ file: +page.svelte ~ line 42 ~ generatePDF ~ json', json);

			const pdfBuffer = Buffer.from(json.pdf, 'base64');

			const file = new Blob([pdfBuffer], { type: 'application/pdf' });

			const fileURL = URL.createObjectURL(file);

			const pdfWindow = window.open();

			if (pdfWindow) {
				pdfWindow.location.href = fileURL;
			}
		}
	};
</script>

<div>
	<div>
		{#if options?.length}
			<select bind:value={selected}>
				{#each filterOptionsGroup('embroideryTypes') as item}
					<option value={item}>
						{item.name}
					</option>
				{/each}
			</select>
		{/if}
	</div>
	<div class="btn btn-primary mt-4">
		<button on:click={generatePDF}> Generate PDF </button>
	</div>
	<h1 class=" text-2xl text-danger mt-8">Testing Gone Wrong</h1>
</div>

<style>
</style>
