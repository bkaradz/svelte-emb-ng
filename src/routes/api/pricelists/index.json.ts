import PricelistsModel, {
	type PricelistsDocument,
	type PricelistsSubDocument
} from '$lib/models/pricelists.model';
import { postSuite } from '$lib/validation/server/pricelists.validate';
import logger from '$lib/utility/logger';
import type { RequestHandler } from '@sveltejs/kit';
import { getMonetaryValue, setMonetaryValue } from '$lib/services/monetary';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const reqPricelists: Array<PricelistsDocument> = await PricelistsModel.find();

		return {
			status: 200,
			body: reqPricelists
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
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

		// const result = postSuite(reqPricelists)

		// if (result.hasErrors()) {
		//   logger.error(result.getErrors())
		//   return {
		//     status: 400,
		//     body: {
		//       message: result.getErrors(),
		//     },
		//   }
		// }

		const newPricelists = new PricelistsModel(reqPricelists);

		const res = await newPricelists.save();

		return {
			status: 200,
			body: res
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return {
				status: 401,
				body: {
					message: 'Unauthorized'
				}
			};
		}

		const userId = locals.user._id;

		const reqPricelists = await request.json();

		reqPricelists.userID = userId;

		const result = postSuite(reqPricelists);

		if (result.hasErrors()) {
			logger.error(result.getErrors());
			return {
				status: 400,
				body: {
					message: result.getErrors()
				}
			};
		}

		const newPricelists = await PricelistsModel.findByIdAndUpdate(
			{ _id: reqPricelists._id },
			reqPricelists
		);

		return {
			status: 200,
			body: newPricelists
		};
	} catch (err) {
		logger.error(`Error: ${err.message}`);
		return {
			status: 500,
			body: {
				error: `A server error occurred ${err}`
			}
		};
	}
};
