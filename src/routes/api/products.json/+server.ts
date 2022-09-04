import { json as json$1 } from '@sveltejs/kit';


import logger from '$lib/utility/logger';
import ProductsModel from '$lib/models/products.models';
import aggregateQuery from '$lib/services/aggregateQuery.services';
import { postSuite } from '$lib/validation/server/products.validate';
import omit from 'lodash-es/omit';
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
			// {
			// 	$lookup: {
			// 		from: 'products',
			// 		localField: 'organizationID',
			// 		foreignField: 'id',
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

		return new Response(JSON.stringify({ ...products }));

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

		const reqProduct = await request.json();

		const result = postSuite(reqProduct);

		if (result.hasErrors()) {
			logger.error(result.getErrors());
			return new Response(JSON.stringify({ message: result.getErrors() }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 400
			});
		}

		const newProduct = new ProductsModel(reqProduct);

		newProduct.createdBy = createDBy;

		await newProduct.save();

		return new Response(JSON.stringify({ message: newProduct }));

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

export const PUT: RequestHandler = async () => {
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


