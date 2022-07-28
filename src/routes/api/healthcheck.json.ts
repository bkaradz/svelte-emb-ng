import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		return {
			status: 200,
			body: { status: 'ok' }
		};
	} catch (err) {
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};
