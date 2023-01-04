
import prisma from '$lib/prisma/client';
import { publicProcedure, router } from '$lib/trpc/t';
import { getPagination } from '$lib/utility/pagination.util';
import omit from 'lodash-es/omit';
import { protectedProcedure } from '../middleware/auth';
import { searchParamsSchema } from "$lib/validation/searchParams.validate";
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { userRegisterSchema } from '$lib/validation/userRegister.validate';
import bcrypt from 'bcrypt';
import config from 'config';
import { createSession, setSessionCookies, validateUserPassword } from '$lib/services/session.services';
import { signJwt } from '$lib/utility/jwt.utils';
import { loginCredentialsSchema } from '$lib/validation/login.validate';

export const authentication = router({
    getUsers: protectedProcedure
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

            let query: Prisma.ContactsFindManyArgs;
            let queryTotal: Prisma.ContactsFindManyArgs;

            const baseQuery = {
                take: pagination.limit,
                skip: (pagination.page - 1) * pagination.limit,
                include: {
                    email: true,
                    phone: true,
                    address: true
                },
                orderBy: [
                    {
                        name: 'asc'
                    }
                ]
            };

            if (objectKeys) {
                query = {
                    ...baseQuery,
                    where: {
                        isUserActive: true,
                        [objectKeys]: whereQuery
                    },
                };
                queryTotal = {
                    where: {
                        isUserActive: true,
                        [objectKeys]: whereQuery
                    }
                };
            } else {
                query = {
                    ...baseQuery,
                    where: {
                        isUserActive: true,
                    },
                };
                queryTotal = {
                    where: {
                        isUserActive: true,
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
    registerOrUpdateUser: publicProcedure
        .input(userRegisterSchema)
        .mutation(async ({ input }) => {

            const userExist = await prisma.email.findUnique({
                where: {
                    email: input.email[0].email
                }
            });

            if (userExist) {
                return new Response(JSON.stringify({ message: 'User with that email already exist' }), {
                    headers: {
                        'content-type': 'application/json; charset=utf-8'
                    },
                    status: 409
                });
            }


            if (input.id) {
                const { confirmPassword, ...restReqUser } = input;

                const user = await prisma.contacts.update({
                    where: {
                        id: input.id
                    },
                    data: {
                        ...restReqUser,
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

                const { password, ...restUser } = user;

                return restUser

            } else {
                /**
                 * Find the number of contacts in the database
                 */
                const allUsers = await prisma.contacts.count();

                /**
                 * If the database has no Contacts create ADMIN contact,
                 * other users are activated by the first ADMIN
                 */
                let role;

                if (allUsers === 0) {
                    role = {
                        userRole: 'ADMIN',
                        isUser: true,
                        isActive: true,
                        isUserActive: true
                    };
                } else {
                    role = {
                        userRole: 'USER',
                        isUser: true,
                        isActive: true,
                        isUserActive: false
                    };
                }

                const salt = await bcrypt.genSalt(config.get('saltWorkFactor'));

                const hash = bcrypt.hashSync(input.password, salt);

                input.password = hash;

                const { confirmPassword, ...restReqUser } = input;

                const user = await prisma.contacts.create({
                    data: {
                        ...restReqUser,
                        ...role,
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

                const { password, ...restUser } = user;

                return restUser
            }


        }),
    /**
     * FIX: find the solution to authenticate using cookies with trpc 
     */
    loginUser: publicProcedure
        .input(loginCredentialsSchema)
        .mutation(async ({ input, ctx }) => {

            const user = await validateUserPassword(input);

            if (!user) {
                return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
                    headers: {
                        'content-type': 'application/json; charset=utf-8'
                    },
                    status: 401
                });
            }

            if (!user.isUserActive) {
                return new Response(JSON.stringify({ message: 'Unauthorized not Active' }), {
                    headers: {
                        'content-type': 'application/json; charset=utf-8'
                    },
                    status: 403
                });
            }

            // create a session
            const session = await createSession(user.id, ctx.event.request.headers.get('user-agent') || '');

            const body = { ...user, sessionID: session.id, authenticated: true };

            // create an access token
            const accessToken = signJwt(body, { expiresIn: config.get('accessTokenTtl') });



            // return access tokens
            const headers = setSessionCookies(accessToken, ctx.event.cookies);
            ctx.event.cookies.set('accessToken', accessToken, {
                maxAge: config.get('cookieAccessTokenTtl'), // 15min
                httpOnly: config.get('httpOnly'),
                domain: 'localhost',
                path: '/',
                sameSite: config.get('sameSite'),
                secure: config.get('secure')
            })

            ctx.event.request.headers.set('set-cookie', headers['Set-Cookie'])

            // throw redirect(302, '/')

            // return new Response(JSON.stringify(body), { headers: headers });
            return 'Done';
        }),
})
