import logger from '$lib/utility/logger'
import type { RequestHandler } from './$types'
import prisma from '$lib/prisma/client';

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

    const queryParams = Object.fromEntries(url.searchParams)

    const objectKeys = Object.keys(queryParams)[0];

    let query: any

    if (objectKeys) {
      query = {
        where: {
          [objectKeys]: {
            contains: queryParams[objectKeys],
            mode: 'insensitive'
          },
        },
        orderBy: {
          name: 'asc',
        },
      }
    } else {
      query = {
        orderBy: {
          name: 'asc',
        },
      }
    }


    const options = await prisma.options.findMany(query)

    return new Response(JSON.stringify(options));

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

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const createDBy = locals.user.id

    const reqOptions = await request.json()

    /**
     * TODO: VALIDATION usung zod
     */

    let { name, group, value, isActive, isDefault } = reqOptions;

    name = name.trim();
    group = group.trim();
    value = value.trim();
    isActive = isActive === 'true' ? true : false
    isDefault = isDefault === 'true' ? true : false

    const option = {
      createdBy: createDBy,
      name,
      group,
      value,
      isActive,
      isDefault
    };

    const optionsQuery = await prisma.options.create({ data: option })

    return new Response(JSON.stringify(optionsQuery));

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


export const PUT: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const createDBy = locals.user.id

    const reqOptions = await request.json()

    /**
     * TODO: VALIDATION usung zod
     */

    let { name, group, value, isActive, isDefault } = reqOptions;

    name = name.trim();
    group = group.trim();
    value = value.trim();
    isActive = isActive === 'true' ? true : false
    isDefault = isDefault === 'true' ? true : false

    const option = {
      createdBy: createDBy,
      name,
      group,
      value,
      isActive,
      isDefault
    };

    const optionsQuery = await prisma.options.update({
      where: {
        id: reqOptions.id,
      },
      data: option,
    })

    return new Response(JSON.stringify(optionsQuery));

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


export const DELETE: RequestHandler = async ({
  locals,
  request,
}) => {
  try {
    if (!locals?.user?.id) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 401
      });
    }

    const createDBy = locals.user.id

    const reqOptions = await request.json()

    const optionsQuery = await prisma.options.update({
      where: {
        id: reqOptions.id,
      },
      data: { isActive: false }
    })

    return new Response(JSON.stringify(optionsQuery));

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
