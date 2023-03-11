import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {
	const contact = async () => {
		return await router
			.createCaller(await createContext(event))
			.contacts.getById(parseInt(event.params.id));
	};

	const orders = async () => {
		return await router
			.createCaller(await createContext(event))
			.orders.getOrders({ customersID: event.params.id });
	};

	return {
		customer: contact(),
		orders: orders()
	};
}) satisfies PageServerLoad;
