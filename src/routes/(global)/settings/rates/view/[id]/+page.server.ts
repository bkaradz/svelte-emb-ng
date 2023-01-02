import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

	const resultsCurrency = await router.createCaller(await createContext(event)).options.getOptions({ group: 'currency' })

	const resultsRates = await router.createCaller(await createContext(event)).xchangeRate.getById(parseInt(event.params.id))

	return {
		resultsCurrency,
		resultsRates
	};
}) satisfies PageServerLoad;
