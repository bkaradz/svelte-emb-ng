import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

	const currencyOptions = await router.createCaller(await createContext(event)).options.getOptions({ group: 'currency' })

	return {
		currencyOptions
	};
}) satisfies PageServerLoad;
