import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

	const resultsCurrency = async () => {
		return await router.createCaller(await createContext(event)).options.getOptions({ group: 'currency' })
	}

	const resultsRates = async () => {
		return await router.createCaller(await createContext(event)).exchangeRate.getById(parseInt(event.params.id))
	}

	return {
		resultsCurrency: resultsCurrency(),
		resultsRates: resultsRates()
	};
}) satisfies PageServerLoad;
