import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { convertPricelist } from '$lib/utility/pricelists.utils';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const tempPricelist = await router
		.createCaller(await createContext(event))
		.pricelists.getById(parseInt(event.params.id));

	const pricelist = tempPricelist ? convertPricelist(tempPricelist) : null;

	return {
		pricelist
	};
}) satisfies PageServerLoad;
