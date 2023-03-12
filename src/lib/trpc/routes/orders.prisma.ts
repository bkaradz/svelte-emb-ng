import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Prisma } from '@prisma/client';
import omit from 'lodash-es/omit';
import pick from 'lodash-es/pick';
import type { Context } from '../context';
import { calculateOrder } from '$lib/services/orders';
import type { SaveOrder } from '$lib/validation/saveOrder.validate';

export const getOrdersPrisma = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0];

	let query: Prisma.OrdersFindManyArgs;
	let queryTotal;

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
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				isActive: true,
				[objectKeys]: getOrdersQueryOptions(objectKeys, finalQuery)
			},
			orderBy: {
				id: 'asc'
			}
		};
		queryTotal = {
			where: {
				isActive: true,
				[objectKeys]: getOrdersQueryOptions(objectKeys, finalQuery)
			}
		};
	} else {
		query = {
			...baseQuery,
			where: {
				isActive: true
			},
			orderBy: {
				id: 'asc'
			}
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const orderQuery = await prisma.orders.findMany(query);

	pagination.totalRecords = await prisma.orders.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: orderQuery, ...pagination };
};

export type GetOrders = typeof getOrdersPrisma;

export const getOrderLinePrisma = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0];

	let query: Prisma.OrderLineFindManyArgs;
	let queryTotal;

	const baseQuery = {
		take: pagination.limit,
		skip: (pagination.page - 1) * pagination.limit,
		include: {
			Orders: {
				include: {
					customerContact: true
				}
			}
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				[objectKeys]: getOrderLineQueryOptions(objectKeys, finalQuery)
			},
			orderBy: {
				id: 'asc'
			}
		};
		queryTotal = {
			where: {
				[objectKeys]: getOrderLineQueryOptions(objectKeys, finalQuery)
			}
		};
	} else {
		query = {
			...baseQuery,
			orderBy: {
				id: 'asc'
			}
		};
		queryTotal = {
			where: {}
		};
	}

	const productsQuery = await prisma.orderLine.findMany(query);

	pagination.totalRecords = await prisma.orderLine.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: productsQuery, ...pagination };
};

export type GetOrderLine = typeof getOrderLinePrisma;

export const getByIdPrisma = async (input: number) => {
	const product = await prisma.orders.findUnique({
		where: {
			id: input
		},
		include: {
			customerContact: true,
			Pricelists: true,
			OrderLine: {
				include: {
					Products: true
				}
			}
		}
	});

	return product;
};

export type GetById = typeof getByIdPrisma;

export const deleteByIdPrisma = async (input: number) => {
	const order = await prisma.orders.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return order;
};

export type DeleteById = typeof deleteByIdPrisma;

export const updateStatusPrisma = async (
	input: { id: number; accountsStatus: string; isInvoiced?: boolean },
	ctx: Context
) => {
	if (!ctx.userId) {
		throw new Error('Unauthorised');
	}

	const createdBy = ctx.userId;

	const order = await prisma.orders.update({
		where: {
			id: input.id
		},
		data: {
			...input,
			createdBy
		}
	});
	return order;
};

export type UpdateStatus = typeof updateStatusPrisma;

export const saveOrderOrUpdatePrisma = async (input: SaveOrder, ctx: Context) => {
	if (!ctx.userId) {
		throw new Error('Unauthorised');
	}

	const createdBy = ctx.userId;

	// check that the pricelist exist
	const pricelist = await prisma.pricelists.findUnique({
		where: {
			id: input.pricelistsID
		}
	});

	if (!pricelist) {
		throw new Error('Pricelist does not exist');
	}

	// check that the customer exist
	const customerExist = await prisma.contacts.findUnique({
		where: {
			id: input.customersID
		}
	});

	if (!customerExist) {
		throw new Error('Customer does not exist');
	}

	let calcOrder = await calculateOrder(input);

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

	const { OrderLine, ...restOrder } = input;

	if (restOrder?.orderDate) {
		restOrder.orderDate = new Date(restOrder.orderDate) as unknown as string;
	}

	if (restOrder?.deliveryDate) {
		restOrder.deliveryDate = new Date(restOrder.deliveryDate) as unknown as string;
	}

	// const test: Prisma.OrderLineCreateManyOrdersInput

	if (restOrder.id) {
		delete restOrder.customerContact;
		delete restOrder.Pricelists;
		return await prisma.orders.update({
			where: {
				id: restOrder.id
			},
			data: {
				...restOrder,
				createdBy,
				OrderLine: {
					updateMany: { data: calcOrder }
				}
			}
		});
	} else {
		return await prisma.orders.create({
			data: {
				...restOrder,
				createdBy,
				OrderLine: {
					createMany: { data: calcOrder }
				}
			}
		});
	}
};

export type SaveOrderOrUpdate = typeof saveOrderOrUpdatePrisma;

const getOrdersQueryOptions = (objectKeys: string, finalQuery: any) => {
	if (
		objectKeys === 'isCorporate' ||
		objectKeys === 'isActive' ||
		objectKeys === 'isUser' ||
		objectKeys === 'isInvoiced'
	) {
		return {
			equals: getBoolean(finalQuery[objectKeys])
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

const getOrderLineQueryOptions = (objectKeys: string, finalQuery: any) => {
	if (objectKeys === 'id' || objectKeys === 'ordersID' || objectKeys === 'productsID') {
		return parseInt(finalQuery[objectKeys]);
	}

	return {
		contains: finalQuery[objectKeys],
		mode: 'insensitive'
	};
};
