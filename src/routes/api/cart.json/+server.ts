import prisma from "$lib/prisma/client";
import omit from "lodash-es/omit";
import type { RequestHandler } from './$types';
import logger from '$lib/utility/logger';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const queryParams = Object.fromEntries(url.searchParams);

    let splitString
    let query: any

    if (queryParams?.id !== '') {
      splitString = queryParams?.id.split(',').map((item) => +item)
      query = {
        where: {
          id: {
            in: splitString
          },
        }
      }
    } else {
      query = {
        where: {
          id: -1
        }
      }
    }

    const productsQuery = await prisma.products.findMany(query)

    return new Response(JSON.stringify(productsQuery));

  } catch (err: any) {
    console.log('object', err);
    logger.error(`Error: ${err.message}`);
    return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      status: 500
    });
  }
};
