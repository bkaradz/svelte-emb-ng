import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import { setMonetaryValue } from '$lib/services/monetary';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const ratesQuery = await prisma.xchangeRate.findMany({
			include: {
				XchangeRateDetails: true
			}
		});

		return new Response(JSON.stringify(ratesQuery));
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

export const changeCurrentDefault = async () => {
	return await prisma.xchangeRate.updateMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};

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

		const createDBy = parseInt(locals.user.id);

		const reqRates = await request.json();

		/**
		 * Check if isDefault is set
		 */
		if (reqRates.isDefault === 'true' || reqRates.isDefault === true) {
			changeCurrentDefault();
		}

		if (reqRates?.xChangeRateDate) {
			reqRates.xChangeRateDate = new Date(reqRates.xChangeRateDate);
		}

		const { XchangeRateDetails, ...restRates } = reqRates;

		const rateDetails = XchangeRateDetails.map((list: any) => {
			const { id, ...restObj } = list
			return {
				...restObj,
				rate: setMonetaryValue(list.rate)
			};
		});

		const ratesResults = await prisma.xchangeRate.create({
			data: {
				...restRates,
				createdBy: createDBy,
				XchangeRateDetails: { createMany: { data: rateDetails } }
			}
		});

		return new Response(JSON.stringify(ratesResults));
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
