import { postSuite } from '$lib/validation/server/products.validate';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import logger from '$lib/utility/logger';
import type { RequestHandler } from '@sveltejs/kit';
import ProductsModel, {
	getCurrentProductID,
	incProductID,
	type ProductsDocument
} from '$lib/models/products.models';
import csv from 'csvtojson';

/** @type {import('@sveltejs/kit').RequestHandler}*/
export const POST: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const userId = locals.user._id;

		const data = await request.formData();

		const file: FormDataEntryValue | null = data.get('products');

		if (!(Object.prototype.toString.call(file) === '[object File]')) {
			logger.error('File is empty');
			return {
				status: 400,
				body: {
					message: 'File is empty'
				}
			};
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
				userID: userId,
				...element
			};

			const productFiltered = pickBy(product, identity);

			const result = postSuite(productFiltered);

			if (result.hasErrors()) {
				logger.error(result.getErrors());
				return;
			}

			const newProduct = new ProductsModel(productFiltered);

			newProduct.save();
		});

		return {
			status: 200,
			body: {
				message: 'Product Uploaded'
			}
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
	}
};
