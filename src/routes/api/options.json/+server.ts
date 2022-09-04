import { json as json$1 } from '@sveltejs/kit';
import OptionsModel from '$lib/models/options.models'
import { postSuite } from '$lib/validation/server/options.validate'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import type { OptionsDocument } from '$lib/models/options.models'


export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const queryParams = Object.fromEntries(url.searchParams)

    const options: Array<OptionsDocument> = await OptionsModel.find(queryParams)

    return new Response(JSON.stringify(options));

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

    const createDBy = locals.user.id

    const reqOptions = await request.json()

    reqOptions.createdBy = createDBy

    /**
     * TODO: VALIDATION
     */

    const result = postSuite(reqOptions)

    const newOption: OptionsDocument = new OptionsModel(reqOptions)

    const res = await newOption.save()

    return new Response(JSON.stringify(res));

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


export const PUT: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const createDBy = locals.user.id

    const reqOptions = await request.json()

    reqOptions.createdBy = createDBy

    const res: OptionsDocument = await OptionsModel.findByIdAndUpdate({ id: reqOptions.id }, reqOptions, { new: true }).lean()

    return new Response(JSON.stringify(res));

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


export const DELETE: RequestHandler = async ({
  locals,
  request,
}) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    // const createDBy = locals.user.id

    const reqOptions = await request.json()

    // reqOptions.createdBy = createDBy

    const res: OptionsDocument = await OptionsModel.findByIdAndDelete({
      id: reqOptions.id,
    }).lean()

    return new Response(JSON.stringify(res));

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
