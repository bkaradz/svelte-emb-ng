import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import { calculateOrder } from '$lib/services/orders';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import pick from 'lodash-es/pick';
import { getPagination } from '$lib/utility/pagination.util';
import type { Prisma } from '@prisma/client';

const getQueryOptions = (objectKeys, finalQuery) => {
	if (objectKeys === 'isCorporate' || objectKeys === 'isActive' || objectKeys === 'isUser') {
		return {
			equals: finalQuery[objectKeys] === 'true'
		};
	}

	if (objectKeys === 'id' || objectKeys === 'customersID' || objectKeys === 'pricelistsID') {
		return parseInt(finalQuery[objectKeys]);
	}

	return {
		contains: finalQuery[objectKeys],
		mode: 'insensitive'
	};
};

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const queryParams = Object.fromEntries(url.searchParams);

		const pagination = getPagination(queryParams);

		const finalQuery = omit(queryParams, ['page', 'limit', 'sort']);

		const objectKeys = Object.keys(finalQuery)[0];

		let query: any;
		let queryTotal: any;

		const baseQuery = {
			take: pagination.limit,
			skip: (pagination.page - 1) * pagination.limit,
			include: {
				customerContact: {
					include: {
						address: true
					}
				},
				Pricelists: true,
				OrderLine: {
					include: {
						Products: true
					}
				}
			},
			orderBy: {
				id: 'asc'
			}
		};

		if (objectKeys) {
			query = {
				...baseQuery,
				where: {
					isActive: true,
					[objectKeys]: getQueryOptions(objectKeys, finalQuery)
				}
			};
			queryTotal = {
				where: {
					isActive: true,
					[objectKeys]: getQueryOptions(objectKeys, finalQuery)
				}
			};
		} else {
			query = {
				where: {
					isActive: true,
				},
				...baseQuery
			};
			queryTotal = {
				where: {
					isActive: true,
				},
			};
		}

		const orderQuery = await prisma.orders.findMany(query);

		pagination.totalRecords = await prisma.orders.count(queryTotal);
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = null;
		}

		const results = { results: orderQuery, ...pagination };

		return new Response(JSON.stringify(results));
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

		const createDBy = parseInt(locals.user.id);

		const reqOrder = await request.json();

		// check that the pricelist exist
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: parseInt(reqOrder.pricelistsID)
			}
		});

		if (!pricelist) {
			return new Response(JSON.stringify({ message: 'Pricelist does not exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
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
		});

		if (!customerExist) {
			return new Response(JSON.stringify({ message: 'Customer does not exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		let calcOrder = await calculateOrder(reqOrder);

		calcOrder = calcOrder.map((item) =>
			pick(item, [
				'productsID',
				'unitPrice',
				'quantity',
				'total',
				'productCategories',
				'embroideryPositions',
				'embroideryTypes'
			])
		);

		delete reqOrder.orderLine;

		if (reqOrder?.orderDate) {
			reqOrder.orderDate = new Date(reqOrder.orderDate);
		}

		if (reqOrder?.deliveryDate) {
			reqOrder.deliveryDate = new Date(reqOrder.deliveryDate);
		}

		const orderQuery = await prisma.orders.create({
			data: {
				...reqOrder,
				createdBy: createDBy,
				OrderLine: {
					createMany: { data: calcOrder }
				}
			}
		});

		return new Response(JSON.stringify(orderQuery));
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

export const PUT: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		return new Response(JSON.stringify({ message: 'Success' }));
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
