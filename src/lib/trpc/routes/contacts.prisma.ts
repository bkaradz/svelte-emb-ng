import prisma from '$lib/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SaveContact } from '$lib/validation/saveContact.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import omit from 'lodash-es/omit';
import type { Context } from '../context';

export const getContactsPrisma = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0];

	let whereQuery;

	if (objectKeys === 'isCorporate' || objectKeys === 'isActive' || objectKeys === 'isUser') {
		whereQuery = {
			equals: getBoolean(finalQuery[objectKeys])
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
			}
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
				isActive: true
			}
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const contactsQuery = await prisma.contacts.findMany({
		...query,
		orderBy: [
			{
				name: 'asc'
			}
		]
	});
	pagination.totalRecords = await prisma.contacts.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: contactsQuery, ...pagination };
};

export type GetContacts = typeof getContactsPrisma;

export const getCorporatePrisma = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0];

	let whereQuery;

	if (objectKeys === 'isCorporate' || objectKeys === 'isActive' || objectKeys === 'isUser') {
		whereQuery = {
			equals: getBoolean(finalQuery[objectKeys])
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
			}
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
				isActive: true
			}
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const contactsQuery = await prisma.contacts.findMany({
		...query,
		orderBy: [
			{
				name: 'asc'
			}
		]
	});
	pagination.totalRecords = await prisma.contacts.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: contactsQuery, ...pagination };
};

export type GetCorporate = typeof getCorporatePrisma;

export const getByIdPrisma = async (input: number) => {
	const product = await prisma.contacts.findUnique({
		where: {
			id: input
		},
		include: {
			email: true,
			phone: true,
			address: true
		}
	});

	return product;
};

export type GetById = typeof getByIdPrisma;

export const deleteByIdPrisma = async (input: number) => {
	const product = await prisma.contacts.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return product;
};

export type DeleteById = typeof deleteByIdPrisma;

export const saveOrUpdateContactPrisma = async (input: SaveContact, ctx: Context) => {
	if (!ctx.userId) {
		throw new Error('User not found');
	}

	if (input.id) {
		return await prisma.contacts.update({
			where: {
				id: input.id
			},
			data: {
				...input,
				email: {
					create: input.email
				},
				phone: {
					create: input.phone
				},
				address: {
					create: input.address
				}
			}
		});
	} else {
		return await prisma.contacts.create({
			data: {
				...input,
				email: {
					create: input.email
				},
				phone: {
					create: input.phone
				},
				address: {
					create: input.address
				}
			}
		});
	}
};

export type SaveOrUpdateContact = typeof saveOrUpdateContactPrisma;
