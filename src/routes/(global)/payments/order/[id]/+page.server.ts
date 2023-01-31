import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

	const order = await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id));

	return {
		order,
	};
}) satisfies PageServerLoad;
