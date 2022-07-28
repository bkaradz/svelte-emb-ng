import PricelistsModel from '$lib/models/pricelists.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'

/** @type {import('./[id]').RequestHandler} */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const pricelist = await PricelistsModel.findOne({ _id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })

    return {
      status: 200,
      body: pricelist,
    }
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}
