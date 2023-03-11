import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const currencyOptions = async () => {
		return await router
			.createCaller(await createContext(event))
			.options.getOptions({ group: 'currency' });
	};

	return {
		currencyOptions: currencyOptions()
	};
}) satisfies PageServerLoad;
