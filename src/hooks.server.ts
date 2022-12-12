import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {

	const cookies = event.cookies.get('accessToken');

	let decoded

	if (cookies) {
		decoded = verifyJwt(cookies).decoded;
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