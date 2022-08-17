import { json as json$1 } from '@sveltejs/kit';

// @migration task: Check imports
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'
import type { Schema, _LeanDocument } from 'mongoose'

export const GET: RequestHandler = async ({ locals }): Promise<{status: number, body: {message: string} | {error: any} | (_LeanDocument<ContactsDocument & Required<{_id: Schema.Types.ObjectId}>>[]) | null }> => {
  try {
    if (!locals?.user?._id) {
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
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

export const PUT: RequestHandler = async ({ request, locals }): Promise<{status: number, body: {message: string} | {error: any} | (_LeanDocument<ContactsDocument & Required<{_id: Schema.Types.ObjectId}>>) | null }> => {
  try {
    if (!locals?.user?._id) {
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
      })
    }

    const userUpdate = await request.json()
    const userUpdated = await ContactsModel.findByIdAndUpdate({ _id: userUpdate._id }, userUpdate)
      .select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts')
      .lean()

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(userUpdated);
    return {
      status: 200,
      body: userUpdated
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

export const DELETE: RequestHandler = async ({ locals, request }): Promise<{status: number, body: {message: string} | {error: any} | (_LeanDocument<ContactsDocument & Required<{_id: Schema.Types.ObjectId}>>) | null }> => {
  try {
    if (!locals?.user?._id) {
      return json$1({
  message: 'Unauthorized',
}, {
        status: 401
      })
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

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json$1(userUpdated);
    return {
      status: 200,
      body: userUpdated,
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
