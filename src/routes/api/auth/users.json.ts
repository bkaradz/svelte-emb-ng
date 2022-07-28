import ContactsModel from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit';


export const GET: RequestHandler = async ({ locals }) => {
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
