import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';


export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const queryParams = Object.fromEntries(url.searchParams);

		const limit = isNaN(+queryParams?.limit) ? 15 : +queryParams?.limit;
		const page = isNaN(+queryParams?.page) ? 1 : +queryParams?.page;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		let previous = null;
		let next = null;
		const current = {
			page: page,
			limit
		};

		if (startIndex > 0) {
			previous = {
				page: page - 1,
				limit
			};
		}

		const finalQuery = omit(queryParams, ['page', 'limit', 'sort']);

		const objectKeys = Object.keys(finalQuery)[0];

		let query: any
		let queryTotal: any

		if (objectKeys) {
			query = {
				take: limit,
				skip: page - 1,
				where: {
					[objectKeys]: {
						contains: finalQuery[objectKeys],
						mode: 'insensitive'
					},
				},
				orderBy: {
					name: 'asc',
				},
			}
			queryTotal = {
				where: {
					[objectKeys]: {
						contains: finalQuery[objectKeys],
						mode: 'insensitive'
					},
				},
			}
		} else {
			query = {
				take: limit,
				skip: page - 1,
				orderBy: {
					name: 'asc',
				},
			}
			queryTotal = {}
		}

		const productsQuery = await prisma.products.findMany(query)

		const totalRecords = await prisma.products.count()

		if (endIndex < totalRecords) {
			next = {
				page: page + 1,
				limit
			};
		}

		const totalPages = Math.ceil(totalRecords / limit);

		return new Response(JSON.stringify({ results: productsQuery, next, totalPages, previous, current, totalRecords, limit }));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};

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

		const createDBy = parseInt(locals.user.id);

		const reqProduct = await request.json();

		const newProduct = await prisma.products.create({
			data: {
				...reqProduct,
				createdBy: createDBy,
			}
		});

		return new Response(JSON.stringify(newProduct));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const reqProduct = await request.json();

		const updateProduct = await prisma.products.update({
			where: {
				id: parseInt(reqProduct.id)
			},
			data: {
				...reqProduct
			}
		})

		return new Response(JSON.stringify({ message: 'Success' }));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};


