import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const queryParams = {
		limit: 3,
		page: 1
	};

	const contacts = async () => {
		return await router
			.createCaller(await createContext(event))
			.contacts.getById(parseInt(event.params.id, 10));
	};

	const corporate = async () => {
		return await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);
	};

	return {
		corporateContacts: corporate(),
		contact: contacts()
	};
}) satisfies PageServerLoad;
