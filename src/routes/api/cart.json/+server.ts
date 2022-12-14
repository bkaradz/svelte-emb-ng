import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';
import { calculateOrder } from '$lib/services/orders';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const reqCart = await request.json();

		const newOrderLine = await calculateOrder(reqCart);

		return new Response(JSON.stringify(newOrderLine));
	} catch (err) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
