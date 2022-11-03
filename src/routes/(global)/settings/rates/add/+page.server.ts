import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const currencyOptions = await prisma.options.findMany({
		where: {
			group: 'currency'
		}
	});

	return {
		currencyOptions
	};
};
