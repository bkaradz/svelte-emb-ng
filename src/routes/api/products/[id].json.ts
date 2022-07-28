import logger from '$lib/utility/logger'
import ProductsModel from '$lib/models/products.models'
import type { RequestHandler } from '@sveltejs/kit'

/** @type {import('./[id]').RequestHandler} */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const product = await ProductsModel.findOne({ _id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })
    // .populate('organizationID')
    // .exec();

    return {
      status: 200,
      body: {
        product,
      },
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
