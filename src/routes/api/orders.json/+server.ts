import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import { calculateOrder } from '$lib/services/orders';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import pick from 'lodash-es/pick';


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

		const commonQuery = {
			take: limit,
			skip: page - 1,
			include: {
				customerContact: true,
				Pricelists: true,
				OrderLine: true,
			},
			orderBy: {
				id: 'asc',
			},
		}

		if (objectKeys) {
			query = {
				...commonQuery,
				where: {
					[objectKeys]: {
						contains: finalQuery[objectKeys],
						mode: 'insensitive'
					},
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
				...commonQuery
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

		const createDBy = parseInt(locals.user.id);

		const reqOrder = await request.json();

		// check that the pricelist exist
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: parseInt(reqOrder.pricelistsID)
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
				id: parseInt(reqOrder.customersID)
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

		let calcOrder = await calculateOrder(reqOrder);

		calcOrder = calcOrder.map((item) => pick(item, ['productsID', 'unitPrice', 'quantity', 'total', 'productCategories', 'embroideryPositions', 'embroideryTypes']));

		delete reqOrder.orderLine

		if (reqOrder?.orderDate) {
			reqOrder.orderDate = new Date(reqOrder.orderDate)
		}

		if (reqOrder?.deliveryDate) {
			reqOrder.deliveryDate = new Date(reqOrder.deliveryDate)
		}

		const orderQuery = await prisma.orders.create({
			data: {
				...reqOrder,
				createdBy: createDBy,
				OrderLine: {
					createMany: { data: calcOrder }
				}
			}
		})

		return new Response(JSON.stringify(orderQuery));

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


