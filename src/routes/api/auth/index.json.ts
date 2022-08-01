import ContactsModel from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import { postSuite } from '$lib/validation/server/signUp.validate'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }): Promise<{}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    const res = await ContactsModel.find(
      { isUser: true },
      {
        password: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        isCorporate: 0,
        balanceDue: 0,
        totalReceipts: 0,
      }
    ).lean()

    return {
      status: 200,
      body: res,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}

export const PUT: RequestHandler = async ({ request, locals }): Promise<{}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    const userUpdate = await request.json()
    const userUpdated = await ContactsModel.findByIdAndUpdate({ _id: userUpdate._id }, userUpdate)
      .select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts')
      .lean()

    return {
      status: 200,
      body: {
        ...userUpdated,
      },
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}

export const DELETE: RequestHandler = async ({ locals, request }): Promise<{}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized',
        },
      }
    }

    const userDelete = await request.json()
    // const queryParams = Object.fromEntries(url.searchParams)
    // const userUpdate = await request.json();
    const userUpdated = await ContactsModel.findByIdAndUpdate(
      { _id: userDelete._id },
      { isActive: false },
      {
        new: true,
      }
    )
      .select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts')
      .lean()

    return {
      status: 200,
      body: userUpdated,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
}
