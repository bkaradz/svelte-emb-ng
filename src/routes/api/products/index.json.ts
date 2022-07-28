import logger from '$lib/utility/logger';
import ProductsModel from '$lib/models/products.models';
import aggregateQuery from '$lib/services/aggregateQuery.services';
import { postSuite } from '$lib/validation/server/products.validate';
import  omit  from 'lodash-es/omit';
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
			// {
			// 	$lookup: {
			// 		from: 'products',
			// 		localField: 'organizationID',
			// 		foreignField: '_id',
			// 		as: 'organizationID'
			// 	}
			// },
			{
				$addFields: {
					stitches: {
						$toString: '$stitches'
					},
					unitPrice: {
						$function: {
							body: function (params: string) {
								return JSON.parse(params);
							},
							args: ['$unitPrice'],
							lang: 'js'
						}
					}
				}
			},
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

		let products = await aggregateQuery(
			queryParams,
			ProductsModel,
			aggregateFilter,
			endSearchParams
		);

		products = { ...products, ...products.metaData[0] };
		delete products.metaData;

		return {
			status: 200,
			body: { ...products }
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

		const reqProduct = await request.json();

		const result = postSuite(reqProduct);

		if (result.hasErrors()) {
			logger.error(result.getErrors());
			return {
				status: 400,
				body: {
					message: result.getErrors()
				}
			};
		}

		const newProduct = new ProductsModel(reqProduct);

		newProduct.userID = userId;

		await newProduct.save();

		return {
			status: 200,
			body: {
				message: newProduct
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


