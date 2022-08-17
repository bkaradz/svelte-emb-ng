import { json } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'
import type { Schema } from 'mongoose'

/** @type {import('./[id]').RequestHandler} */
export const GET: RequestHandler = async ({ params }): Promise<{status: number, body: {error: any} | (ContactsDocument & Required<{_id: Schema.Types.ObjectId}>) | null}>  => {
  try {
    const contact = await ContactsModel.findOne({ _id: params.id }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0, userRole: 0 })
      .populate('organizationID')
      .exec()

    throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
    // Suggestion (check for correctness before using):
    // return json(contact);
    return {
      status: 200,
      body: contact,
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
