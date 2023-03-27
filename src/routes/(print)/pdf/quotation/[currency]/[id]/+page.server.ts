import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const quotationPage = async () => {
		return await router
			.createCaller(await createContext(event))
			.orders.getQuotationOrder({ id: parseInt(event.params.id), currency: event.params.currency });
	};

	return quotationPage();
}) satisfies PageServerLoad;
