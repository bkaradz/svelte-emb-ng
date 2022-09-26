import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import { setMonetaryValue } from '$lib/services/monetary';
import prisma from '$lib/prisma/client';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const pricelistsQuery = await prisma.pricelists.findMany({
			include: {
				PricelistSubList: true
			}
		})

		return new Response(JSON.stringify(pricelistsQuery));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};

export const changeCurrentDefault = async () => {
	const updatedAllToFalse = await prisma.pricelists.updateMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false },
	})
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const createDBy = locals.user.id;

		const reqPricelists = await request.json();

		/**
		 * Check if isDefault is set
		 */

		if (reqPricelists.isDefault === 'true' || reqPricelists.isDefault === true) {
			changeCurrentDefault()
		}

		const { pricelists, ...restPricelist } = reqPricelists

		const subPrices = reqPricelists.pricelists.map((list: any) => {
			return {
				...list,
				pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
				minimumPrice: setMonetaryValue(list.minimumPrice)
			};
		});

		const pricelistsQuery = await prisma.pricelists.create({
			data: {
				...restPricelist,
				createdBy: createDBy,
				PricelistSubList: { createMany: { data: subPrices } }
			}
		})

		return new Response(JSON.stringify(pricelistsQuery));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8',
				},
				status: 401
			});
		}

		const createDBy = locals.user.id;

		const reqPricelists = await request.json();

		const { pricelists, ...restPricelist } = reqPricelists

		const subPrices = reqPricelists.pricelists.map((list: any) => {
			return {
				...list,
				pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
				minimumPrice: setMonetaryValue(list.minimumPrice)
			};
		});

		const pricelistsQuery = await prisma.pricelists.update({
			where: {
				id: reqPricelists.id,
			},
			data: {
				...restPricelist,
				createdBy: createDBy,
				PricelistSubList: { createMany: { data: subPrices } }
			}
		})

		return new Response(JSON.stringify(pricelistsQuery));

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
			status: 500
		});
	}
};
