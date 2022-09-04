import { error, json } from '@sveltejs/kit';
import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types';
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
