import { connectDB } from '$lib/database/mongooseDB';
import * as cookie from 'cookie';
import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { GetSession, Handle } from '@sveltejs/kit';

connectDB();

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	const accessToken = cookies.accessToken;

	const { decoded } = verifyJwt(accessToken);

	if (decoded) {
		const session = await findSessions({ _id: decoded.sessionId });
		if (session.length) {
			event.locals.user = decoded;
			event.locals.user.authenticated = true;
			return await resolve(event);
		}
	}

	event.locals.user = null;
	return await resolve(event);
};

export const getSession: GetSession = async ({ locals }) => {
	return locals?.user ? locals : {};
};
