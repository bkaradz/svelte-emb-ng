import prisma from '$lib/prisma/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const currencyOptionsPromise = prisma.options.findMany({
		where: {
			group: 'currency'
		}
	});

	const uniqueRatesPromise = prisma.xchangeRate.findUnique({
		where: {
			id: parseInt(params.id)
		},
		include: {
			XchangeRateDetails: true
		}
	});

	const [resultsCurrency, resultsRates] = await Promise.all([
		currencyOptionsPromise,
		uniqueRatesPromise
	]);

	return {
		resultsCurrency,
		resultsRates
	};
};
