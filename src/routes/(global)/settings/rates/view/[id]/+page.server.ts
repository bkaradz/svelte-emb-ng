import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const currencyOptions = await prisma.options.findMany({
		where: {
			group: 'currency'
		}
	});

	const uniqueRates = await prisma.xchangeRate.findUnique({
		where: {
			id: parseInt(params.id)
		},
		include: {
			XchangeRateDetails: true
		}
	});

	return {
		currencyOptions
	};
};
