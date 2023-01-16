import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const products = await router.createCaller(await createContext(event)).products.getProducts({});
  const pricelist = await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();

  return {
    products,
    pricelist
  };

}) satisfies PageServerLoad;