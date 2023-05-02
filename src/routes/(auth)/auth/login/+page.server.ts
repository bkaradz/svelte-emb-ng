import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { loginCredentialsSchema, type LoginCredentials } from '$lib/validation/login.validate';
import { fail, redirect } from '@sveltejs/kit';
import { createSession, setSessionCookies, validateUserPassword } from '$lib/services/session.services';
import { signJwt } from '$lib/utility/jwt.utils';
import config from 'config';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const formData = Object.fromEntries(await request.formData())
        try {
            const parsedUser = loginCredentialsSchema.safeParse(formData);
            console.log("🚀 ~ file: +page.server.ts:17 ~ default: ~ parsedUser:", parsedUser)
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            let user = await validateUserPassword(parsedUser.data);

            if (!user) {
                return fail(401, {
                    message: 'Invalid email or password',
                    errors: {}
                })
            }

            if (!user.isUserActive) {
                return fail(401, {
                    message: 'Unauthorized not Active',
                    errors: {}
                })
            }

          // create a session
		const session = await createSession(user.id, request.headers.get('user-agent') || '');

		const body = { ...user, sessionID: session.id, authenticated: true };

		// create an access token
		const accessToken = signJwt(body, { expiresIn: config.get('accessTokenTtl') });

		// return access tokens
		const headers = setSessionCookies(accessToken, cookies);

        cookies.set({...headers});

		return new Response(JSON.stringify(body), { headers: headers });

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