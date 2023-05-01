import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { loginCredentialsSchema, type LoginCredentials } from '$lib/validation/login.validate';
import { fail, redirect } from '@sveltejs/kit';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const formData = Object.fromEntries(await event.request.formData())
        try {
            const parsedUser = loginCredentialsSchema.safeParse(formData);
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
               return fail(400, {
                message: 'Validation error',
                errors: errorMap
               })
            }
        } catch (error) {
            console.log('object', error);
            return fail(400, {
                message: 'Something went wrong',
                errors: {}
            })
        }
        return {
            success: true
        }
    }
};