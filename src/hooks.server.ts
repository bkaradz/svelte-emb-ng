import { sequence } from '@sveltejs/kit/hooks';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { userSessionInterface } from '$lib/types';

export const first = createTRPCHandle({ router, createContext });

export const second: Handle = async ({ event, resolve }) => {
	const cookies = event.cookies.get('accessToken');

	let decoded: userSessionInterface | undefined = undefined;

	if (cookies) {
		decoded = verifyJwt(cookies).decoded as unknown as userSessionInterface;
	}

	if (decoded) {
		const session = await findSessions(decoded?.sessionID);
		if (session) {
			event.locals.user = decoded;
			event.locals.user.authenticated = true;
			return await resolve(event);
		}
	}

	event.locals.user = null;
	return await resolve(event);
};

export const handle: Handle = sequence(first, second);
