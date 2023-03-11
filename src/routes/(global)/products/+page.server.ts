import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const products = async () => {
		return await router.createCaller(await createContext(event)).products.getProducts({});
	};

	const pricelist = async () => {
		return await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();
	};

	return {
		products: products(),
		pricelist: pricelist()
	};
}) satisfies PageServerLoad;
