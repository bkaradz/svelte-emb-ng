import { launch } from 'puppeteer';
import { promises as fs } from "fs";
import type { RequestHandler } from './$types'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import logger from '$lib/utility/logger';



// export async function getImage() {
//   return await fs.readFile("./logo.png");
// }

import eta from "eta"

// Set Eta's configuration
eta.configure({
  // This tells Eta to look for templates
  // In the /views directory
  views: path.join(__dirname, "../../../lib/views/")
})

// Eta assumes the .eta extension if you don't specify an extension
// You could also write renderFile("template.eta"), renderFile(path.join(__dirname, "views/template.eta"),
// renderFile("/template"), etc.


/*
My favorite food is cake
<footer>This is a footer!</footer>
*/

// const getHtml = () => {
//     return resultsEta
// }


export const POST: RequestHandler = async ({ locals, request }) => {
    console.log("__dirname", __dirname);
    console.log("__filename", __filename);
    // console.log("🚀 ~ file: +server.ts ~ line 17 ~ constPOST:RequestHandler= ~ request", request)    
    try {
        if (!locals?.user?.id) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), {
                headers: {
                    'content-type': 'application/json; charset=utf-8',
                },
                status: 401
            });
        }

        const redPrint = await request.json()
        console.log("🚀 ~ file: +server.ts ~ line 55 ~ constPOST:RequestHandler= ~ redPrint", redPrint)

        const resultsEta = await eta.renderFile("./template", {redPrint: JSON.stringify(redPrint)})

        const browser = await launch({
            headless: true
        });

        const page = await browser.newPage();
        // await page.goto('http://localhost:5173/cart/print/quotation', { waitUntil: 'networkidle0' })
        const html = `${resultsEta}`;
        await page.setContent(html, {
            waitUntil: 'domcontentloaded'
        });

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