import { launch } from 'puppeteer';
import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		// const redPrint = await request.json();

		const browser = await launch({
			headless: true
		});

		const page = await browser.newPage();
		await page.goto('http://localhost:5173/print/quotation/1', { waitUntil: 'networkidle2' });

		const pdfBuffer = await page.pdf({
			format: 'A4'
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
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
