import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const products = async () => {
    return await router.createCaller(await createContext(event)).products.getProducts({});
  }

  const pricelist = async () => {
    return await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();
  }

  return {
    products: products(),
    pricelist: pricelist()
  };

}) satisfies PageServerLoad;