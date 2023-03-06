import logger from '$lib/utility/logger';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma/client';
import parseCsv from '$lib/utility/parseCsv';
import type { PaymentTypeOptions } from '@prisma/client';
import { savePaymentTypesOptionsSchema } from '$lib/validation/savePaymentTypeOptions.validate';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';

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

		const createdBy = parseInt(locals.user.id);

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

		const paymentTypeOptionsArray = (await parseCsv(csvString)) as PaymentTypeOptions[];

		const allDocsPromises: PaymentTypeOptions[] = [];

		paymentTypeOptionsArray.forEach(async (element) => {

			element.isActive = element.isActive.toLowerCase() === 'true'
			element.isDefault = element.isDefault.toLowerCase() === 'true'

			const parsedPaymentTypesOptions = savePaymentTypesOptionsSchema.safeParse(element);

			if (!parsedPaymentTypesOptions.success) {
				const errorMap = zodErrorMessagesMap(parsedPaymentTypesOptions);

				if (errorMap) {
					// TODO: Log error
					console.log('Error Map', errorMap);
				}
				return;
			}

			// const { group, isActive, isDefault, label, value, currency } = element;

			// label = label.trim();
			// group = group.trim();
			// value = value.trim();
			// isActive = isActive.toLowerCase() === 'true' ? true : false;
			// isDefault = isDefault.toLowerCase() === 'true' ? true : false;

			// const option = {
			// 	createdBy,
			// 	label,
			// 	group,
			// 	value,
			// 	isActive,
			// 	isDefault,
			// 	currency
			// };

			allDocsPromises.push({ createdBy, ...(parsedPaymentTypesOptions.data) });
		});

		const optionsQuery = await prisma.paymentTypeOptions.createMany({ data: allDocsPromises });

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
