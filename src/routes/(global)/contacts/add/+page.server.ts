import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import logger from '$lib/utility/logger';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { Contacts, Prisma } from '@prisma/client';
import parseCsv from '$lib/utility/parseCsv';
import normalizePhone from '$lib/utility/normalizePhone.util';
import prisma from '$lib/prisma/client';

export const load = (async (event) => {
	const queryParams = {
		limit: 3,
		page: 1
	};

	const newCorporateContacts = async () => {
		return await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);
	};

	return {
		contacts: newCorporateContacts()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async ({ request, locals }) => {

		const { user } = await locals.auth.validateUser()

		if (!user) {
			throw redirect(303, "/auth/login")
		}

		const data = await request.formData()
		const file = data.get('contacts')

		if (!(file instanceof File)) {
			logger.error('File is empty');
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = (await file.text()) as string;

		type pContact = Partial<Contacts>;

		const contactsArray = (await parseCsv(csvString)) as pContact[];

		const allDocsPromises: pContact[] = [];

		contactsArray.forEach(async (element) => {
			try {
				const contact = querySelection(element, user);
				const contactsQuery = await prisma.contacts.create({ data: contact });
				allDocsPromises.push(contactsQuery);
			} catch (err: unknown) {
				logger.error(`Error: ${err}`);
				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}
		});

		const allDocs = await Promise.all(allDocsPromises);

		return { success: true, payload: JSON.stringify(allDocs) }
	}
};

const querySelection = (reqContact: any, user: { userId: string, username: string, name: string }) => {
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
		createdBy: user.userId,
		name,
		isActive: true,
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

