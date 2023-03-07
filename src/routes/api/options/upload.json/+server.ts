import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import parseCsv from '$lib/utility/parseCsv';
import type { Options } from '@prisma/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals?.user?.id) {
			return new Response(JSON.stringify({ message: 'Unauthorized' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 401
			});
		}

		const createDBy = parseInt(locals.user.id);

		const data = await request.formData();

		const file = data.get('options');

		// if (!(Object.prototype.toString.call(file) === '[object File]') || file === null) {
		if (!(file instanceof File)) {
			logger.error('File is empty');
			return new Response(JSON.stringify({ message: 'File is empty' }), {
				headers: {
					'content-type': 'application/json; charset=utf-8'
				},
				status: 400
			});
		}

		const csvString: string = await file.text();

		const optionsArray = (await parseCsv(csvString)) as Options[];

		const allDocsPromises: Options[] = [];

		optionsArray.forEach(async (element) => {
			let { label, group, value, isActive, isDefault } = element;

			label = label.trim();
			group = group.trim();
			value = value.trim();
			isActive = isActive.toLowerCase() === 'true' ? true : false;
			isDefault = isDefault.toLowerCase() === 'true' ? true : false;

			const option = {
				createdBy: createDBy,
				label,
				group,
				value,
				isActive,
				isDefault
			};

			allDocsPromises.push(option);
		});

		const optionsQuery = await prisma.options.createMany({ data: allDocsPromises });

		return new Response(JSON.stringify(optionsQuery));
	} catch (err: any) {
		logger.error(`Error: ${err}`);
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
