import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import parseCsv from '$lib/utility/parseCsv';
import { getBoolean } from '$lib/utility/toBoolean';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { savePaymentTypesOptionsSchema } from '$lib/validation/savePaymentTypeOptions.validate';
import type { PaymentTypeOptions } from '@prisma/client';
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

		const createdBy = (locals.user.id);

		const data = await request.formData();

		const file = data.get('options');

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

		type PaymentTypeOptionsInter = Omit<
			PaymentTypeOptions,
			'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDefault'
		>;
		type PaymentTypeOptionsNew = PaymentTypeOptionsInter & {
			isActive: boolean | string;
			isDefault: boolean | string;
		};

		const paymentTypeOptionsArray = (await parseCsv(csvString)) as PaymentTypeOptionsNew[];

		const allDocsPromises: (PaymentTypeOptionsInter & { isActive: boolean; isDefault: boolean })[] =
			[];

		paymentTypeOptionsArray.forEach(async (element) => {
			if (typeof element.isActive === 'string') {
				element.isActive = getBoolean(element.isActive.toLowerCase());
			}

			if (typeof element.isDefault === 'string') {
				element.isDefault = getBoolean(element.isDefault.toLowerCase());
			}

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

			allDocsPromises.push({ createdBy, ...parsedPaymentTypesOptions.data });
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
