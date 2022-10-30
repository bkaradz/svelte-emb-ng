import * as cookie from 'cookie';
import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { Handle } from '@sveltejs/kit';
import { createContext, router } from '$lib/server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import { sequence } from '@sveltejs/kit/hooks';


const first: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	const accessToken = cookies.accessToken;

	const { decoded } = verifyJwt(accessToken);

	if (decoded) {
		const session = await findSessions(decoded?.sessionID);
		if (session) {
			event.locals.user = decoded;
			event.locals.user.authenticated = true;
			// return response;
			return await resolve(event);
		} else {
			event.locals.user = null;
			return await resolve(event);
		}
	} else {
		return await resolve(event);
	}
}


const second: Handle = async ({ event, resolve }) => {
	const response = await createTRPCHandle({
		router,
		createContext,
		event,
		resolve
	});

	return response;
}

export const handle = sequence(first, second);