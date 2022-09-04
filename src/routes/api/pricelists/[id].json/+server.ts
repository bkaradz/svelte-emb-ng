import { json } from '@sveltejs/kit';
import PricelistsModel from '$lib/models/pricelists.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'


export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const pricelist = await PricelistsModel.findOne({ id: params.id }, { createdAt: 0, updatedAt: 0, __v: 0 })

    return new Response(JSON.stringify(pricelist));

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      status: 500
    });
  }
}
