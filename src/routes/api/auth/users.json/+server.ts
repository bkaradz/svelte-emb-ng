import { json } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit';
import type { Schema, _LeanDocument } from 'mongoose';

// & <>
export const GET: RequestHandler = async ({ locals }): Promise<{status: number, body: {message: string} | {error: any} | _LeanDocument<ContactsDocument & Required<{_id: Schema.Types.ObjectId}>>}> => {
  try {
    if (!locals?.user?._id) {
      return json({
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
    // return json(res);
    return {
      status: 200,
      body: res,
    }
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
  }
}
