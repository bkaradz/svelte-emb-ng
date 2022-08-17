import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		return json({ status: 'ok' });
	} catch (err: any) {
		return json({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};
