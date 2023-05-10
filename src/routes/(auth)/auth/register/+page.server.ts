import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import {fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { userRegisterSchema } from '$lib/validation/userRegister.validate';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    register: async ({ cookies, request }) => {
        const formData = Object.fromEntries(await request.formData())
        try {
            const parsedUser = userRegisterSchema.safeParse(formData);
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }



        } catch (error) {
            return fail(400, {
                message: 'Something went wrong',
                errors: {}
            })
        }
        throw redirect(302, '/auth/login')

    }
};