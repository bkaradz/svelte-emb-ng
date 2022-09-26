import logger from '$lib/utility/logger';
import csv from 'csvtojson';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';

export const POST: RequestHandler = async ({
  request,
  locals
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

    const createDBy = locals.user.id;

    const data = await request.formData();

    const file = data.get('options');

    if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
      logger.error('File is empty');
      return new Response(JSON.stringify({ message: 'File is empty' }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        status: 400
      });
    }

    const csvString = await file.text();

    const jsonArray = await csv()
      .preFileLine((fileLine, idx) => fileLine)
      .fromString(csvString);

    const allDocsPromises: any[] = []

    jsonArray.forEach(async (element) => {
      let { name, group, value, isActive, isDefault } = element;

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

      allDocsPromises.push(option)
    });

    const optionsQuery = await prisma.options.createMany({ data: allDocsPromises })

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
};
