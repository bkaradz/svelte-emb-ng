import { launch } from 'puppeteer';
import { promises as fs } from "fs";
import type { RequestHandler } from './$types'

// export async function getImage() {
//   return await fs.readFile("./logo.png");
// }

const getHtml = () => {
    return `                    `
}


export const POST: RequestHandler = async ({ locals, request }) => {
    try {

        if (!locals?.user?.id) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                headers: {
                    'content-type': 'application/json; charset=utf-8',
                },
                status: 401
            });
        }

        const browser = await launch({
            headless: true
        });

        const page = await browser.newPage();
        await page.goto('http://localhost:5173/cart/print/quotation', { waitUntil: 'networkidle0' })
        // const html = `${getHtml()}`;
        // await page.setContent(html, {
        //     waitUntil: 'domcontentloaded'
        // });

        const pdfBuffer = await page.pdf({
            format: 'A4'
        });

        await browser.close();

        const pdf = {
            pdf: pdfBuffer.toString('base64'),
        }

        // return {
        //   headers: {
        //     'Content-Type': 'application/pdf'
        //   },
        //   status: 200,
        //   body: pdfBuffer
        // };

        return new Response(JSON.stringify(pdf), {
            headers: {
                'Content-Type': 'application/pdf'
            },
        });

    } catch (err: any) {
        logger.error(`Error: ${err.message}`)
        return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
            headers: {
                'content-type': 'application/json; charset=utf-8',
            },
            status: 500
        });
    }
}