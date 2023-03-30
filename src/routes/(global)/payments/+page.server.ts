import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {
	const limit = 15;
	const currentGlobalParams = {
		limit,
		page: 1,
		sort: 'name'
		// isInvoiced: true
	};

	const resOrders = async () => {
		return await router
			.createCaller(await createContext(event))
			.orders.getOrders(currentGlobalParams);
	};

	return {
		resOrders: resOrders()
	};
}) satisfies PageServerLoad;
