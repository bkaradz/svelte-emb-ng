
import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import omit from 'lodash-es/omit';
import { protectedProcedure } from '../middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { z } from 'zod';
import { addContactsSchema } from '$lib/validation/addContact.validate';
import normalizePhone from '$lib/utility/normalizePhone.util';
import type { Prisma } from '@prisma/client';
import logger from '$lib/utility/logger';
import parseCsv from '$lib/utility/parseCsv';

export const contacts = router({
    getContacts: protectedProcedure
        .input(searchParamsSchema.passthrough())
        .query(async ({ input }) => {

            const pagination = getPagination(input);

            const finalQuery = omit(input, ['page', 'limit', 'sort']);

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
                },
                orderBy: {
                    name: 'asc'
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

            return { results: contactsQuery, ...pagination }

        }),
    getCorporate: protectedProcedure
        .input(searchParamsSchema.passthrough())
        .query(async ({ input }) => {

            const pagination = getPagination(input);

            const baseQuery = {
                take: pagination.limit,
                skip: (pagination.page - 1) * pagination.limit,
                include: {
                    email: true,
                    phone: true,
                    address: true
                }
            };

            const query = {
                ...baseQuery,
                where: {
                    isActive: true,
                    isCorporate: true
                },
            };

            const queryTotal = {
                where: {
                    isActive: true,
                    isCorporate: true
                },
            };

            const contactsQuery = await prisma.contacts.findMany(query);
            pagination.totalRecords = await prisma.contacts.count(queryTotal);
            pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

            if (pagination.endIndex >= pagination.totalRecords) {
                pagination.next = undefined;
            }

            return { results: contactsQuery, ...pagination }

        }),
    getById: protectedProcedure
        .input(z.number())
        .query(async ({ input }) => {

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

            return product

        }),
    deleteById: protectedProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
            const product = await prisma.contacts.update({
                where: {
                    id: input
                },
                data: { isActive: false }
            });
            return product
        }),

    saveContact: protectedProcedure
        .input(addContactsSchema)
        .mutation(async ({ input, ctx }) => {

            if (!ctx.userId) {
                throw new Error("User not found");
            }

            const contactsQuery = querySelection(input, ctx.userId);

            const contact = await prisma.contacts.create({ data: contactsQuery });

            return contact
        }),
    updateContact: protectedProcedure
        .input(addContactsSchema)
        .mutation(async ({ input, ctx }) => {
        console.log("🚀 ~ file: contacts.ts:183 ~ .mutation ~ input", input)

            if (!ctx.userId) {
                throw new Error("User not found");
            }

            const contactsQuery = querySelection(input, ctx.userId);

            const contact = await prisma.contacts.update({
                where: {
                    id: input.id
                },
                data: contactsQuery
            });

            return contact
        }),
    uploadContact: protectedProcedure
        .input(z.record(z.string()))
        .mutation(async ({ input, ctx }) => {
        console.log("🚀 ~ file: contacts.ts:203 ~ .mutation ~ input", input)

            if (!ctx.userId) {
                throw new Error("User not found");
            }
            if (!input) {
                throw new Error("input not found");
            }

            const data = await input.formData();
            console.log("🚀 ~ file: contacts.ts:211 ~ .mutation ~ data", data)

            const file = data.get('contacts');

            if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
                logger.error('File is empty');
                return new Response(JSON.stringify({ message: 'File is empty' }), {
                    headers: {
                        'content-type': 'application/json; charset=utf-8'
                    },
                    status: 400
                });
            }

            const csvString = await file.text();

            const optionsArray = await parseCsv(csvString);

            const allDocsPromises: any[] = [];

            if (!Array.isArray(optionsArray)) {
                throw new Error("Products not found");
            }

            optionsArray.forEach(async (element) => {
                try {
                    const contact = querySelection(element, ctx.userId);
                    const contactsQuery = await prisma.contacts.create({ data: contact });
                    allDocsPromises.push(contactsQuery);
                } catch (err: any) {
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
            return allDocs
        }),
});


export const querySelection = (reqContact: any, createDBy: number) => {
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
        ...restContact,
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