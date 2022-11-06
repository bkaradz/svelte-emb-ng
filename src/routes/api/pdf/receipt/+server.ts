import puppeteer from 'puppeteer';
import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';
import config from 'config';

const input = {
	username: config.get<string>('printerEmail'),
	password: config.get<string>('printerPassword')
};

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

		const reqPdf = await request.json();

		// Create a browser instance
		const browser = await puppeteer.launch({
			headless: true
		});

		// Create a new page
		const page1 = await browser.newPage();

		await page1.goto('http://localhost:5173/', {
			waitUntil: ['domcontentloaded', 'networkidle0']
		});

		// Login
		await page1.type('#email', input.username);
		await page1.type('#password', input.password);
		await page1.click('#submit');
		await page1.waitForNavigation();

		// Get cookies
		const cookies = await page1.cookies();

		// Use cookies in another tab or browser
		const page = await browser.newPage();
		await page.setCookie(...cookies);

		//Get HTML content from HTML file
		await page.goto(`${reqPdf.url}${reqPdf.currency}/${reqPdf.id}`, {
			waitUntil: ['domcontentloaded', 'networkidle0']
		});

		// To reflect CSS used for screens instead of print
		await page.emulateMediaType('screen');

		const PAGE_WIDTH = 8


		const dimensions = await page.evaluate(() => {
			return {
				// width: document.getElementById('receipt').offsetWidth,
				height: document.getElementById('receipt').offsetHeight,
			};
		});

		if (!dimensions.height) {
			throw new Error("The page does not have a height");
		}

		const pdfBuffer = await page.pdf({
			// width: '8cm',
			width: `${PAGE_WIDTH}cm`,
			height: `${dimensions.height * 2.7 / 100}cm`,
			pageRanges: '1',
			printBackground: true,
			preferCSSPageSize: false,
			// scale: 2,
			margin: {
				top: '0px',
				right: '0px',
				bottom: '0px',
				left: '0px'
			}
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
	} catch (err) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
