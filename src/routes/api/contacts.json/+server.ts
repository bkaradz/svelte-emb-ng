import omit from 'lodash-es/omit';
import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import { z } from "zod";
import prisma from '$lib/prisma/client';
import type { Prisma } from '@prisma/client';


const ContactsSchema = z.object({
	name: z.string({ required_error: "Name is required", invalid_type_error: "Name must be a string" }).trim(),
	email: z.string().email({ message: "Not a valid email" }).optional(),
	phone: z.string({ required_error: "Phone is required" }),
	address: z.string().optional(),
	isCorporate: z.boolean({ required_error: "Corporate or Individual is required" }),
	organizationID: z.string().optional(),
	vatOrBpNo: z.string().optional()
})

export type Contacts = z.infer<typeof ContactsSchema>

export const querySelection = (reqContact: any, createDBy: string) => {

	let { name, email, phone, address } = reqContact;

	name = name.trim();
	if (email) {
		email = email.split(',').map((data: string) => { return { email: data.trim() } });
	}
	if (phone) {
		phone = phone.split(',').map((data: string) => { return { phone: data.trim() } });
	}
	if (address) {
		address = address.split(',').map((data: string) => { return { address: data.trim() } });
	}

	let contact: Prisma.ContactsCreateInput

	const contactConstants = {
		name,
		createdBy: createDBy,
		isActive: true,
		isUser: false,
	}

	if (email) {
		contact = {
			...contactConstants,
			email: { createMany: { data: email } },
		}
	}
	if (phone) {
		contact = {
			...contactConstants,
			phone: { createMany: { data: phone } },
		}
	}
	if (address) {
		contact = {
			...contactConstants,
			address: { createMany: { data: address } },
		}
	}
	if (email && phone) {
		contact = {
			...contactConstants,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } },
		}
	}
	if (email && address) {
		contact = {
			...contactConstants,
			email: { createMany: { data: email } },
			address: { createMany: { data: address } },
		}
	}
	if (phone && address) {
		contact = {
			...contactConstants,
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } },
		}
	}
	if (email && phone && address) {
		contact = {
			...contactConstants,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } },
		}
	}

	return contact
}

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

		const limit = isNaN(+queryParams?.limit) ? 15 : +queryParams?.limit;
		const page = isNaN(+queryParams?.page) ? 1 : +queryParams?.page;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		let previous = null;
		let next = null;
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

		const finalQuery = omit(queryParams, ['page', 'limit', 'sort']);

		const objectKeys = Object.keys(finalQuery)[0];

		let query: any
		let queryTotal: any

		if (objectKeys) {
			query = {
				take: limit,
				skip: page - 1,
				where: {
					[objectKeys]: {
						contains: finalQuery[objectKeys],
						mode: 'insensitive'
					},
				},
				orderBy: {
					name: 'asc',
				},
			}
			queryTotal = {
				where: {
					[objectKeys]: {
						contains: finalQuery[objectKeys],
						mode: 'insensitive'
					},
				},
			}
		} else {
			query = {
				take: limit,
				skip: page - 1,
				orderBy: {
					name: 'asc',
				},
			}
			queryTotal = {}
		}

		const contactsQuery = await prisma.contacts.findMany(query)
		const totalRecords = await prisma.contacts.count(queryTotal)

		if (endIndex < totalRecords) {
			next = {
				page: page + 1,
				limit
			};
		}

		const totalPages = Math.ceil(totalRecords / limit);

		return new Response(JSON.stringify({ results: contactsQuery, next, totalPages, previous, current, totalRecords, limit }));

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

		let reqContact = await request.json();

		const contact = querySelection(reqContact, createDBy)

		const contactsQuery = await prisma.contacts.create({ data: contact })

		return new Response(JSON.stringify(contactsQuery));

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

export const PUT: RequestHandler = async ({ request, locals }) => {
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

		const reqContact = await request.json();

		const contact = querySelection(reqContact, createDBy)

		const updateContact = await prisma.contacts.update({
			where: {
				id: reqContact.id,
			},
			data: contact,
		})

		return new Response(JSON.stringify(updateContact));

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
