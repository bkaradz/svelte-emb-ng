import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { loginCredentialsSchema } from '$lib/validation/login.validate';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { auth } from '$lib/lucia/client';

export const load = (async ({ locals }) => {
    const session = await locals.auth.validate()

    if (session) {
        throw redirect(302, "/")
    }
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    login: async ({ locals, request }) => {
        const formData = Object.fromEntries(await request.formData())
        try {
            const parsedUser = loginCredentialsSchema.safeParse(formData);
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            const { username, password } = parsedUser.data

            const key = await auth.useKey('username', username, password)
            const session = await auth.createSession(key.userId)
            locals.auth.setSession(session)

        } catch (error) {
            return fail(400, {
                message: 'Could not login user.',
                errors: { error }
            })
        }
        throw redirect(302, '/')
    }
};