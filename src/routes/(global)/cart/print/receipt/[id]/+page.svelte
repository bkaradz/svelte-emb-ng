<script lang="ts">
	import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
	import small_logo from '$lib/assets/small_logo.png';

	async function createPdf() {
		const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg';
		const pngUrl = small_logo;

		// const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
		const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

		const pdfDoc = await PDFDocument.create();

		// const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
		const pngImage = await pdfDoc.embedPng(pngImageBytes);

		// const jpgDims = jpgImage.scale(0.5);
		const pngDims = pngImage.scale(0.5);

		const page = pdfDoc.addPage();

		page.drawImage(pngImage, {
			x: 10,
			y: page.getHeight() - (10 + pngDims.height),
			width: pngDims.width,
			height: pngDims.height
		});

		const pdfBytes = await pdfDoc.save();

		const file = new Blob([pdfBytes], { type: 'application/pdf' });

		const fileURL = URL.createObjectURL(file);

		const pdfWindow = window.open();

		if (pdfWindow) {
			pdfWindow.location.href = fileURL;
		}
	}

	const handlePrint = () => {
		createPdf();
	};
</script>

<div>
	<button class="btn btn-primary" on:click={handlePrint}>Print pdf-lib</button>
</div>
