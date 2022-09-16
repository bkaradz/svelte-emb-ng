import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import { calculateOrder } from '$lib/services/orders';
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
					id: 'asc',
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
					id: 'asc',
				},
			}
			queryTotal = {}
		}

		const orderQuery = await prisma.orders.findMany(query)
		const totalRecords = await prisma.orders.count(queryTotal)

		if (endIndex < totalRecords) {
			next = {
				page: page + 1,
				limit
			};
		}

		const totalPages = Math.ceil(totalRecords / limit);

		return new Response(JSON.stringify({ results: orderQuery, next, totalPages, previous, current, totalRecords, limit }));

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

		const createDBy = locals.user.id;

		const reqOrder = await request.json();

		// check that the pricelist exist
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: reqOrder.pricelistID
			}
		})

		if (!pricelist) {
			return new Response(JSON.stringify({ message: 'Pricelist does not exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}
		// check that the customer exist
		// const customerExist = await ContactsModel.exists({ id: reqOrder.customerID });
		const customerExist = await prisma.contacts.findUnique({
			where: {
				id: reqOrder.customerID
			}
		})

		if (!customerExist) {
			return new Response(JSON.stringify({ message: 'Customer does not exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const calcOrder = await calculateOrder(reqOrder, pricelist);

		const newOrder = new OrdersModel(calcOrder);

		newOrder.createdBy = createDBy;

		await newOrder.save();

		return new Response(JSON.stringify(newOrder));

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

export const PUT: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

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


