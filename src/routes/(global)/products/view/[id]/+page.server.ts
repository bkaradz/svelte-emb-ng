import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const product = async () => {
    return await router.createCaller(await createContext(event)).products.getById(parseInt(event.params.id));
  }

  const orders = async () => {
    return await router.createCaller(await createContext(event)).orders.getOrderLine({ productsID: event.params.id });
  }

  const pricelist = async () => {
    return await router.createCaller(await createContext(event)).pricelists.getDefaultPricelist();
  }

  return {
    product: product(),
    orders: orders(),
    pricelist: pricelist()
  };

}) satisfies PageServerLoad;