import * as cookie from 'cookie';
import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	const accessToken = cookies.accessToken;

	const { decoded } = verifyJwt(accessToken);

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

export const getSession = async ({ locals }) => {
	return locals?.user ? locals : {};
};
