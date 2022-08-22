import { json } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  try {
    const contact = await ContactsModel.findOne({ _id: params.id }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0, userRole: 0 })
      .populate('organizationID')
      .exec()

    return json(contact);

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json({
      status: 500,
      errors: { message: `A server error occurred ${err}` }
    })
  }
}
