import prisma from '$lib/prisma/client';
import type {Enumerable, OrderLineUpdateManyWithWhereWithoutOrdersInput} from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Prisma } from '@prisma/client';
import omit from 'lodash-es/omit';
import pick from 'lodash-es/pick';
import type { Context } from '../context';
import { calculateOrder } from '$lib/services/orders';
import type { SaveOrder } from '$lib/validation/saveOrder.validate';
import { currencyOptions, type CurrencyType } from '$lib/stores/setCurrency.store';
import { dinero } from 'dinero.js';

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

	const orderQuery = await prisma.orders.findMany({
		...query,
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
	});

	pagination.totalRecords = await prisma.orders.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: orderQuery, ...pagination };
};

export type GetOrders = typeof getOrdersPrisma;
export type GetOrdersReturn = Prisma.PromiseReturnType<typeof getOrdersPrisma>;

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

	const ordersQuery = await prisma.orderLine.findMany({
		...query,
		include: {
			Orders: {
				include: {
					customerContact: true
				}
			}
		}
	});

	pagination.totalRecords = await prisma.orderLine.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: ordersQuery, ...pagination };
};

export type GetOrderLine = typeof getOrderLinePrisma;
export type GetOrderLineReturn = Prisma.PromiseReturnType<typeof getOrderLinePrisma>;

export const getByIdPrisma = async (input: number) => {
	const order = await prisma.orders.findUnique({
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

	if (!order) {
		throw new Error('Order not found');
	}

	return order;
};

export type GetById = typeof getByIdPrisma;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getByIdPrisma>;

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
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteByIdPrisma>;

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
export type UpdateStatusReturn = Prisma.PromiseReturnType<typeof updateStatusPrisma>;

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

	const calcOrder = await calculateOrder(input);

	const calcOrderMap = calcOrder.map((item) =>
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

	const saveCalcOrder = calcOrderMap as unknown as Prisma.OrderLineCreateManyOrdersInput;

	if (!saveCalcOrder) {
		throw new Error('Create OrderLine not found');
	}

	const updateCalcOrder =
		calcOrderMap as unknown as Enumerable<OrderLineUpdateManyWithWhereWithoutOrdersInput> OR undefined

	// if (!updateCalcOrder) {
	// 	throw new Error('Update OrderLine not found');
	// }

	const { OrderLine, ...restOrder } = input;

	if (restOrder?.orderDate) {
		restOrder.orderDate = new Date(restOrder.orderDate) as unknown as string;
	}

	if (restOrder?.deliveryDate) {
		restOrder.deliveryDate = new Date(restOrder.deliveryDate) as unknown as string;
	}

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
					updateMany: { data: updateCalcOrder }
				}
			}
		});
	} else {
		return await prisma.orders.create({
			data: {
				...restOrder,
				createdBy,
				OrderLine: {
					createMany: { data: saveCalcOrder }
				}
			}
		});
	}
};

export type SaveOrderOrUpdate = typeof saveOrderOrUpdatePrisma;
export type SaveOrderOrUpdateReturn = Prisma.PromiseReturnType<typeof saveOrderOrUpdatePrisma>;

export const getQuotationOrderPrisma = async (input: { id: number; currency: CurrencyType }) => {
	const order = await prisma.orders.findUnique({
		where: {
			id: input.id
		},
		include: {
			customerContact: {
				include: {
					email: true,
					address: true,
					phone: true
				}
			},
			Pricelists: true,
			OrderLine: {
				include: {
					Products: true
				}
			}
		}
	});

	if (!order) {
		throw new Error('Order not found');
	}

	const currencyType = input.currency.toUpperCase() as CurrencyType;

	const selectedCurrency = currencyOptions.get(currencyType);

	if (!selectedCurrency) {
		throw new Error('Currency not found');
	}

	const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

	return {
		order,
		zero,
		selectedCurrency
	};
};

export type GetQuotationOrder = typeof getQuotationOrderPrisma;
export type GetQuotationOrderPrismaReturn = Prisma.PromiseReturnType<
	typeof getQuotationOrderPrisma
>;

const getOrdersQueryOptions = (objectKeys: string, finalQuery: any) => {
	if (
		objectKeys === 'isCorporate' ||
		objectKeys === 'isActive' ||
		objectKeys === 'isUser' ||
		objectKeys === 'isInvoiced'
	) {
		return {
			equals: getBoolean(finalQuery[objectKeys] as any)
		};
	}

	if (objectKeys === 'id' || objectKeys === 'customersID' || objectKeys === 'pricelistsID') {
		return parseInt(finalQuery[objectKeys], 10);
	}

	return {
		contains: finalQuery[objectKeys],
		mode: 'insensitive'
	};
};

const getOrderLineQueryOptions = (objectKeys: string, finalQuery: any) => {
	if (objectKeys === 'id' || objectKeys === 'ordersID' || objectKeys === 'productsID') {
		return parseInt(finalQuery[objectKeys], 10);
	}

	return {
		contains: finalQuery[objectKeys],
		mode: 'insensitive'
	};
};
