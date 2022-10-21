<script lang="ts">
	import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
	import small_logo from '$lib/assets/small_logo.png';

	async function createPdf() {
		const pngUrl = small_logo;

		const svgWorld =
			'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9';
		const svgLocation =
			'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z';
		const svgPath = 'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90';

		const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

		const pdfDoc = await PDFDocument.create();

		const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

		const pngImage = await pdfDoc.embedPng(pngImageBytes);

		const pngDims = pngImage.scale(0.5);

		const page = pdfDoc.addPage();

		page.drawImage(pngImage, {
			x: 20,
			y: page.getHeight() - (20 + pngDims.height),
			width: pngDims.width,
			height: pngDims.height
		});

		page.drawLine({
			start: { x: 0, y: page.getHeight() - (30 + pngDims.height) },
			end: { x: page.getWidth(), y: page.getHeight() - (30 + pngDims.height) },
			thickness: 1.5,
			color: rgb(79 / 255, 114 / 255, 224 / 255),
			opacity: 1
		});

		page.drawLine({
			start: { x: pngDims.width + 30, y: page.getHeight() - (30 + pngDims.height) + 10 },
			end: { x: pngDims.width + 30, y: page.getHeight() - 10 },
			thickness: 1.5,
			color: rgb(198 / 255, 213 / 255, 247 / 255),
			opacity: 1
		});

		page.moveTo(100, page.getHeight() - 5);

		page.moveDown(25);
		page.drawSvgPath(svgPath);

		page.setFont(helveticaFont);

		page.moveTo(5, 200);
		page.drawText('The Life of an Egg', { size: 36 });

		page.moveDown(36);
		page.drawText('An Epic Tale of Woe', { size: 30 });

		page.drawText(
			`Humpty Dumpty sat on a wall \n` +
				`Humpty Dumpty had a great fall; \n` +
				`All the king's horses and all the king's men \n` +
				`Couldn't put Humpty together again. \n`,
			{
				x: 25,
				y: 100,
				font: timesRomanFont,
				size: 24,
				color: rgb(1, 0, 0),
				lineHeight: 24,
				opacity: 0.75
			}
		);

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
