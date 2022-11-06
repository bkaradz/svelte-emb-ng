<script lang="ts">
	import logger from '$lib/utility/logger';
	import { Buffer } from 'buffer';

	const generatePDF = async () => {
		try {
			const res = await fetch('/api/pdf/quotation', {
				method: 'POST',
				body: JSON.stringify({
					url: 'http://localhost:5173/pdf/quotation/',
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

	const generateRecieptPDF = async () => {
		try {
			const res = await fetch('/api/pdf/receipt', {
				method: 'POST',
				body: JSON.stringify({
					url: 'http://localhost:5173/pdf/receipt/',
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

<svelte:head>
	<title>Reports</title>
</svelte:head>

<div>
	<div class="btn btn-primary mt-4">
		<button on:click={generatePDF}> Generate Quotation PDF puppetter </button>
	</div>
	<div class="btn btn-primary mt-4">
		<button on:click={generateRecieptPDF}> Generate Receipt PDF puppetter </button>
	</div>
	<h1 class=" text-2xl text-danger mt-8">Testing Gone Wrong</h1>
</div>

<style>
</style>
