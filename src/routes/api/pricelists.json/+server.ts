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
		if (!locals?.user?._id) {
			return json$1({
				status: 401,
				errors: { message: 'Unauthorized' }
			});
		}

		const reqPricelists: Array<PricelistsDocument> = await PricelistsModel.find();

		return json$1(reqPricelists);

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			status: 500,
			errors: { message: `A server error occurred ${err}` }
		});
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				status: 401,
				errors: { message: 'Unauthorized' }
			});
		}

		const userId = locals.user._id;

		const reqPricelists = await request.json();

		const pricelists = reqPricelists.pricelists.map((list) => {
			return {
				...list,
				pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
				minimumPrice: setMonetaryValue(list.minimumPrice)
			};
		});

		reqPricelists.pricelists = pricelists;

		reqPricelists.userID = userId;

		/**
		 * TODO: Validation
		 */

		const newPricelists = new PricelistsModel(reqPricelists);

		const res = await newPricelists.save();

		return json$1(res);

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			status: 500,
			errors: { message: `A server error occurred ${err}` }
		});
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				status: 401,
				errors: { message: 'Unauthorized' }
			});
		}

		const userId = locals.user._id;

		const reqPricelists = await request.json();

		reqPricelists.userID = userId;

		/**
		 * TODO: Validation
		 */

		const newPricelists = await PricelistsModel.findByIdAndUpdate(
			{ _id: reqPricelists._id },
			reqPricelists
		);

		return json$1(newPricelists);

	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			status: 500,
			errors: { message: `A server error occurred ${err}` }
		});
	}
};
