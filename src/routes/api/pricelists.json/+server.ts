import { json as json$1 } from '@sveltejs/kit';
import PricelistsModel, {
	type PricelistsDocument,
	type PricelistsSubDocument
} from '$lib/models/pricelists.model';
import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import { getMonetaryValue, setMonetaryValue } from '$lib/services/monetary';

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

		const reqPricelists: Array<PricelistsDocument> = await PricelistsModel.find();

		return new Response(JSON.stringify(reqPricelists));

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

		const pricelists = reqPricelists.pricelists.map((list) => {
			return {
				...list,
				pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
				minimumPrice: setMonetaryValue(list.minimumPrice)
			};
		});

		reqPricelists.pricelists = pricelists;

		reqPricelists.createdBy = createDBy;

		/**
		 * TODO: Validation
		 */

		const newPricelists = new PricelistsModel(reqPricelists);

		const res = await newPricelists.save();

		return new Response(JSON.stringify(res));

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

		reqPricelists.createdBy = createDBy;

		/**
		 * TODO: Validation
		 */

		const newPricelists = await PricelistsModel.findByIdAndUpdate(
			{ id: reqPricelists.id },
			reqPricelists
		);

		return new Response(JSON.stringify(newPricelists));

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
