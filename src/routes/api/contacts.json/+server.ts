import omit from 'lodash-es/omit';
import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import { z, type TypeOf } from 'zod';
import prisma from '$lib/prisma/client';
import type { Prisma } from '@prisma/client';
import normalizePhone from '$lib/utility/normalizePhone.util';
import { getPagination } from '$lib/utility/pagination.util';
import { addContactsSchema, type AddContact } from '$lib/validation/addContact.validate';




export const querySelection = (reqContact: any, createDBy: number) => {
	let { name, email, phone, address } = reqContact;

	name = name.trim();
	if (email) {
		email = email.split(',').map((data: string) => {
			return { email: data.trim() };
		});
	}
	if (phone) {
		phone = normalizePhone(phone);
	}
	if (address) {
		address = address.split(',').map((data: string) => {
			return { address: data.trim() };
		});
	}

	let contact: Prisma.ContactsCreateInput;

	contact = {
		name,
		createdBy: createDBy,
		isActive: true,
		isUser: false
	};

	if (email) {
		contact = {
			...contact,
			email: { createMany: { data: email } }
		};
	}
	if (phone) {
		contact = {
			...contact,
			phone: { createMany: { data: phone } }
		};
	}
	if (address) {
		contact = {
			...contact,
			address: { createMany: { data: address } }
		};
	}
	if (email && phone) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } }
		};
	}
	if (email && address) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			address: { createMany: { data: address } }
		};
	}
	if (phone && address) {
		contact = {
			...contact,
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } }
		};
	}
	if (email && phone && address) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } }
		};
	}

	return contact;
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

		let whereQuery;

		if (objectKeys === 'isCorporate' || objectKeys === 'isActive' || objectKeys === 'isUser') {
			whereQuery = {
				equals: finalQuery[objectKeys] === 'true'
			};
		} else {
			whereQuery = {
				contains: finalQuery[objectKeys],
				mode: 'insensitive'
			};
		}

		let query;
		let queryTotal;

		const baseQuery = {
			take: pagination.limit,
			skip: (pagination.page - 1) * pagination.limit,
			include: {
				email: true,
				phone: true,
				address: true
			}
		};

		if (objectKeys) {
			query = {
				...baseQuery,
				where: {
					isActive: true,
					[objectKeys]: whereQuery
				},
			};
			queryTotal = {
				where: {
					isActive: true,
					[objectKeys]: whereQuery
				}
			};
		} else {
			query = {
				...baseQuery,
				where: {
					isActive: true,
				},
			};
			queryTotal = {
				where: {
					isActive: true,
				},
			};
		}

		const contactsQuery = await prisma.contacts.findMany(query);
		pagination.totalRecords = await prisma.contacts.count(queryTotal);
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}

		return new Response(JSON.stringify({ results: contactsQuery, ...pagination }));
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

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createDBy = parseInt(locals.user.id);

		let reqContact: AddContact = await request.json();


		// validate the user's password
		const parsedContact = addContactsSchema.safeParse(reqContact);

		if (!parsedContact.success) {
			return new Response(JSON.stringify({ message: parsedContact.error }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		
		const contact = querySelection(reqContact, createDBy);

		const contactsQuery = await prisma.contacts.create({ data: contact });

		return new Response(JSON.stringify(contactsQuery));
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

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createDBy = parseInt(locals.user.id);

		const reqContact = await request.json();

		const contact = querySelection(reqContact, createDBy);

		const updateContact = await prisma.contacts.update({
			where: {
				id: reqContact.id
			},
			data: contact
		});

		return new Response(JSON.stringify(updateContact));
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
