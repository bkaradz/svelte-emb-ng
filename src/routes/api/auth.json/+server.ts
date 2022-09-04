import { json as json$1 } from '@sveltejs/kit';
import ContactsModel, { type ContactsDocument } from '$lib/models/contacts.model'
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import type { _LeanDocument } from 'mongoose'

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
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

    return new Response(JSON.stringify(res));

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

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const userUpdate = await request.json()
    const userUpdated = await ContactsModel.findByIdAndUpdate({ id: userUpdate.id }, userUpdate)
      .select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts')
      .lean()

    return new Response(JSON.stringify(userUpdated));

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

export const DELETE: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const userDelete = await request.json()

    const userUpdated = await ContactsModel.findByIdAndUpdate(
      { id: userDelete.id },
      { isActive: false },
      { new: true }
    ).select('-password -createdAt -updatedAt -__v -isCorporate -balanceDue -totalReceipts').lean()

    return new Response(JSON.stringify(userUpdated));

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
