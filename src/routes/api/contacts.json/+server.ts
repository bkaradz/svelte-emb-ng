import { json as json$1 } from '@sveltejs/kit';

// @migration task: Check imports
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model';
import omit from 'lodash-es/omit';
import logger from '$lib/utility/logger';
import aggregateQuery from '$lib/services/aggregateQuery.services';
import pickBy from 'lodash-es/pickBy';
import identity from 'lodash-es/identity';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from "zod";
import type { Schema } from 'mongoose';

const ContactsSchema = z.object({
	name: z.string({required_error: "Name is required", invalid_type_error: "Name must be a string"}).trim(), 
	email: z.string().email({message: "Not a valid email"}).optional(), 
	phone: z.string({required_error: "Phone is required"}), 
	address: z.string().optional(), 
	isCorporate: z.boolean({required_error: "Corporate or Individual is required"}), 
	organizationID: z.string().optional(), 
	vatOrBpNo: z.string().optional() 
})

export type Contacts = z.infer<typeof ContactsSchema>


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
	body: ContactsDocument | { error: any } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const queryParams = Object.fromEntries(url.searchParams);

		const limit = isNaN(+queryParams?.limit) ? 15 : +queryParams?.limit;
		const page = isNaN(+queryParams?.page) ? 1 :  +queryParams?.page;

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

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(contacts);
		return {
			status: 200,
			body: contacts
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

export const POST: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: ContactsDocument | { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const userId = locals.user._id;

		let reqContact = await request.json();

		// password only allowed in signUp endpoint
		reqContact = omit(reqContact, 'password');

		reqContact.isActive = true;

		const contactFiltered = pickBy(reqContact, identity);

		const contacts = new ContactsModel(contactFiltered);

		contacts.isUser = false;
		contacts.userID = userId;

		await contacts.save();

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(contacts);
		return {
			status: 200,
			body: contacts
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

export const PUT: RequestHandler = async ({
	request,
	locals
}): Promise<{
	status: number;
	body: (ContactsDocument & Required<{_id: Schema.Types.ObjectId}>) | null | { error: string } | { message: string };
}> => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const reqContact = await request.json();

		const res = await ContactsModel.findByIdAndUpdate(reqContact._id, reqContact);

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(res);
		return {
			status: 200,
			body: res
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
