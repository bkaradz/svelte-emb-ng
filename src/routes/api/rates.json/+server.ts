import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import { setMonetaryValue } from '$lib/services/monetary';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const queryParams = Object.fromEntries(url.SearchParams);

		const objectKeys = Object.keys(queryParams)[0];

		let whereQuery;

		if (objectKeys === 'isDefault' || objectKeys === 'isActive') {
			whereQuery = {
				equals: queryParams[objectKeys] === 'true'
			};
		}

		let query: any;

		const baseQuery = {
			include: {
				XchangeRateDetails: true
			},
		};

		if (objectKeys) {
			query = {
				...baseQuery,
				where: {
					isActive: true,
					[objectKeys]: whereQuery
				},

			};
		} else {
			query = {
				...baseQuery,
				where: {
					isActive: true,
				}
			};
		}

		const ratesQuery = await prisma.xchangeRate.findMany(query);

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
			const { id, ...restObj } = list;
			return {
				...restObj,
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

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createdBy = parseInt(locals.user.id);

		const reqRates = await request.json();

		if (reqRates.isDefault) {
			return new Response(JSON.stringify({ message: 'You can now delete the default Exchange Rates' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const ratesResults = await prisma.xchangeRate.update({
			where: {
				id: parseInt(reqRates.id)
			},
			data: { createdBy, isActive: false }
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
