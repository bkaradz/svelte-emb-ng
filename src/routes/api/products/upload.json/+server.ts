import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import parseCsv from '$lib/utility/parseCsv';
import type { Prisma, Products } from '@prisma/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createDBy = locals.user.id;

		const data = await request.formData();

		const file = data.get('products');

		if (!(file instanceof File)) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const csvString = await file.text();

		const productsArray = (await parseCsv(csvString)) as Products[];

		const allDocsPromises: Prisma.ProductsCreateManyInput[] = [];

		productsArray.forEach(async (element) => {
			try {
				const product: Prisma.ProductsCreateManyInput = {
					productCategories: 'embroidery',
					isActive: true,
					createdBy: createDBy,
					name: element.name,
					stitches: element?.stitches
				};

				if (!product) {
					return;
				}

				allDocsPromises.push(product);
			} catch (err: any) {
				logger.error(`Error: ${err}`);
				return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
					headers: {
						'content-type': 'application/json; charset=utf-8'
					},
					status: 500
				});
			}
		});

		const productQuery = await prisma.products.createMany({ data: allDocsPromises });

		return new Response(JSON.stringify(productQuery));
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
