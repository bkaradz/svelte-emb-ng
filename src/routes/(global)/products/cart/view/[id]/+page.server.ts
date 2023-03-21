import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const embroideryTypes = async () => {
		return await router
			.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryTypes' });
	};

	const embroideryPositions = async () => {
		return await router.createCaller(await createContext(event)).options.getOptions({ group: 'embroideryPositions' });
	};

	const queryParams = {
		limit: 7,
		page: 1
	};

	const customers = async () => {
		return await router.createCaller(await createContext(event)).contacts.getContacts(queryParams);
	};

	const pricelists = async () => {
		return await router.createCaller(await createContext(event)).pricelists.getPricelists({});
	};

	const order = async () => {
		return await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id));
	};

	return {
		order: order(),
		embroideryTypes: embroideryTypes(),
		embroideryPositions: embroideryPositions(),
		customers: customers(),
		pricelists: pricelists()
	};
}) satisfies PageServerLoad;
