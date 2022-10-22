import puppeteer from 'puppeteer';
import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';

export const POST: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		// Create a browser instance
		const browser = await puppeteer.launch({
			headless: true
		});

		// Create a new page
		const page = await browser.newPage();

		//Get HTML content from HTML file

		await page.goto('http://localhost:5173/print/quotation/1', {
			waitUntil: ['domcontentloaded', 'networkidle2', 'load']
		});

		// To reflect CSS used for screens instead of print
		await page.emulateMediaType('screen');

		// Download the PDF
		const pdfBuffer = await page.pdf({
			format: 'A4'
			// printBackground: true,
			// margin: {
			// 	left: '0px',
			// 	top: '0px',
			// 	right: '0px',
			// 	bottom: '0px'
			// }
		});

		await browser.close();

		const pdf = {
			pdf: pdfBuffer.toString('base64')
		};

		return new Response(JSON.stringify(pdf), {
			headers: {
				'Content-Type': 'application/pdf'
			}
		});
	} catch (err: any) {
		console.log('err', err);
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
