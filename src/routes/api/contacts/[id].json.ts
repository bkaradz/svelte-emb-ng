import ContactsModel from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from '@sveltejs/kit'

/** @type {import('./[id]').RequestHandler} */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const contact = await ContactsModel.findOne({ _id: params.id }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0, userRole: 0 })
      .populate('organizationID')
      .exec()

    return {
      status: 200,
      body: contact,
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
