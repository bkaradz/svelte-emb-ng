import { json as json$1 } from '@sveltejs/kit';


import logger from '$lib/utility/logger';
import aggregateQuery from '$lib/services/aggregateQuery.services';
import OrdersModel from '$lib/models/orders.model';
import omit from 'lodash-es/omit';
import { calculateOrder } from '$lib/services/orders';
import PricelistsModel from '$lib/models/pricelists.model';
import ContactsModel from '$lib/models/contacts.model';
import type { RequestHandler } from './$types';

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

		let { limit = 15, page = 1 } = queryParams;

		limit = parseInt(limit) < 1 ? 1 : parseInt(limit);
		page = parseInt(page);

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		let previous = null;
		const next = null;
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

		const endSearchParams = { limit, page, next, endIndex, current };
		/**
		 * TODO: Make sort to be dynamic
		 */

		const finalQuery = omit(queryParams, ['page', 'limit', 'sort']);

		const objectKeys = Object.keys(finalQuery);

		let newRegExQuery = {};

		objectKeys.forEach((name) => {
			if (name === 'isCorporate' || name === 'isUser' || name === 'isActive') {
				finalQuery[name] = finalQuery[name] === 'true' ? true : false;
				newRegExQuery = { ...newRegExQuery, [name]: finalQuery[name] };
			} else {
				newRegExQuery = { ...newRegExQuery, [name]: { $regex: finalQuery[name], $options: 'i' } };
			}
		});

		const aggregateFilter = [
			{
				$lookup: {
					from: 'contacts',
					localField: 'customerID',
					foreignField: 'id',
					as: 'customerID'
				}
			},
			{
				$lookup: {
					from: 'pricelists',
					localField: 'pricelistID',
					foreignField: 'id',
					as: 'pricelistID'
				}
			},
			// {
			//   $addFields: {
			//     stitches: {
			//       $toString: '$stitches',
			//     },
			//   },
			// },
			{
				$match: newRegExQuery
			},
			{
				$sort: {
					name: 1
				}
			},

			{
				$facet: {
					metaData: [
						{
							$count: 'totalRecords'
						},
						{
							$addFields: {
								previous,
								current,
								limit
							}
						}
					],
					results: [
						{
							$skip: startIndex
						},
						{
							$limit: limit
						}
					]
				}
			},
			{
				$project: {
					results: {
						createdAt: 0,
						updatedAt: 0,
						__v: 0
					}
				}
			}
		];

		let orders = await aggregateQuery(queryParams, OrdersModel, aggregateFilter, endSearchParams);

		orders = { ...orders, ...orders.metaData[0] };
		delete orders.metaData;

		return new Response(JSON.stringify({ ...orders }));

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
		const pricelist = await PricelistsModel.findById({ id: reqOrder.pricelistID }).lean();

		if (!pricelist) {
			return new Response(JSON.stringify({ message: 'Pricelist does not exist' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}
		// check that the customer exist
		const customerExist = await ContactsModel.exists({ id: reqOrder.customerID });

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


