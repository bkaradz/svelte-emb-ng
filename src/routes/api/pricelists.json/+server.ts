import { json as json$1 } from '@sveltejs/kit';

// @migration task: Check imports
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
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const reqPricelists: Array<PricelistsDocument> = await PricelistsModel.find();

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(reqPricelists);
		return {
			status: 200,
			body: reqPricelists
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
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

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(res);
		return {
			status: 200,
			body: res
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?._id) {
			return json$1({
				message: 'Unauthorized'
			}, {
				status: 401
			});
		}

		const userId = locals.user._id;

		const reqPricelists = await request.json();

		reqPricelists.userID = userId;

		const result = postSuite(reqPricelists);

		if (result.hasErrors()) {
			logger.error(result.getErrors());
			return json$1({
				message: result.getErrors()
			}, {
				status: 400
			});
		}

		const newPricelists = await PricelistsModel.findByIdAndUpdate(
			{ _id: reqPricelists._id },
			reqPricelists
		);

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json$1(newPricelists);
		return {
			status: 200,
			body: newPricelists
		};
	} catch (err: any) {
		logger.error(`Error: ${err.message}`);
		return json$1({
			error: `A server error occurred ${err}`
		}, {
			status: 500
		});
	}
};
