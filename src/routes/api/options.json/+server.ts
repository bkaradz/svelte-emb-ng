import { json as json$1 } from '@sveltejs/kit';
import OptionsModel from '$lib/models/options.models'
import { postSuite } from '$lib/validation/server/options.validate'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import type { OptionsDocument } from '$lib/models/options.models'


export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    const queryParams = Object.fromEntries(url.searchParams)

    const options: Array<OptionsDocument> = await OptionsModel.find(queryParams)

    return json$1(options);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    const userId = locals.user._id

    const reqOptions = await request.json()

    reqOptions.userID = userId

    /**
     * TODO: VALIDATION
     */

    const result = postSuite(reqOptions)

    const newOption: OptionsDocument = new OptionsModel(reqOptions)

    const res = await newOption.save()

    return json$1(res);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}


export const PUT: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    const userId = locals.user._id

    const reqOptions = await request.json()

    reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndUpdate({ _id: reqOptions._id }, reqOptions, { new: true }).lean()

    return json$1(res);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}


export const DELETE: RequestHandler = async ({
  locals,
  request,
}) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    // const userId = locals.user._id

    const reqOptions = await request.json()

    // reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndDelete({
      _id: reqOptions._id,
    }).lean()

    return json$1(res);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}
