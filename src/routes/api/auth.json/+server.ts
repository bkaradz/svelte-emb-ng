import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import prisma from '$lib/prisma/client';

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

    const allUsers = await prisma.contacts.findMany({
      where: {
        isUser: true
      },
      include: {
        email: true,
        phone: true,
        address: true
      }
    })

    const allUsersFinal = allUsers.map((user) => {
      const { password, ...rest } = user
      return rest
    })

    return new Response(JSON.stringify(allUsersFinal));

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

    const allUsers = await prisma.contacts.update({
      where: {
        id: parseInt(userUpdate.id)
      },
      data: {
        ...userUpdate
      }
    })

    return new Response(JSON.stringify(allUsers));

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

    const userD = await prisma.contacts.update({
      where: {
        id: parseInt(userDelete.id)
      },
      data: {
        isActive: false
      }
    })

    return new Response(JSON.stringify(userD));

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
