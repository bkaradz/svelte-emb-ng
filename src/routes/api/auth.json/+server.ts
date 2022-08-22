import { json as json$1 } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import type { _LeanDocument } from 'mongoose'

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
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

    return json$1(res);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    const userUpdate = await request.json()
    const userUpdated = await ContactsModel.findByIdAndUpdate({ _id: userUpdate._id }, userUpdate)
      .select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts')
      .lean()

    return json$1(userUpdated);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}

export const DELETE: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals?.user?._id) {
      return json$1({
        status: 401,
        errors: { message: 'Unauthorized' }
      })
    }

    const userDelete = await request.json()

    const userUpdated = await ContactsModel.findByIdAndUpdate(
      { _id: userDelete._id },
      { isActive: false },
      { new: true }
    ).select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts').lean()

    return json$1(userUpdated);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}
