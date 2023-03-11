import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import normalizePhone from '$lib/utility/normalizePhone.util';
import parseCsv from '$lib/utility/parseCsv';
import type { Contacts, Prisma } from '@prisma/client';
import type { RequestHandler } from './$types';

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

		const data = await request.formData();

		const file = data.get('contacts');

		// if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
		if (!(file instanceof File)) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const csvString = (await file.text()) as string;

		type pContact = Partial<Contacts>;

		const contactsArray = (await parseCsv(csvString)) as pContact[];

		const allDocsPromises: pContact[] = [];

		contactsArray.forEach(async (element) => {
			try {
				const contact = querySelection(element, createDBy);
				const contactsQuery = await prisma.contacts.create({ data: contact });
				allDocsPromises.push(contactsQuery);
			} catch (err: unknown) {
				logger.error(`Error: ${err}`);
				return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
					headers: {
						'content-type': 'application/json; charset=utf-8'
					},
					status: 500
				});
			}
		});

		const allDocs = await Promise.all(allDocsPromises);

		return new Response(JSON.stringify(allDocs));
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};

const querySelection = (reqContact: any, createDBy: number) => {
	// eslint-disable-next-line prefer-const
	let { name, email, phone, address, ...restContact } = reqContact;

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
		// ...restContact,
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
