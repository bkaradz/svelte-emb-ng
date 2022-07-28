import logger from '$lib/utility/logger';
import csv from 'csvtojson';
import type { RequestHandler } from '@sveltejs/kit';
import OptionsModel, { type OptionsDocument } from '$lib/models/options.models';

/** @type {import('@sveltejs/kit').RequestHandler}*/
export const POST: RequestHandler = async ({
  request,
  locals
}): Promise<{
  status: number;
  body: { error: string } | { message: string };
}> => {
  try {
    if (!locals?.user?._id) {
      return {
        status: 401,
        body: {
          message: 'Unauthorized'
        }
      };
    }

    const userId = locals.user._id;

    const data = await request.formData();

    const file: FormDataEntryValue | null = data.get('options');

    if (!(Object.prototype.toString.call(file) === '[object File]')) {
      logger.error('File is empty');
      return {
        status: 400,
        body: {
          message: 'File is empty'
        }
      };
    }
    // @ts-expect-error: the above if statement catches the error if file is null
    const csvString = await file.text();

    const jsonArray = await csv()
      .preFileLine((fileLine, idx) => fileLine)
      .fromString(csvString);

    jsonArray.forEach(async (element) => {
      let { name, group, value, isActive, isDefault } = element;

      name = name.trim();
      group = group.trim();
      value = value.trim();
      isActive = isActive === 'true' ? true : false
      isDefault = isDefault === 'true' ? true : false

      const option: Partial<OptionsDocument> = {
        userID: userId,
        name,
        group,
        value,
        isActive,
        isDefault
      };

      const newOption = new OptionsModel(option);

      await newOption.save();
    });

    return {
      status: 200,
      body: {
        message: 'Options Uploaded'
      }
    };
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    return {
      status: 500,
      body: {
        error: `A server error occurred ${err}`,
      },
    }
  }
};
