import type { PageServerLoad } from './$types';
import { fail, type Actions } from '@sveltejs/kit';
import logger from '$lib/utility/logger';
import prisma from '$lib/prisma/client';
import { savePaymentTypesOptionsSchema } from '$lib/validation/savePaymentTypeOptions.validate';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { getBoolean } from '$lib/utility/toBoolean';
import parseCsv from '$lib/utility/parseCsv';
import type { PaymentTypeOptions } from '@prisma/client';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    upload: async ({ request, locals }) => {
        if (!locals?.user?.id) {
			return fail(401, {
				message: 'Unauthorized',
				errors: {}
			})
		}

        const createdBy = locals.user.id;

		const data = await request.formData()
		const file = data.get('products')

		if (!(file instanceof File)) {
			logger.error('File is empty');
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = await file.text();

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
					logger.error(`Error: ${errorMap}`);
				}
				return;
			}

			allDocsPromises.push({ createdBy, ...parsedPaymentTypesOptions.data });
		});

		const optionsQuery = await prisma.paymentTypeOptions.createMany({ data: allDocsPromises });

        return { success: true, payload: JSON.stringify(optionsQuery) }
    }
};