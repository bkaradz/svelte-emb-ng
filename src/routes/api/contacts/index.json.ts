import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model';
import omit from 'lodash-es/omit';
import logger from '$lib/utility/logger';
import aggregateQuery from '$lib/services/aggregateQuery.services';
// import { postSuite } from '$lib/validation/server/contacts.validate';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import type { RequestHandler } from '@sveltejs/kit';
// import { toDineroObject } from '$lib/services/monetary';
// import { dinero } from 'dinero.js';

export interface contactsTest {
	_id: string;
	userID: string;
	name: string;
	isCorporate: boolean;
	phone: string;
	balanceDue: number;
	totalReceipts: number;
	isActive: boolean;
	isUser: boolean;
	organizationID: {
		name: string;
	};
	vatOrBpNo?: string;
	email?: string;
	address?: string;
}

export interface Pagination {
	totalRecords: number;
	totalPages: number;
	limit: number;
	error: boolean;
	previous?: { page: number; limit: number };
	current: { page: number; limit: number };
	next?: { page: number; limit: number };
}

export interface ContentsPaginationIterface extends Pagination {
	results: ContactsDocument[];
	
}

export const GET: RequestHandler = async ({
	url,
	locals
}): Promise<{
	status: number;
	body: ContactsDocument | { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
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
				newRegExQuery = { ...newRegExQuery, [name]: { $regex: finalQuery[name], $options: 'ig' } };
			}
		});

		const aggregateFilter = [
			{
				$lookup: {
					from: 'contacts',
					localField: 'organizationID',
					foreignField: '_id',
					as: 'organizationID'
				}
			},
			{
				$addFields: {
					balanceDue: {
						$function: {
							body: function (params: string) {
								return JSON.parse(params);
							},
							args: ['$balanceDue'],
							lang: 'js'
						}
					},
					totalReceipts: {
						$function: {
							body: function (params: string) {
								return JSON.parse(params);
							},
							args: ['$totalReceipts'],
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
						userRole: 0,
						password: 0,
						createdAt: 0,
						updatedAt: 0,
						__v: 0
					}
				}
			}
		];

		let contacts = await aggregateQuery(
			queryParams,
			ContactsModel,
			aggregateFilter,
			endSearchParams
		);

		contacts = { ...contacts, ...contacts.metaData[0] };
		delete contacts.metaData;

		return {
			status: 200,
			body: contacts
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

export const POST: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: ContactsDocument | { error: string } | { message: string };
}> => {
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

		let reqContact = await request.json();

		// password only allowed in signUp endpoint
		reqContact = omit(reqContact, 'password');

		reqContact.isActive = true;

		// const result = postSuite(reqContact);

		// if (result.hasErrors()) {
		// 	logger.error(result.getErrors());
		// 	return {
		// 		status: 400,
		// 		body: {
		// 			message: `${result.getErrors()}`
		// 		}
		// 	};
		// }

		const contactFiltered = pickBy(reqContact, identity);

		const contacts = new ContactsModel(contactFiltered);

		contacts.isUser = false;
		contacts.userID = userId;

		await contacts.save();

		return {
			status: 200,
			body: contacts
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

export const PUT: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: ContactsDocument | { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const reqContact = await request.json();

		const res = await ContactsModel.findByIdAndUpdate(reqContact._id, reqContact);

		return {
			status: 200,
			body: res
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

// export const DELETE: RequestHandler = async() => {
// 	return;
// }
