import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import csv from 'csvtojson';
import prisma from '$lib/prisma/client';
import type { Prisma } from '@prisma/client';


export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const createDBy = locals.user.id;

		const data = await request.formData();

		const file = data.get('products');

		if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 400
			});
		}

		const csvString = await file.text();

		const jsonArray = await csv()
			.preFileLine((fileLine, idx) => {
				if (idx === 0) {
					return fileLine.toLowerCase();
				}
				return fileLine;
			})
			.fromString(csvString);


		const allDocsPromises: any[] = []

		jsonArray.forEach(async (element) => {
			/**
			 * TODO: calculate the maximum price of emb logos
			 */

			try {
				const product: Prisma.ProductsCreateInput = {
					productCategories: 'embroidery',
					isActive: true,
					createdBy: createDBy,
					name: element.name,
					stitches: parseInt(element.stitches)
				};

				allDocsPromises.push(product)

			} catch (err: any) {
				logger.error(`Error: ${err.message}`)
				return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
					headers: {
						'content-type': 'application/json; charset=utf-8',
					},
					status: 500
				});
			}
		});

		const productQuery = await prisma.products.createMany({ data: allDocsPromises })

		return new Response(JSON.stringify(productQuery));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`)
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};
