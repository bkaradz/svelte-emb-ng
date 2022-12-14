import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const product = await router.createCaller(await createContext(event)).products.getById(parseInt(event.params.id));

  const orders = await router.createCaller(await createContext(event)).orders.getOrderLine({ productsID: event.params.id });

  return {
    product,
    orders
  };

}) satisfies PageServerLoad;