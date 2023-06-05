import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { userRegisterSchema } from '$lib/validation/userRegister.validate';
import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import config from 'config';
import bcrypt from 'bcrypt';


export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    register: async ({ cookies, request }) => {

        const formData = Object.fromEntries(await request.formData())
        console.log("🚀 ~ file: +page.server.ts:19 ~ register: ~ formData:", formData)
        
        try {
            const parsedUser = userRegisterSchema.safeParse(formData);

            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            const userExist = await prisma.email.findUnique({
                where: {
                    email: parsedUser.data.email[0].email
                }
            });

            if (userExist) {
                return fail(409, {
                    message: 'User with that email already exist',
                    errors: {}
                })
            }

            const allUsers = await prisma.contacts.findMany();

            /**
         * If the database has no ADMIN create one,
         * other users are activated by the first ADMIN
         */
            let role;
            if (allUsers.length === 0) {
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

            const hash = bcrypt.hashSync(parsedUser.data.password, salt);

            parsedUser.data.password = hash;

            const { confirmPassword, ...restReqUser } = parsedUser.data;

            const user = await prisma.contacts.create({
                data: {
                    ...restReqUser,
                    ...role,
                    email: {
                        createMany: { data: parsedUser.data.email }
                    },
                    phone: {
                        createMany: { data: parsedUser.data.phone }
                    },
                    address: {
                        createMany: { data: parsedUser.data.address }
                    }
                }
            });

            const { password, ...restUser } = user;

            // return { success: true, payload: JSON.stringify(restUser) }
            throw redirect(302, '/auth/login')


        } catch (error) {
            return fail(400, {
                message: 'Something went wrong',
                errors: {}
            })
        }

    },
    addEmail: async ({ request }) => {
        const formItems = await request.formData();

        const items = [...formItems.entries()];

        const email = [...formItems.getAll('email[]'), ''];

        return { items, email };
    },
    removeEmail: async ({ request, url }) => {
        const formItems = await request.formData();
		const email = parseInt(String(url.searchParams.get('email')), 10) || 0;
        
        const items = [...formItems.entries()];
		const emails = [...formItems.getAll('email[]')];

		if (email > 0) {
			emails.splice(email, email);
		}

		return { items, emails };
    },
    addPhone: async ({ request }) => {
        const formItems = await request.formData();

        const items = [...formItems.entries()];

        const phone = [...formItems.getAll('phone[]'), ''];

        return { items, phone };
    },
    removePhone: async ({ request, url }) => {
        const formItems = await request.formData();
		const phone = parseInt(String(url.searchParams.get('phone')), 10) || 0;
        
        const items = [...formItems.entries()];
		const phones = [...formItems.getAll('phone[]')];

		if (phone > 0) {
			phones.splice(phone, phone);
		}

		return { items, phones };
        
    },
    addAddress: async ({ request }) => {
        const formItems = await request.formData();

        const items = [...formItems.entries()];

        const address = [...formItems.getAll('address[]'), ''];

        return { items, address };
    },
    removeAddress: async ({ request, url }) => {
        const formItems = await request.formData();
		const address = parseInt(String(url.searchParams.get('address')), 10) || 0;
        
        const items = [...formItems.entries()];
		const addresses = [...formItems.getAll('address[]')];

		if (address > 0) {
			addresses.splice(address, address);
		}

		return { items, addresses };
    }
};