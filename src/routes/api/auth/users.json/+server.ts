import { json } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        errors: {
          message: 'Unauthorized'
        }
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

    return json(res)

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    }
  }
}
