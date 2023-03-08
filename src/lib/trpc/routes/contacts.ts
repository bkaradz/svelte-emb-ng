
import prisma from '$lib/prisma/client';
import { router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import { saveContactsSchema } from '$lib/validation/saveContact.validate';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import omit from 'lodash-es/omit';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';

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
                },
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

            return { results: contactsQuery, ...pagination }

        }),
    getCorporate: protectedProcedure
        .input(searchParamsSchema.passthrough())
        .query(async ({ input }) => {

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
                },

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
    saveOrUpdateContact: protectedProcedure
        .input(saveContactsSchema)
        .mutation(async ({ input, ctx }) => {

            if (!ctx.userId) {
                throw new Error("User not found");
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
        }),
});

