import { json as json$1 } from '@sveltejs/kit';
import logger from '$lib/utility/logger';
import csv from 'csvtojson';
import type { RequestHandler } from './$types';
import OptionsModel, { type OptionsDocument } from '$lib/models/options.models';


export const POST: RequestHandler = async ({
  request,
  locals
}): Promise<{
  status: number;
  body: { error: string } | { message: string };
}> => {
  try {
    if (!locals?.user?._id) {
      return json$1({
  message: 'Unauthorized'
}, {
        status: 401
      });
    }

    const userId = locals.user._id;

    const data = await request.formData();

    const file: FormDataEntryValue | null = data.get('options');

    if (!(Object.prototype.toString.call(file) === '[object File]')) {
      logger.error('File is empty');
      return json$1({
  message: 'File is empty'
}, {
        status: 400
      });
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

    return json$1({
  message: 'Options Uploaded'
});
  } catch (err: any) {
    logger.error(`Error: ${err.message}`)
    return json$1({
  error: `A server error occurred ${err}`,
}, {
      status: 500
    })
  }
};
