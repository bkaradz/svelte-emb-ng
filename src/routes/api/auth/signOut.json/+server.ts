import type { RequestHandler } from './$types';
import { deleteSessionCookies, deleteSessions } from '$lib/services/session.services';
import logger from '$lib/utility/logger';

export const POST: RequestHandler = async ({ locals }) => {
	try {
		const sessionID = locals?.user?.sessionID;

		const headers = deleteSessionCookies();

		if (!sessionID) {
			return new Response(JSON.stringify({ message: 'Session not Found' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 404
			});
		}

		deleteSessions(sessionID);

		locals.user = null;

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
