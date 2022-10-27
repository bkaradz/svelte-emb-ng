import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const pricelistsQuery = await prisma.pricelists.findUnique({
			where: {
				id: parseInt(params.id)
			},
			include: {
				PricelistDetails: true
			}
		});

		return new Response(JSON.stringify(pricelistsQuery));
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
