import { json as json$1 } from '@sveltejs/kit';

// @migration task: Check imports
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
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
      })
    }

    const queryParams = Object.fromEntries(url.searchParams)

    const options: Array<OptionsDocument> = await OptionsModel.find(queryParams)

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(options);
    return {
      status: 200,
      body: options,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
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
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
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

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(res);
    return {
      status: 200,
      body: res,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
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
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
      })
    }

    const userId = locals.user._id

    const reqOptions = await request.json()

    reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndUpdate({ _id: reqOptions._id }, reqOptions, { new: true }).lean()

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(res);
    return {
      status: 200,
      body: res,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
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
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
      })
    }

    // const userId = locals.user._id

    const reqOptions = await request.json()

    // reqOptions.userID = userId

    const res: OptionsDocument = await OptionsModel.findByIdAndDelete({
      _id: reqOptions._id,
    }).lean()

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(res);
    return {
      status: 200,
      body: res,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
  }
}