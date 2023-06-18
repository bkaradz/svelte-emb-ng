import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { userRegisterSchema } from '$lib/validation/userRegister.validate';
import { auth } from '$lib/lucia/client'


export const load = (async ({ locals }) => {
    const session = await locals.auth.validate()

    if (session) {
        throw redirect(302, "/")
    }
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    register: async ({ request }) => {

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

            const { name, username, password } = parsedUser.data 

             await auth.createUser({
                primaryKey: {
                    providerId: 'username',
                    providerUserId: username,
                    password
                },
                attributes: {
                    name,
                    username
                }
            })

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }

        throw redirect(303, '/auth/login')

    },
  
};