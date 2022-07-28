import OptionsModel from '$lib/models/options.models'
import { postSuite } from '$lib/validation/server/options.validate'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'
import type { OptionsDocument } from '$lib/models/options.models'

/** @type {import('@sveltejs/kit').RequestHandler}*/
export const GET: RequestHandler = async ({
  url,
  locals,
}): Promise<{
  status: number
  body: Array<OptionsDocument> | { error: string } | { message: string }
}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    const queryParams = Object.fromEntries(url.searchParams)

    const options: Array<OptionsDocument> = await OptionsModel.find(queryParams)

    return {
      status: 200,
      body: options,
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

/** @type {import('@sveltejs/kit').RequestHandler} */
export const POST: RequestHandler = async ({
  request,
  locals,
}): Promise<{
  status: number
  body: OptionsDocument | { error: string } | { message: string }
}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
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

    return {
      status: 200,
      body: res,
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

/** @type {import('@sveltejs/kit').RequestHandler} */
export const PUT: RequestHandler = async ({
  locals,
  request,
}): Promise<{
  status: number
  body: OptionsDocument | { error: string } | { message: string }
}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    const userId = locals.user._id

    const reqOptions = await request.json()

    reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndUpdate({ _id: reqOptions._id }, reqOptions, { new: true }).lean()

    return {
      status: 200,
      body: res,
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

/** @type {import('@sveltejs/kit').RequestHandler} */
export const DELETE: RequestHandler = async ({
  locals,
  request,
}): Promise<{
  status: number
  body: OptionsDocument | { error: string } | { message: string }
}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    // const userId = locals.user._id

    const reqOptions = await request.json()

    // reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndDelete({
      _id: reqOptions._id,
    }).lean()

    return {
      status: 200,
      body: res,
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
