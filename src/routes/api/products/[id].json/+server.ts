import { json } from '@sveltejs/kit';
import logger from '$lib/utility/logger'
import ProductsModel from '$lib/models/products.models'
import type { RequestHandler } from './$types'


export const GET: RequestHandler = async ({ params }) => {
  try {
    const product = await ProductsModel.findOne({ _id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })
    // .populate('organizationID')
    // .exec();

    return json({
      product,
    })
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
      error: `A server error occurred ${err}`,
    }, {
      status: 500
    })
  }
}
