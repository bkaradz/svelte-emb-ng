import logger from '$lib/utility/logger';
import omit from 'lodash-es/omit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';

const getQueryOptions = (objectKeys, finalQuery) => {
	if (objectKeys === 'id' || objectKeys === 'ordersID' || objectKeys === 'productsID') {
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
				Orders: {
					include: {
						customerContact: true
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
					[objectKeys]: getQueryOptions(objectKeys, finalQuery)
				}
			};
			queryTotal = {
				where: {
					[objectKeys]: getQueryOptions(objectKeys, finalQuery)
				}
			};
		} else {
			query = {
				...baseQuery
			};
			queryTotal = {};
		}

		const productsQuery = await prisma.orderLine.findMany(query);

		pagination.totalRecords = await prisma.orderLine.count(queryTotal);
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = null;
		}

		return new Response(JSON.stringify({ results: productsQuery, ...pagination }));
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
