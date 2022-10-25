<script lang="ts">
	import { onMount } from 'svelte';
	import logger from '$lib/utility/logger';
	import { Buffer } from 'buffer';
	import { add, dinero, multiply } from 'dinero.js';
	import chunk from 'lodash-es/chunk';
	import type { Prisma } from '@prisma/client';
	import { page } from '$app/stores';
	import { USD } from '@dinero.js/currencies';


	const generatePDF = async () => {
		try {
			const res = await fetch('/api/pdf.json', {
				method: 'POST',
				body: JSON.stringify({
					url: 'http://localhost:5173/print/quotation/',
					currency: 'zar',
					id: 1
				}),
				headers: {
					Accept: 'application/json'
				}
			});

			if (res.ok) {
				const json = await res.json();

				const pdfBuffer = Buffer.from(json.pdf, 'base64');

				const file = new Blob([pdfBuffer], { type: 'application/pdf' });

				const fileURL = URL.createObjectURL(file);

				const pdfWindow = window.open();

				if (pdfWindow) {
					pdfWindow.location.href = fileURL;
				}
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};
</script>

<div>
	<div class="btn btn-primary mt-4">
		<button on:click={generatePDF}> Generate PDF puppetter </button>
	</div>
	<h1 class=" text-2xl text-danger mt-8">Testing Gone Wrong</h1>
</div>

<style>
</style>
