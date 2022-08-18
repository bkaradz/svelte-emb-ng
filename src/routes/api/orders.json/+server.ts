import { json as json$1 } from '@sveltejs/kit';

// @migration task: Check imports
import logger from '$lib/utility/logger';
import aggregateQuery from '$lib/services/aggregateQuery.services';
import OrdersModel from '$lib/models/orders.model';
import omit from 'lodash-es/omit';
import { calculateOrder } from '$lib/services/orders';
import PricelistsModel from '$lib/models/pricelists.model';
import ContactsModel from '$lib/models/contacts.model';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
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
					foreignField: '_id',
					as: 'customerID'
				}
			},
			{
				$lookup: {
					from: 'pricelists',
					localField: 'pricelistID',
					foreignField: '_id',
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

		return json$1({ ...orders });
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const userId = locals.user._id;

		const reqOrder = await request.json();

		// check that the pricelist exist
		const pricelist = await PricelistsModel.findById({ _id: reqOrder.pricelistID }).lean();

		if (!pricelist) {
			return json$1({
				message: 'Pricelist does not exist'
			}, {
				status: 401
			});
		}
		// check that the customer exist
		const customerExist = await ContactsModel.exists({ _id: reqOrder.customerID });

		if (!customerExist) {
			return json$1({
				message: 'Customer does not exist'
			}, {
				status: 401
			});
		}

		const calcOrder = await calculateOrder(reqOrder, pricelist);

		const newOrder = new OrdersModel(calcOrder);

		newOrder.userID = userId;

		await newOrder.save();

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(newOrder);
		return {
			status: 200,
			body: newOrder
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};

export const PUT: RequestHandler = async () => {
	try {
		return json$1({
			message: 'Success'
		});
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};

