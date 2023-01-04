import type { PageServerLoad } from './$types'
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

  const orders = await router.createCaller(await createContext(event)).orders.getOrders({});

  return {
    orders,
  };

}) satisfies PageServerLoad;