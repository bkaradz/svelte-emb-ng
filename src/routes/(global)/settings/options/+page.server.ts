import { getBoolean } from '$lib/utility/toBoolean';
import type { PageServerLoad } from './$types';
import { fail, type Actions } from '@sveltejs/kit';
import prisma from '$lib/prisma/client';
import logger from '$lib/utility/logger';
import parseCsv from '$lib/utility/parseCsv';
import type { Options } from '@prisma/client';

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

        const createDBy = locals.user.id;

        const data = await request.formData()
		const file = data.get('options')

        if (!(file instanceof File)) {
			logger.error('File is empty');
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

        const csvString: string = await file.text();

		const optionsArray = (await parseCsv(csvString)) as Options[];

		type OptionDoc = Omit<Options, 'id' | 'createdAt' | 'updatedAt'>;

		const allDocsPromises: OptionDoc[] = [];

		optionsArray.forEach(async (element) => {
			let { label, group, value, isActive, isDefault } = element as {
				label: string;
				group: string;
				value: string;
				isActive: boolean | string;
				isDefault: boolean | string;
			};

			label = label.trim();
			group = group.trim();
			value = value.trim();
			if (typeof isActive === 'string') {
				isActive = getBoolean(isActive.toLowerCase());
			}

			if (typeof isDefault === 'string') {
				isDefault = getBoolean(isDefault.toLowerCase());
			}

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

        return { success: true, payload: JSON.stringify(optionsQuery)}
    }
};