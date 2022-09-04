import { json } from '@sveltejs/kit';
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import prisma from '$lib/prisma/client';

export const GET: RequestHandler = async ({ params }) => {
  try {
    // const contact = await ContactsModel.findOne({ id: params.id }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0, userRole: 0 })
    //   .populate('organizationID')
    //   .exec()

    const contact = await prisma.contacts.findUnique({
      where: {
        id: params.id
      },
      include: {
        email: true,
        phone: true,
        address: true
      }
    })

    if (contact) {
      const { password, createdAt, updatedAt, userRole, ...restContact } = contact
      return new Response(JSON.stringify(restContact));
    }

    return new Response(JSON.stringify({ message: 'Contact not found' }));

  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      status: 500
    });
  }
}
