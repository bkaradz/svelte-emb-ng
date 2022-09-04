import { json as json$1 } from '@sveltejs/kit';
import { postSuite } from '$lib/validation/server/products.validate';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import ProductsModel, {
	getCurrentProductID,
	incProductID,
	type ProductsDocument
} from '$lib/models/products.models';
import csv from 'csvtojson';


export const POST: RequestHandler = async ({
	request,
	locals
}) => {
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

		const file: FormDataEntryValue | null = data.get('products');

		if (!(Object.prototype.toString.call(file) === '[object File]')) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 400
			});
		}
		// @ts-expect-error: the above if statement catches the error if file is null
		const csvString = await file.text();

		const jsonArray = await csv()
			.preFileLine((fileLine, idx) => {
				if (idx === 0) {
					return fileLine.toLowerCase();
				}
				return fileLine;
			})
			.fromString(csvString);

		// get initial productID and increment using incProductID function
		let productID = await getCurrentProductID();

		jsonArray.forEach(async (element) => {
			// increment productID and save in ProductID
			productID = incProductID(productID);
			const product: Partial<ProductsDocument> = {
				productCategories: 'embroidery',
				isActive: true,
				productID,
				createdBy: createDBy,
				...element
			};

			const productFiltered = pickBy(product, identity);

			const result = postSuite(productFiltered);

			if (result.hasErrors()) {
				logger.error(result.getErrors());
				return new Response(JSON.stringify({ message: result.getErrors() }), {
					headers: {
						'content-type': 'application/json; charset=utf-8',
					},
					status: 400
				});
			}

			const newProduct = new ProductsModel(productFiltered);

			newProduct.save();
		});

		return new Response(JSON.stringify({ message: 'Product Uploaded' }));

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
