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
				newRegExQuery = { ...newRegExQuery, [name]: { $regex: finalQuery[name], $options: 'ig' } };
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

		return {
			status: 200,
			body: { ...orders }
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const userId = locals.user._id;

		const reqOrder = await request.json();

		// check that the pricelist exist
		const pricelist = await PricelistsModel.findById({ _id: reqOrder.pricelistID }).lean();

		if (!pricelist) {
			return {
				status: 401,
				body: {
					message: 'Pricelist does not exist'
				}
			};
		}
		// check that the customer exist
		const customerExist = await ContactsModel.exists({ _id: reqOrder.customerID });

		if (!customerExist) {
			return {
				status: 401,
				body: {
					message: 'Customer does not exist'
				}
			};
		}

		const calcOrder = await calculateOrder(reqOrder, pricelist);
    console.log("🚀 ~ file: index.json.ts ~ line 183 ~ constPOST:RequestHandler= ~ calcOrder", calcOrder)

		const newOrder = new OrdersModel(calcOrder);

		newOrder.userID = userId;

		await newOrder.save();

		return {
			status: 200,
			body: newOrder
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};

export const PUT: RequestHandler = async () => {
	try {
		return {
			status: 200,
			body: {
				message: 'Success'
			}
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};


