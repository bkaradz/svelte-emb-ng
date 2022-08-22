import { json } from '@sveltejs/kit';
import PricelistsModel from '$lib/models/pricelists.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'


export const GET: RequestHandler = async ({ params }) => {
  try {
    const pricelist = await PricelistsModel.findOne({ _id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })

    return json(pricelist);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    });
  }
}
