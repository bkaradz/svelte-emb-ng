import { json } from '@sveltejs/kit';
import PricelistsModel from '$lib/models/pricelists.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'

/** @type {import('./[id]').RequestHandler} */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const pricelist = await PricelistsModel.findOne({ _id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json(pricelist);
    return {
      status: 200,
      body: pricelist,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
  }
}
