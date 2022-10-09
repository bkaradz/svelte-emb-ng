import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';


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

		const pagination = getPagination(queryParams)

		const finalQuery = omit(queryParams, ['page', 'limit', 'sort']);

		const objectKeys = Object.keys(finalQuery)[0];

		let query: any
		let queryTotal: any

		if (objectKeys) {
			query = {
				take: pagination.limit,
				skip: pagination.page - 1,
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
				take: pagination.limit,
				skip: pagination.page - 1,
				orderBy: {
					name: 'asc',
				},
			}
			queryTotal = {}
		}

		const productsQuery = await prisma.products.findMany(query)

		pagination.totalRecords = await prisma.products.count(queryTotal)

		if (pagination.endIndex < pagination.totalRecords) {
			pagination.next = {
				page: pagination.page + 1,
				limit: pagination.limit
			};
		}

		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		return new Response(JSON.stringify({ results: productsQuery, ...pagination }));

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


