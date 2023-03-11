import { deleteSessionCookies, deleteSessions } from '$lib/services/session.services';
import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	try {
		const sessionID = locals?.user?.sessionID;

		const headers = deleteSessionCookies(cookies);
		cookies.set('session', '', {
			path: '/',
			expires: new Date(0)
		});

		locals.user = null;

		if (!sessionID) {
			return new Response(JSON.stringify({ message: 'Session not Found' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 404
			});
		}

		deleteSessions(sessionID);

		return new Response(JSON.stringify({ message: `You have successfully singed out` }), {
			headers: headers
		});
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
