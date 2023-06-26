import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { fail, type Actions, error, redirect } from '@sveltejs/kit';
import logger from '$lib/utility/logger';
import type { Prisma, Products } from '@prisma/client';
import parseCsv from '$lib/utility/parseCsv';
import prisma from '$lib/prisma/client';

export const load = (async (event) => {
	const productCategories = async () => {
		return await router
			.createCaller(await createContext(event))
			.options.getOptions({ group: 'productCategories' });
	};

	return {
		productCategories: productCategories()
	};
}) satisfies PageServerLoad;


export const actions: Actions = {
	upload: async ({ request, locals }) => {

		const { user } = await locals.auth.validateUser()

		if (!user) {
			throw redirect(303, "/auth/login")
		}

		const createDBy = user.userId;

		const data = await request.formData()
		const file = data.get('products')

		if (!(file instanceof File)) {
			logger.error('File is empty');
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = await file.text();

		const productsArray = (await parseCsv(csvString)) as Products[];

		productsArray.forEach(async (element) => {
			try {
				const product: Prisma.ProductsCreateManyInput = {
					productCategories: 'embroidery',
					isActive: true,
					createdBy: createDBy,
					name: element.name,
					stitches: +element?.stitches
				};

				if (!product) {
					throw error(404,"Product empty");
				}

				await prisma.products.upsert({
					where: {
						name: element.name
					},
					update: product,
					create: product,
				})

			} catch (err: any) {
				logger.error(`Error: ${err}`);
				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}
		});

		return { success: true }
	}
};